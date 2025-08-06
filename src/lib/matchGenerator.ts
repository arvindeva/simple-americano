import { Player, Match, MatchGenerationStats, TeamCombination } from '@/types';
import { nanoid } from 'nanoid';

// Penalty Configuration - Adjust these values to fine-tune match generation behavior
const PENALTY_CONFIG = {
  // High penalty when both players haven't partnered with everyone yet (early tournament)
  HIGH_TEAMMATE_REPEAT_PENALTY: 20,
  // Low penalty when at least one player has partnered with everyone (late tournament)
  LOW_TEAMMATE_REPEAT_PENALTY: 2,
  // Penalty for playing same opponent multiple times (kept low to prioritize fairness)
  OPPONENT_REPEAT_PENALTY: 1
} as const;

export function generateRoundMatches(playersList: Player[], existingMatches: Match[], numberOfCourts: number): Match[] {
  if (playersList.length < numberOfCourts * 4) {
    throw new Error(`Need at least ${numberOfCourts * 4} players to generate ${numberOfCourts} matches`);
  }

  const nextRoundNumber = Math.max(0, ...existingMatches.map(match => match.roundNumber)) + 1;
  const roundMatches: Match[] = [];
  const usedPlayers = new Set<string>();

  for (let courtIndex = 0; courtIndex < numberOfCourts; courtIndex++) {
    // Calculate player stats including matches from this round
    const allMatches = [...existingMatches, ...roundMatches];
    const playerStats = calculatePlayerStats(playersList, allMatches);
    
    // Get available players for this match
    const availablePlayers = playerStats.filter(stats => !usedPlayers.has(stats.playerName));
    
    if (availablePlayers.length < 4) {
      throw new Error(`Not enough available players for match ${courtIndex + 1}`);
    }

    const selectedPlayers = selectPlayersForNextMatch(availablePlayers);
    const optimalTeams = findOptimalTeamCombination(selectedPlayers, playerStats);
    
    // Mark these players as used for this round
    [...optimalTeams.firstTeam, ...optimalTeams.secondTeam].forEach(player => {
      usedPlayers.add(player);
    });

    roundMatches.push({
      matchId: nanoid(),
      roundNumber: nextRoundNumber,
      firstTeam: optimalTeams.firstTeam,
      secondTeam: optimalTeams.secondTeam,
      matchScore: null
    });
  }

  return roundMatches;
}

export function generateFairMatch(playersList: Player[], existingMatches: Match[]): Match {
  const playerStats = calculatePlayerStats(playersList, existingMatches);
  const selectedPlayers = selectPlayersForNextMatch(playerStats);
  const optimalTeams = findOptimalTeamCombination(selectedPlayers, playerStats);
  
  const nextRoundNumber = Math.max(0, ...existingMatches.map(match => match.roundNumber)) + 1;
  
  return {
    matchId: nanoid(),
    roundNumber: nextRoundNumber,
    firstTeam: optimalTeams.firstTeam,
    secondTeam: optimalTeams.secondTeam,
    matchScore: null
  };
}

function calculatePlayerStats(playersList: Player[], existingMatches: Match[]): MatchGenerationStats[] {
  return playersList.map(player => {
    const playerName = player.name;
    const teammateCount: Record<string, number> = {};
    const opponentCount: Record<string, number> = {};
    const partnersPlayedWith = new Set<string>();
    let gamesPlayed = 0;
    
    existingMatches.forEach(match => {
      const isInFirstTeam = match.firstTeam.includes(playerName);
      const isInSecondTeam = match.secondTeam.includes(playerName);
      
      if (isInFirstTeam || isInSecondTeam) {
        // Calculate gamesPlayed from actual match participation
        gamesPlayed++;
        
        if (isInFirstTeam) {
          match.firstTeam.forEach(teammate => {
            if (teammate !== playerName) {
              teammateCount[teammate] = (teammateCount[teammate] || 0) + 1;
              partnersPlayedWith.add(teammate);
            }
          });
          match.secondTeam.forEach(opponent => {
            opponentCount[opponent] = (opponentCount[opponent] || 0) + 1;
          });
        } else if (isInSecondTeam) {
          match.secondTeam.forEach(teammate => {
            if (teammate !== playerName) {
              teammateCount[teammate] = (teammateCount[teammate] || 0) + 1;
              partnersPlayedWith.add(teammate);
            }
          });
          match.firstTeam.forEach(opponent => {
            opponentCount[opponent] = (opponentCount[opponent] || 0) + 1;
          });
        }
      }
    });
    
    return {
      playerName,
      gamesPlayed, // Now calculated from existingMatches instead of relying on player.gamesPlayed
      teammateCount,
      opponentCount,
      partnersPlayedWith
    };
  });
}

function selectPlayersForNextMatch(playerStats: MatchGenerationStats[]): string[] {
  if (playerStats.length < 4) {
    throw new Error('Need at least 4 players to generate a match');
  }
  
  const minimumGamesPlayed = Math.min(...playerStats.map(stats => stats.gamesPlayed));
  let eligiblePlayers = playerStats.filter(stats => stats.gamesPlayed === minimumGamesPlayed);
  
  if (eligiblePlayers.length < 4) {
    const sortedByGames = [...playerStats].sort((a, b) => a.gamesPlayed - b.gamesPlayed);
    eligiblePlayers = sortedByGames.slice(0, 4);
  }
  
  // Use Fisher-Yates shuffle for better randomization
  const shuffledEligiblePlayers = [...eligiblePlayers];
  for (let i = shuffledEligiblePlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledEligiblePlayers[i], shuffledEligiblePlayers[j]] = [shuffledEligiblePlayers[j], shuffledEligiblePlayers[i]];
  }
  
  return shuffledEligiblePlayers.slice(0, 4).map(stats => stats.playerName);
}

