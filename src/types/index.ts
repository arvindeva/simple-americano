export interface Player {
  name: string;
  gamesPlayed: number;
}

export interface Match {
  matchId: string;
  roundNumber: number;
  firstTeam: string[];
  secondTeam: string[];
  matchScore: [number, number] | null;
}

export interface AmericanoSession {
  sessionId: string;
  tournamentName: string;
  numberOfCourts: number;
  pointsPerGame: number;
  playersList: Player[];
  matchesList: Match[];
  currentRoundNumber: number;
  sessionCreatedAt: string;
}

export interface SessionStore {
  sessionsMap: Record<string, AmericanoSession>;
  createSession(newSession: AmericanoSession): void;
  updateSession(
    sessionId: string,
    sessionUpdates: Partial<AmericanoSession>
  ): void;
  addMatchToSession(sessionId: string, newMatch: Match): void;
  updateMatchScore(
    sessionId: string,
    matchId: string,
    newScore: [number, number]
  ): void;
  generateNextMatch(sessionId: string): void;
  deleteSession(sessionId: string): void;
}

export interface MatchGenerationStats {
  playerName: string;
  gamesPlayed: number;
  teammateCount: Record<string, number>;
  opponentCount: Record<string, number>;
}

export interface TeamCombination {
  firstTeam: string[];
  secondTeam: string[];
  combinationScore: number;
}
