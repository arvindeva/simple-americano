import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { AmericanoSession, SessionStore, Match, Player } from '@/types';
import { generateFairMatch, generateRoundMatches } from '@/lib/matchGenerator';

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessionsMap: {},
      
      createSession: (newSession: AmericanoSession) => {
        set((state) => ({
          sessionsMap: {
            ...state.sessionsMap,
            [newSession.sessionId]: newSession
          }
        }));
      },

      findSessionByOriginalId: (originalSessionId: string) => {
        const { sessionsMap } = get();
        return Object.values(sessionsMap).find(
          session => session.originalSessionId === originalSessionId || session.sessionId === originalSessionId
        ) || null;
      },

      createOrUpdateSession: (newSession: AmericanoSession) => {
        const { sessionsMap, findSessionByOriginalId, createSession, updateSession } = get();
        
        // Ensure originalSessionId exists (backward compatibility)
        const sessionWithOriginalId = {
          ...newSession,
          originalSessionId: newSession.originalSessionId || newSession.sessionId
        };

        // Check if session with same original ID already exists
        const existingSession = findSessionByOriginalId(sessionWithOriginalId.originalSessionId);
        
        if (existingSession) {
          // Update existing session with new data, keep existing sessionId
          updateSession(existingSession.sessionId, {
            ...sessionWithOriginalId,
            sessionId: existingSession.sessionId // Preserve local sessionId
          });
          return existingSession.sessionId;
        } else {
          // Create new session
          createSession(sessionWithOriginalId);
          return sessionWithOriginalId.sessionId;
        }
      },
      
      updateSession: (sessionId: string, sessionUpdates: Partial<AmericanoSession>) => {
        set((state) => ({
          sessionsMap: {
            ...state.sessionsMap,
            [sessionId]: {
              ...state.sessionsMap[sessionId],
              ...sessionUpdates
            }
          }
        }));
      },
      
      addMatchToSession: (sessionId: string, newMatch: Match) => {
        set((state) => {
          const currentSession = state.sessionsMap[sessionId];
          if (!currentSession) return state;
          
          return {
            sessionsMap: {
              ...state.sessionsMap,
              [sessionId]: {
                ...currentSession,
                matchesList: [...currentSession.matchesList, newMatch],
                currentRoundNumber: Math.max(currentSession.currentRoundNumber, newMatch.roundNumber)
              }
            }
          };
        });
      },
      
      updateMatchScore: (sessionId: string, matchId: string, newScore: [number, number]) => {
        set((state) => {
          const currentSession = state.sessionsMap[sessionId];
          if (!currentSession) return state;
          
          const updatedMatches = currentSession.matchesList.map(match => 
            match.matchId === matchId 
              ? { ...match, matchScore: newScore }
              : match
          );
          
          return {
            sessionsMap: {
              ...state.sessionsMap,
              [sessionId]: {
                ...currentSession,
                matchesList: updatedMatches
              }
            }
          };
        });
      },
      
      generateNextMatch: (sessionId: string) => {
        const { sessionsMap } = get();
        const currentSession = sessionsMap[sessionId];
        if (!currentSession) return;
        
        try {
          const roundMatches = generateRoundMatches(
            currentSession.playersList, 
            currentSession.matchesList,
            currentSession.numberOfCourts
          );
          
          const allPlayersInRound = new Set<string>();
          roundMatches.forEach(match => {
            [...match.firstTeam, ...match.secondTeam].forEach(player => {
              allPlayersInRound.add(player);
            });
          });
          
          const updatedPlayers = currentSession.playersList.map(player => {
            const isPlayerInRound = allPlayersInRound.has(player.name);
            return isPlayerInRound 
              ? { ...player, gamesPlayed: player.gamesPlayed + 1 }
              : player;
          });
          
          set((state) => ({
            sessionsMap: {
              ...state.sessionsMap,
              [sessionId]: {
                ...currentSession,
                matchesList: [...currentSession.matchesList, ...roundMatches],
                playersList: updatedPlayers,
                currentRoundNumber: Math.max(currentSession.currentRoundNumber, ...roundMatches.map(m => m.roundNumber))
              }
            }
          }));
        } catch (error) {
          console.error('Failed to generate next round:', error);
        }
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const newSessionsMap = { ...state.sessionsMap };
          delete newSessionsMap[sessionId];
          return {
            sessionsMap: newSessionsMap
          };
        });
      }
    }),
    {
      name: 'padel-sessions',
      partialize: (state) => ({ sessionsMap: state.sessionsMap })
    }
  )
);