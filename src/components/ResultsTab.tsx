"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmericanoSession } from "@/types";
import { generateLeaderboard, LeaderboardPlayer } from "@/lib/leaderboardUtils";

interface ResultsTabProps {
  session: AmericanoSession;
}

export default function ResultsTab({ session }: ResultsTabProps) {
  const leaderboardPlayers = generateLeaderboard(
    session.playersList,
    session.matchesList
  );

  const sortedPlayersByPoints = [...leaderboardPlayers].sort(
    (playerA, playerB) => {
      if (playerB.totalPoints !== playerA.totalPoints) {
        return playerB.totalPoints - playerA.totalPoints;
      }
      return playerB.gamesPlayed - playerA.gamesPlayed;
    }
  );

  const getRankingPosition = (
    index: number,
    currentPlayer: LeaderboardPlayer,
    allPlayers: LeaderboardPlayer[]
  ) => {
    if (index === 0) return 1;

    const previousPlayer = allPlayers[index - 1];
    if (
      currentPlayer.totalPoints === previousPlayer.totalPoints &&
      currentPlayer.gamesPlayed === previousPlayer.gamesPlayed
    ) {
      return getRankingPosition(index - 1, previousPlayer, allPlayers);
    }

    return index + 1;
  };

  const getTotalGamesCount = () => {
    return session.matchesList.filter((match) => match.matchScore !== null)
      .length;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between pt-2 gap-3">
        <h2 className="text-base sm:text-lg font-semibold">
          Tournament Results
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground shrink-0">
          {getTotalGamesCount()} matches completed
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-3 mb-2 sm:mb-3 bg-muted/50 rounded-lg text-xs sm:text-sm font-medium text-muted-foreground">
            <div className="pl-4">Name</div>
            <div className="text-center">W-L-T</div>
            <div className="text-center">Games</div>
            <div className="text-center">Points</div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {sortedPlayersByPoints.map((player, index) => {
              const ranking = getRankingPosition(
                index,
                player,
                sortedPlayersByPoints
              );
              const isTopPlayer = ranking === 1;

              return (
                <div
                  key={player.name}
                  className={`grid grid-cols-4 gap-2 sm:gap-4 items-center p-2 sm:p-3 rounded-lg ${
                    isTopPlayer
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800"
                      : "bg-muted"
                  }`}
                >
                  {/* Name column with rank */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
                      {ranking}.
                    </span>
                    <span className={`font-medium text-sm sm:text-base truncate ${
                      isTopPlayer ? "text-yellow-700 dark:text-yellow-300" : ""
                    }`}>
                      {player.name}
                    </span>
                  </div>

                  {/* W-L-T column */}
                  <div className="text-center">
                    <span className="text-xs sm:text-sm font-mono">
                      {player.wins}-{player.losses}-{player.ties}
                    </span>
                  </div>

                  {/* Games Played column */}
                  <div className="text-center">
                    <span className="text-xs sm:text-sm">
                      {player.gamesPlayed}
                    </span>
                  </div>

                  {/* Points column */}
                  <div className="text-center">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        isTopPlayer
                          ? "text-yellow-700 dark:text-yellow-300"
                          : ""
                      }`}
                    >
                      {player.totalPoints}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedPlayersByPoints.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players in tournament
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Tournament Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Total Players</p>
              <p className="text-base sm:text-lg font-semibold">
                {session.playersList.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Matches Played</p>
              <p className="text-base sm:text-lg font-semibold">
                {getTotalGamesCount()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Current Round</p>
              <p className="text-base sm:text-lg font-semibold">
                {session.currentRoundNumber}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Points per Game</p>
              <p className="text-base sm:text-lg font-semibold">
                {session.pointsPerGame}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
