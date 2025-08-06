"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Share2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSessionStore } from "@/store/useSessionStore";
import { AmericanoSession, Match } from "@/types";
import ScoreModal from "./ScoreModal";
import { exportSessionToUrl, copyToClipboard } from "@/lib/shareUtils";

interface MatchTabProps {
  session: AmericanoSession;
}

export default function MatchTab({ session }: MatchTabProps) {
  const router = useRouter();
  const { updateMatchScore, generateNextMatch, deleteSession } =
    useSessionStore();
  const [currentRound, setCurrentRound] = useState(session.currentRoundNumber);
  const [scoreModalState, setScoreModalState] = useState<{
    isOpen: boolean;
    selectedTeam: "team1" | "team2";
    match: Match | null;
  }>({
    isOpen: false,
    selectedTeam: "team1",
    match: null,
  });

  const currentRoundMatches = session.matchesList.filter(
    (match) => match.roundNumber === currentRound
  );
  const maxRound = Math.max(
    0,
    ...session.matchesList.map((match) => match.roundNumber)
  );
  const minRound = Math.min(
    1,
    ...session.matchesList.map((match) => match.roundNumber)
  );
  const isLastRound = currentRound === maxRound;
  const canNavigateNext = currentRound < maxRound;
  const canNavigatePrevious = currentRound > minRound;

  const handlePreviousRound = () => {
    if (canNavigatePrevious) {
      setCurrentRound(currentRound - 1);
    }
  };

  const handleNextRound = () => {
    if (canNavigateNext) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handleGenerateNextRound = () => {
    generateNextMatch(session.sessionId);
    setCurrentRound(maxRound + 1);
  };

  const openScoreModal = (selectedTeam: "team1" | "team2", match: Match) => {
    setScoreModalState({
      isOpen: true,
      selectedTeam,
      match,
    });
  };

  const handleScoreUpdate = (newScore: [number, number]) => {
    if (scoreModalState.match) {
      updateMatchScore(
        session.sessionId,
        scoreModalState.match.matchId,
        newScore
      );
    }
  };

  const closeScoreModal = () => {
    setScoreModalState({
      isOpen: false,
      selectedTeam: "team1",
      match: null,
    });
  };

  const formatScore = (score: [number, number] | null) => {
    return score ? `${score[0]}-${score[1]}` : "00-00";
  };

  const getTeamDisplayName = (teamPlayers: string[]) => {
    return teamPlayers.join(" / ");
  };

  const handleShareSession = async () => {
    try {
      const shareUrl = exportSessionToUrl(session);
      await copyToClipboard(shareUrl);
      alert("Share link copied to clipboard!");
    } catch (error) {
      alert("Failed to create share link");
    }
  };

  const handleDeleteSession = () => {
    deleteSession(session.sessionId);
    router.push("/");
  };

  if (currentRoundMatches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No matches yet</p>
        <Button onClick={handleGenerateNextRound}>Generate First Round</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between pt-2 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousRound}
            disabled={!canNavigatePrevious}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm sm:text-lg font-semibold truncate">
            Round {currentRound} of {maxRound || 1}
          </h2>
          {canNavigateNext ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextRound}
              className="shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleGenerateNextRound}
              className="px-2 sm:px-4 text-xs sm:text-sm shrink-0"
            >
              <span className="hidden sm:inline">Generate Next Round</span>
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
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                <AlertDialogDescription className="mb-4 sm:mb-6">
                  Are you sure you want to delete this tournament? This action
                  cannot be undone and all match data will be lost.
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

      <div className="space-y-4">
        {currentRoundMatches.map((match, index) => (
          <Card key={`${match.matchId}-${index}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {/* Team 1 */}
                <div className="flex flex-col items-center space-y-2 flex-1">
                  <Button
                    variant="outline"
                    onClick={() => openScoreModal("team1", match)}
                    className="text-2xl sm:text-3xl font-bold h-12 sm:h-14 min-w-[60px] sm:min-w-[80px]"
                  >
                    {formatScore(match.matchScore).split("-")[0] || "00"}
                  </Button>
                  <div className="text-center space-y-1">
                    <div className="font-medium text-sm sm:text-base">
                      {match.firstTeam[0]}
                    </div>
                    <div className="font-medium text-sm sm:text-base">
                      {match.firstTeam[1]}
                    </div>
                  </div>
                </div>

                {/* Court # and VS */}
                <div className="flex flex-col items-center px-2">
                  <div className="text-sm sm:text-base font-medium text-foreground mb-1">
                    Court {index + 1}
                    {match.matchScore && (
                      <span className="ml-1 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-muted-foreground">
                    vs
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex flex-col items-center space-y-2 flex-1">
                  <Button
                    variant="outline"
                    onClick={() => openScoreModal("team2", match)}
                    className="text-2xl sm:text-3xl font-bold h-12 sm:h-14 min-w-[60px] sm:min-w-[80px]"
                  >
                    {formatScore(match.matchScore).split("-")[1] || "00"}
                  </Button>
                  <div className="text-center space-y-1">
                    <div className="font-medium text-sm sm:text-base">
                      {match.secondTeam[0]}
                    </div>
                    <div className="font-medium text-sm sm:text-base">
                      {match.secondTeam[1]}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ScoreModal
        isOpen={scoreModalState.isOpen}
        onClose={closeScoreModal}
        onScoreSelect={handleScoreUpdate}
        maxPoints={session.pointsPerGame}
        teamOneName={
          scoreModalState.match
            ? getTeamDisplayName(scoreModalState.match.firstTeam)
            : ""
        }
        teamTwoName={
          scoreModalState.match
            ? getTeamDisplayName(scoreModalState.match.secondTeam)
            : ""
        }
        selectedTeam={scoreModalState.selectedTeam}
      />
    </div>
  );
}
