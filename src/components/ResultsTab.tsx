'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AmericanoSession } from '@/types';
import { generateLeaderboard, LeaderboardPlayer } from '@/lib/leaderboardUtils';

interface ResultsTabProps {
  session: AmericanoSession;
}

export default function ResultsTab({ session }: ResultsTabProps) {
  const leaderboardPlayers = generateLeaderboard(session.playersList, session.matchesList);
  
  const sortedPlayersByPoints = [...leaderboardPlayers].sort((playerA, playerB) => {
    if (playerB.totalPoints !== playerA.totalPoints) {
      return playerB.totalPoints - playerA.totalPoints;
    }
    return playerB.gamesPlayed - playerA.gamesPlayed;
  });

  const getRankingPosition = (index: number, currentPlayer: LeaderboardPlayer, allPlayers: LeaderboardPlayer[]) => {
    if (index === 0) return 1;
    
    const previousPlayer = allPlayers[index - 1];
    if (currentPlayer.totalPoints === previousPlayer.totalPoints && currentPlayer.gamesPlayed === previousPlayer.gamesPlayed) {
      return getRankingPosition(index - 1, previousPlayer, allPlayers);
    }
    
    return index + 1;
  };

  const getTotalGamesCount = () => {
    return session.matchesList.filter(match => match.matchScore !== null).length;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold">Tournament Results</h2>
        <div className="text-xs sm:text-sm text-muted-foreground shrink-0">
          {getTotalGamesCount()} matches completed
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {sortedPlayersByPoints.map((player, index) => {
              const ranking = getRankingPosition(index, player, sortedPlayersByPoints);
              const isTopPlayer = ranking === 1;
              
              return (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                    isTopPlayer 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                      isTopPlayer 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {ranking}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{player.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {player.gamesPlayed} games played
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className={`text-base sm:text-lg font-bold ${
                      isTopPlayer ? 'text-yellow-700 dark:text-yellow-300' : ''
                    }`}>
                      {player.totalPoints}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">points</div>
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
          <CardTitle className="text-base sm:text-lg">Tournament Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Total Players</p>
              <p className="text-base sm:text-lg font-semibold">{session.playersList.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Matches Played</p>
              <p className="text-base sm:text-lg font-semibold">{getTotalGamesCount()}</p>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Current Round</p>
              <p className="text-base sm:text-lg font-semibold">{session.currentRoundNumber}</p>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-1">Points per Game</p>
              <p className="text-base sm:text-lg font-semibold">{session.pointsPerGame}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}