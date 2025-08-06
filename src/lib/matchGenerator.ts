import { Player, Match, MatchGenerationStats, TeamCombination } from "@/types";
import { nanoid } from "nanoid";

// Debug mode toggle
const DEBUG = true;

// Penalty Configuration
const PENALTY_CONFIG = {
  HIGH_TEAMMATE_REPEAT_PENALTY: 20,
  LOW_TEAMMATE_REPEAT_PENALTY: 2,
  OPPONENT_REPEAT_PENALTY: 1,
} as const;

export function generateRoundMatches(
  playersList: Player[],
  existingMatches: Match[],
  numberOfCourts: number
): Match[] {
  if (playersList.length < numberOfCourts * 4) {
    throw new Error(
      `Need at least ${
        numberOfCourts * 4
      } players to generate ${numberOfCourts} matches`
    );
  }

  const nextRoundNumber =
    Math.max(0, ...existingMatches.map((match) => match.roundNumber)) + 1;
  const roundMatches: Match[] = [];
  const usedPlayers = new Set<string>();

  for (let courtIndex = 0; courtIndex < numberOfCourts; courtIndex++) {
    const allMatches = [...existingMatches, ...roundMatches];
    const playerStats = calculatePlayerStats(playersList, allMatches);

    const availablePlayers = playerStats.filter(
      (stats) => !usedPlayers.has(stats.playerName)
    );

    // Shuffle available players for court assignment fairness
    for (let i = availablePlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePlayers[i], availablePlayers[j]] = [
        availablePlayers[j],
        availablePlayers[i],
      ];
    }

    if (availablePlayers.length < 4) {
      throw new Error(
        `Not enough available players for match ${courtIndex + 1}`
      );
    }

    const selectedPlayers = selectPlayersForNextMatch(availablePlayers);
    const optimalTeams = findOptimalTeamCombination(
      selectedPlayers,
      playerStats
    );

    [...optimalTeams.firstTeam, ...optimalTeams.secondTeam].forEach(
      (player) => {
        usedPlayers.add(player);
      }
    );

    if (DEBUG) {
      console.log(
        `\n--- Match ${courtIndex + 1}, Round ${nextRoundNumber} ---`
      );
      console.log(`Selected Players: ${selectedPlayers.join(", ")}`);
      console.log(`First Team: ${optimalTeams.firstTeam.join(" & ")}`);
      console.log(`Second Team: ${optimalTeams.secondTeam.join(" & ")}`);
    }

    roundMatches.push({
      matchId: nanoid(),
      roundNumber: nextRoundNumber,
      firstTeam: optimalTeams.firstTeam,
      secondTeam: optimalTeams.secondTeam,
      matchScore: null,
    });
  }

  // NEW: print accumulated pair history from all matches so far
  if (DEBUG) {
    logPairHistory(playersList, [...existingMatches, ...roundMatches]);
  }

  return roundMatches;
}

export function generateFairMatch(
  playersList: Player[],
  existingMatches: Match[]
): Match {
  const playerStats = calculatePlayerStats(playersList, existingMatches);
  const selectedPlayers = selectPlayersForNextMatch(playerStats);
  const optimalTeams = findOptimalTeamCombination(selectedPlayers, playerStats);

  const nextRoundNumber =
    Math.max(0, ...existingMatches.map((match) => match.roundNumber)) + 1;

  return {
    matchId: nanoid(),
    roundNumber: nextRoundNumber,
    firstTeam: optimalTeams.firstTeam,
    secondTeam: optimalTeams.secondTeam,
    matchScore: null,
  };
}

