import { Player, Match } from '@/types';

export interface LeaderboardPlayer {
  name: string;
  gamesPlayed: number;
  totalPoints: number;
}

export function calculatePlayerPoints(playerName: string, matches: Match[]): number {
  let totalPoints = 0;
  
  matches.forEach(match => {
    if (!match.matchScore) return; // Skip matches without scores
    
    const isInFirstTeam = match.firstTeam.includes(playerName);
    const isInSecondTeam = match.secondTeam.includes(playerName);
    
    if (isInFirstTeam) {
      totalPoints += match.matchScore[0];
    } else if (isInSecondTeam) {
      totalPoints += match.matchScore[1];
    }
  });
  
  return totalPoints;
}

export function generateLeaderboard(players: Player[], matches: Match[]): LeaderboardPlayer[] {
  return players.map(player => ({
    name: player.name,
    gamesPlayed: player.gamesPlayed,
    totalPoints: calculatePlayerPoints(player.name, matches)
  }));
}