import { Player, Match } from '@/types';

export interface LeaderboardPlayer {
  name: string;
  gamesPlayed: number;
  totalPoints: number;
  wins: number;
  losses: number;
  ties: number;
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

export function calculatePlayerWLT(playerName: string, matches: Match[]): { wins: number; losses: number; ties: number } {
  let wins = 0;
  let losses = 0;
  let ties = 0;
  
  matches.forEach(match => {
    if (!match.matchScore) return; // Skip matches without scores
    
    const isInFirstTeam = match.firstTeam.includes(playerName);
    const isInSecondTeam = match.secondTeam.includes(playerName);
    
    if (!isInFirstTeam && !isInSecondTeam) return; // Player not in this match
    
    const [firstTeamScore, secondTeamScore] = match.matchScore;
    
    if (firstTeamScore === secondTeamScore) {
      ties++;
    } else if (
      (isInFirstTeam && firstTeamScore > secondTeamScore) ||
      (isInSecondTeam && secondTeamScore > firstTeamScore)
    ) {
      wins++;
    } else {
      losses++;
    }
  });
  
  return { wins, losses, ties };
}

export function calculatePlayerGamesPlayed(playerName: string, matches: Match[]): number {
  let gamesPlayed = 0;
  
  matches.forEach(match => {
    // Only count matches that have been played (have a score and it's not 0-0)
    if (!match.matchScore) return;
    
    const [firstTeamScore, secondTeamScore] = match.matchScore;
    
    // Skip matches that are still 0-0 (generated but not played)
    if (firstTeamScore === 0 && secondTeamScore === 0) return;
    
    const isInFirstTeam = match.firstTeam.includes(playerName);
    const isInSecondTeam = match.secondTeam.includes(playerName);
    
    if (isInFirstTeam || isInSecondTeam) {
      gamesPlayed++;
    }
  });
  
  return gamesPlayed;
}

export function generateLeaderboard(players: Player[], matches: Match[]): LeaderboardPlayer[] {
  return players.map(player => {
    const wlt = calculatePlayerWLT(player.name, matches);
    return {
      name: player.name,
      gamesPlayed: calculatePlayerGamesPlayed(player.name, matches), // Use actual completed games
      totalPoints: calculatePlayerPoints(player.name, matches),
      wins: wlt.wins,
      losses: wlt.losses,
      ties: wlt.ties
    };
  });
}