function calculatePlayerStats(
  playersList: Player[],
  existingMatches: Match[]
): MatchGenerationStats[] {
  return playersList.map((player) => {
    const playerName = player.name;
    const teammateCount: Record<string, number> = {};
    const opponentCount: Record<string, number> = {};
    const partnersPlayedWith = new Set<string>();
    let gamesPlayed = 0;

    existingMatches.forEach((match) => {
      const isInFirstTeam = match.firstTeam.includes(playerName);
      const isInSecondTeam = match.secondTeam.includes(playerName);

      if (isInFirstTeam || isInSecondTeam) {
        gamesPlayed++;

        if (isInFirstTeam) {
          match.firstTeam.forEach((teammate) => {
            if (teammate !== playerName) {
              teammateCount[teammate] = (teammateCount[teammate] || 0) + 1;
              partnersPlayedWith.add(teammate);
            }
          });
          match.secondTeam.forEach((opponent) => {
            opponentCount[opponent] = (opponentCount[opponent] || 0) + 1;
          });
        } else if (isInSecondTeam) {
          match.secondTeam.forEach((teammate) => {
            if (teammate !== playerName) {
              teammateCount[teammate] = (teammateCount[teammate] || 0) + 1;
              partnersPlayedWith.add(teammate);
            }
          });
          match.firstTeam.forEach((opponent) => {
            opponentCount[opponent] = (opponentCount[opponent] || 0) + 1;
          });
        }
      }
    });

    return {
      playerName,
      gamesPlayed,
      teammateCount,
      opponentCount,
      partnersPlayedWith,
    };
  });
}

// Force at least one unplayed partner for fairness anchor
function selectPlayersForNextMatch(
  playerStats: MatchGenerationStats[]
): string[] {
  if (playerStats.length < 4)
    throw new Error("Need at least 4 players to generate a match");

  const anchorPlayer = [...playerStats].sort(
    (a, b) => a.gamesPlayed - b.gamesPlayed
  )[0];

  const unplayedPartners = playerStats
    .filter(
      (p) =>
        p.playerName !== anchorPlayer.playerName &&
        !anchorPlayer.partnersPlayedWith.has(p.playerName)
    )
    .sort((a, b) => a.gamesPlayed - b.gamesPlayed);

  const selected: MatchGenerationStats[] = [anchorPlayer];
  let forcedPartner: string | null = null;
  if (unplayedPartners.length > 0) {
    selected.push(unplayedPartners[0]);
    forcedPartner = unplayedPartners[0].playerName;
  }

  const remaining = playerStats
    .filter((p) => !selected.includes(p))
    .sort((a, b) => a.gamesPlayed - b.gamesPlayed);

  selected.push(...remaining.slice(0, 4 - selected.length));

  const others = selected.slice(1);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }

  if (DEBUG) {
    console.log(`\nAnchor Player: ${anchorPlayer.playerName}`);
    if (forcedPartner) {
      console.log(`Forced Unplayed Partner: ${forcedPartner}`);
    } else {
      console.log(`No unplayed partner available for anchor`);
    }
    console.log(
      `Filled Remaining Slots With: ${others
        .map((p) => p.playerName)
        .join(", ")}`
    );
  }

  return [anchorPlayer.playerName, ...others.map((s) => s.playerName)];
}

// Hard teammate coverage rule
function findOptimalTeamCombination(
  selectedPlayers: string[],
  playerStats: MatchGenerationStats[]
): TeamCombination {
  if (selectedPlayers.length !== 4)
    throw new Error("Exactly 4 players required");

  const playerStatsMap = new Map(playerStats.map((s) => [s.playerName, s]));
  const maxPartners = playerStats.length - 1;

  const combinations: TeamCombination[] = [
    {
      firstTeam: [selectedPlayers[0], selectedPlayers[1]],
      secondTeam: [selectedPlayers[2], selectedPlayers[3]],
      combinationScore: 0,
    },
    {
      firstTeam: [selectedPlayers[0], selectedPlayers[2]],
      secondTeam: [selectedPlayers[1], selectedPlayers[3]],
      combinationScore: 0,
    },
    {
      firstTeam: [selectedPlayers[0], selectedPlayers[3]],
      secondTeam: [selectedPlayers[1], selectedPlayers[2]],
      combinationScore: 0,
    },
  ];

  const filtered = combinations.filter(({ firstTeam, secondTeam }) => {
    const [f1, f2] = firstTeam;
    const [s1, s2] = secondTeam;

    const f1Stats = playerStatsMap.get(f1)!;
    const f2Stats = playerStatsMap.get(f2)!;
    const s1Stats = playerStatsMap.get(s1)!;
    const s2Stats = playerStatsMap.get(s2)!;

    const fRepeat = (f1Stats.teammateCount[f2] || 0) > 0;
    const sRepeat = (s1Stats.teammateCount[s2] || 0) > 0;

    const fHasUnplayed =
      f1Stats.partnersPlayedWith.size < maxPartners &&
      f2Stats.partnersPlayedWith.size < maxPartners;
    const sHasUnplayed =
      s1Stats.partnersPlayedWith.size < maxPartners &&
      s2Stats.partnersPlayedWith.size < maxPartners;

    return !(fRepeat && fHasUnplayed) && !(sRepeat && sHasUnplayed);
  });

  if (DEBUG) {
    console.log(
      `Filtered Out ${
        combinations.length - filtered.length
      } Invalid Combinations`
    );
  }

  const candidates = filtered.length > 0 ? filtered : combinations;

  candidates.forEach((c) => {
    c.combinationScore = calculateCombinationScore(c, playerStats);
  });

  const bestScore = Math.max(...candidates.map((c) => c.combinationScore));
  const bestCombinations = candidates.filter(
    (c) => c.combinationScore === bestScore
  );

  return bestCombinations[Math.floor(Math.random() * bestCombinations.length)];
}