function findOptimalTeamCombination(selectedPlayers: string[], playerStats: MatchGenerationStats[]): TeamCombination {
  if (selectedPlayers.length !== 4) {
    throw new Error('Exactly 4 players required for team combination');
  }
  
  const [firstPlayer, secondPlayer, thirdPlayer, fourthPlayer] = selectedPlayers;
  
  if (!firstPlayer || !secondPlayer || !thirdPlayer || !fourthPlayer) {
    throw new Error('All player names must be valid');
  }
  
  const possibleCombinations: TeamCombination[] = [
    {
      firstTeam: [firstPlayer, secondPlayer],
      secondTeam: [thirdPlayer, fourthPlayer],
      combinationScore: 0
    },
    {
      firstTeam: [firstPlayer, thirdPlayer],
      secondTeam: [secondPlayer, fourthPlayer],
      combinationScore: 0
    },
    {
      firstTeam: [firstPlayer, fourthPlayer],
      secondTeam: [secondPlayer, thirdPlayer],
      combinationScore: 0
    }
  ];
  
  possibleCombinations.forEach(combination => {
    combination.combinationScore = calculateCombinationScore(combination, playerStats);
  });
  
  // Find the best score
  const bestScore = Math.max(...possibleCombinations.map(c => c.combinationScore));
  const bestCombinations = possibleCombinations.filter(c => c.combinationScore === bestScore);
  
  // If multiple combinations have the same score (like in the first match), pick randomly
  const randomIndex = Math.floor(Math.random() * bestCombinations.length);
  return bestCombinations[randomIndex];
}

function calculateCombinationScore(combination: TeamCombination, playerStats: MatchGenerationStats[]): number {
  let totalScore = 0;
  
  const playerStatsMap = new Map(playerStats.map(stats => [stats.playerName, stats]));
  
  // Fairness priority: Subtract games played (main driver)
  [...combination.firstTeam, ...combination.secondTeam].forEach(playerName => {
    const playerStat = playerStatsMap.get(playerName);
    if (playerStat) {
      totalScore -= playerStat.gamesPlayed;
    }
  });
  
  const [firstTeamPlayer1, firstTeamPlayer2] = combination.firstTeam;
  const [secondTeamPlayer1, secondTeamPlayer2] = combination.secondTeam;
  
  const firstTeamPlayer1Stats = playerStatsMap.get(firstTeamPlayer1);
  const firstTeamPlayer2Stats = playerStatsMap.get(firstTeamPlayer2);
  const secondTeamPlayer1Stats = playerStatsMap.get(secondTeamPlayer1);
  const secondTeamPlayer2Stats = playerStatsMap.get(secondTeamPlayer2);
  
  // Calculate total possible partners (excluding self)
  const maxPartners = playerStats.length - 1;
  
  // Scaled penalty for first team teammate repeats
  if (firstTeamPlayer1Stats && firstTeamPlayer2Stats) {
    const repeats = firstTeamPlayer1Stats.teammateCount[firstTeamPlayer2] || 0;
    const p1Coverage = firstTeamPlayer1Stats.partnersPlayedWith.size;
    const p2Coverage = firstTeamPlayer2Stats.partnersPlayedWith.size;
    
    // High penalty if both players haven't teamed with everyone yet, low penalty otherwise
    const penalty = (p1Coverage < maxPartners && p2Coverage < maxPartners) 
      ? PENALTY_CONFIG.HIGH_TEAMMATE_REPEAT_PENALTY 
      : PENALTY_CONFIG.LOW_TEAMMATE_REPEAT_PENALTY;
    totalScore -= penalty * repeats;
  }
  
  // Scaled penalty for second team teammate repeats
  if (secondTeamPlayer1Stats && secondTeamPlayer2Stats) {
    const repeats = secondTeamPlayer1Stats.teammateCount[secondTeamPlayer2] || 0;
    const p1Coverage = secondTeamPlayer1Stats.partnersPlayedWith.size;
    const p2Coverage = secondTeamPlayer2Stats.partnersPlayedWith.size;
    
    // High penalty if both players haven't teamed with everyone yet, low penalty otherwise
    const penalty = (p1Coverage < maxPartners && p2Coverage < maxPartners) 
      ? PENALTY_CONFIG.HIGH_TEAMMATE_REPEAT_PENALTY 
      : PENALTY_CONFIG.LOW_TEAMMATE_REPEAT_PENALTY;
    totalScore -= penalty * repeats;
  }
  
  // Keep opponent repeat penalty low to maintain fairness priority
  combination.firstTeam.forEach(firstTeamPlayer => {
    combination.secondTeam.forEach(secondTeamPlayer => {
      const playerStat = playerStatsMap.get(firstTeamPlayer);
      if (playerStat) {
        const opponentRepeats = playerStat.opponentCount[secondTeamPlayer] || 0;
        totalScore -= PENALTY_CONFIG.OPPONENT_REPEAT_PENALTY * opponentRepeats;
      }
    });
  });
  
  return totalScore;
}