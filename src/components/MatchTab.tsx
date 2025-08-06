'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Share2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSessionStore } from '@/store/useSessionStore';
import { AmericanoSession, Match } from '@/types';
import ScoreModal from './ScoreModal';
import { exportSessionToUrl, copyToClipboard } from '@/lib/shareUtils';

interface MatchTabProps {
  session: AmericanoSession;
}

export default function MatchTab({ session }: MatchTabProps) {
  const router = useRouter();
  const { updateMatchScore, generateNextMatch, deleteSession } = useSessionStore();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(session.matchesList.length - 1);
  const [scoreModalState, setScoreModalState] = useState<{
    isOpen: boolean;
    selectedTeam: 'team1' | 'team2';
    match: Match | null;
  }>({
    isOpen: false,
    selectedTeam: 'team1',
    match: null
  });

  const currentMatch = session.matchesList[currentMatchIndex];
  const isLastMatch = currentMatchIndex === session.matchesList.length - 1;
  const canNavigateNext = currentMatchIndex < session.matchesList.length - 1;
  const canNavigatePrevious = currentMatchIndex > 0;

  const handlePreviousMatch = () => {
    if (canNavigatePrevious) {
      setCurrentMatchIndex(currentMatchIndex - 1);
    }
  };

  const handleNextMatch = () => {
    if (canNavigateNext) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    }
  };

  const handleGenerateNextMatch = () => {
    generateNextMatch(session.sessionId);
    setCurrentMatchIndex(session.matchesList.length);
  };

  const openScoreModal = (selectedTeam: 'team1' | 'team2', match: Match) => {
    setScoreModalState({
      isOpen: true,
      selectedTeam,
      match
    });
  };

  const handleScoreUpdate = (newScore: [number, number]) => {
    if (scoreModalState.match) {
      updateMatchScore(session.sessionId, scoreModalState.match.roundNumber, newScore);
    }
  };

  const closeScoreModal = () => {
    setScoreModalState({
      isOpen: false,
      selectedTeam: 'team1',
      match: null
    });
  };

  const formatScore = (score: [number, number] | null) => {
    return score ? `${score[0]}-${score[1]}` : '00-00';
  };

  const getTeamDisplayName = (teamPlayers: string[]) => {
    return teamPlayers.join(' / ');
  };

  const handleShareSession = async () => {
    try {
      const shareUrl = exportSessionToUrl(session);
      await copyToClipboard(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      alert('Failed to create share link');
    }
  };

  const handleDeleteSession = () => {
    deleteSession(session.sessionId);
    router.push('/');
  };

  if (!currentMatch) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No matches yet</p>
        <Button onClick={handleGenerateNextMatch}>
          Generate First Match
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMatch}
            disabled={!canNavigatePrevious}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm sm:text-lg font-semibold truncate">
            Round {currentMatch.roundNumber} of {session.matchesList.length}
          </h2>
          {canNavigateNext ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMatch}
              className="shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleGenerateNextMatch}
              className="px-2 sm:px-4 text-xs sm:text-sm shrink-0"
            >
              <span className="hidden sm:inline">Generate Next Match</span>
              <span className="sm:hidden">Next</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={handleShareSession}>
            <Share2 className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this tournament? This action cannot be undone and all match data will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSession}>
                  Delete Tournament
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-center text-base sm:text-lg">Match {currentMatch.roundNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-medium text-sm sm:text-base truncate">{getTeamDisplayName(currentMatch.firstTeam)}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => openScoreModal('team1', currentMatch)}
                className="min-w-[60px] sm:min-w-[80px] h-10 sm:h-11 text-base sm:text-lg font-bold"
              >
                {formatScore(currentMatch.matchScore).split('-')[0] || '00'}
              </Button>
            </div>

            <div className="text-center text-base sm:text-lg font-bold text-muted-foreground py-2">
              VS
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-medium text-sm sm:text-base truncate">{getTeamDisplayName(currentMatch.secondTeam)}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => openScoreModal('team2', currentMatch)}
                className="min-w-[60px] sm:min-w-[80px] h-10 sm:h-11 text-base sm:text-lg font-bold"
              >
                {formatScore(currentMatch.matchScore).split('-')[1] || '00'}
              </Button>
            </div>
          </div>

          {currentMatch.matchScore && (
            <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-medium text-sm sm:text-base">
                Match Complete: {formatScore(currentMatch.matchScore)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ScoreModal
        isOpen={scoreModalState.isOpen}
        onClose={closeScoreModal}
        onScoreSelect={handleScoreUpdate}
        maxPoints={session.pointsPerGame}
        teamOneName={getTeamDisplayName(currentMatch.firstTeam)}
        teamTwoName={getTeamDisplayName(currentMatch.secondTeam)}
        selectedTeam={scoreModalState.selectedTeam}
      />
    </div>
  );
}