function calculateCombinationScore(
  combination: TeamCombination,
  playerStats: MatchGenerationStats[]
): number {
  let totalScore = 0;

  const playerStatsMap = new Map(
    playerStats.map((stats) => [stats.playerName, stats])
  );

  [...combination.firstTeam, ...combination.secondTeam].forEach(
    (playerName) => {
      const playerStat = playerStatsMap.get(playerName);
      if (playerStat) {
        totalScore -= playerStat.gamesPlayed;
      }
    }
  );

  const [f1, f2] = combination.firstTeam;
  const [s1, s2] = combination.secondTeam;

  const f1Stats = playerStatsMap.get(f1);
  const f2Stats = playerStatsMap.get(f2);
  const s1Stats = playerStatsMap.get(s1);
  const s2Stats = playerStatsMap.get(s2);

  const maxPartners = playerStats.length - 1;

  if (f1Stats && f2Stats) {
    const repeats = f1Stats.teammateCount[f2] || 0;
    const penalty =
      f1Stats.partnersPlayedWith.size < maxPartners &&
      f2Stats.partnersPlayedWith.size < maxPartners
        ? PENALTY_CONFIG.HIGH_TEAMMATE_REPEAT_PENALTY
        : PENALTY_CONFIG.LOW_TEAMMATE_REPEAT_PENALTY;
    totalScore -= penalty * repeats;
  }

  if (s1Stats && s2Stats) {
    const repeats = s1Stats.teammateCount[s2] || 0;
    const penalty =
      s1Stats.partnersPlayedWith.size < maxPartners &&
      s2Stats.partnersPlayedWith.size < maxPartners
        ? PENALTY_CONFIG.HIGH_TEAMMATE_REPEAT_PENALTY
        : PENALTY_CONFIG.LOW_TEAMMATE_REPEAT_PENALTY;
    totalScore -= penalty * repeats;
  }

  combination.firstTeam.forEach((ftPlayer) => {
    combination.secondTeam.forEach((stPlayer) => {
      const playerStat = playerStatsMap.get(ftPlayer);
      if (playerStat) {
        const opponentRepeats = playerStat.opponentCount[stPlayer] || 0;
        totalScore -= PENALTY_CONFIG.OPPONENT_REPEAT_PENALTY * opponentRepeats;
      }
    });
  });

  return totalScore;
}

// NEW: Derive and log full pair history from matches
function logPairHistory(playersList: Player[], matches: Match[]) {
  const pairHistory = new Map<string, string[]>();
  playersList.forEach((p) => pairHistory.set(p.name, []));

  matches.forEach((match) => {
    const addPair = (p1: string, p2: string) => {
      pairHistory.get(p1)?.push(p2);
    };
    addPair(match.firstTeam[0], match.firstTeam[1]);
    addPair(match.firstTeam[1], match.firstTeam[0]);
    addPair(match.secondTeam[0], match.secondTeam[1]);
    addPair(match.secondTeam[1], match.secondTeam[0]);
  });

  console.log(`\n=== PAIR HISTORY ===`);
  for (const [player, partners] of pairHistory.entries()) {
    console.log(`${player}'s pair: ${partners.join("")}`);
  }
}
