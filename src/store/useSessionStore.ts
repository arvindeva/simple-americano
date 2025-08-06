import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { AmericanoSession, SessionStore, Match, Player } from '@/types';
import { generateFairMatch } from '@/lib/matchGenerator';

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
      
      updateMatchScore: (sessionId: string, roundNumber: number, newScore: [number, number]) => {
        set((state) => {
          const currentSession = state.sessionsMap[sessionId];
          if (!currentSession) return state;
          
          const updatedMatches = currentSession.matchesList.map(match => 
            match.roundNumber === roundNumber 
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
          const nextMatch = generateFairMatch(currentSession.playersList, currentSession.matchesList);
          
          const updatedPlayers = currentSession.playersList.map(player => {
            const isPlayerInMatch = nextMatch.firstTeam.includes(player.name) || nextMatch.secondTeam.includes(player.name);
            return isPlayerInMatch 
              ? { ...player, gamesPlayed: player.gamesPlayed + 1 }
              : player;
          });
          
          set((state) => ({
            sessionsMap: {
              ...state.sessionsMap,
              [sessionId]: {
                ...currentSession,
                matchesList: [...currentSession.matchesList, nextMatch],
                playersList: updatedPlayers,
                currentRoundNumber: Math.max(currentSession.currentRoundNumber, nextMatch.roundNumber)
              }
            }
          }));
        } catch (error) {
          console.error('Failed to generate next match:', error);
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