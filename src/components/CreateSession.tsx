"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionStore } from "@/store/useSessionStore";
import { AmericanoSession, Player } from "@/types";

interface CreateSessionState {
  currentStep: number;
  tournamentName: string;
  numberOfFields: number;
  pointsPerGame: number;
  playerNames: string[];
  newPlayerName: string;
}

export default function CreateSession() {
  const router = useRouter();
  const { createSession, generateNextMatch } = useSessionStore();
  const playerInputRef = useRef<HTMLInputElement>(null);

  const [sessionState, setSessionState] = useState<CreateSessionState>({
    currentStep: 1,
    tournamentName: "",
    numberOfFields: 0,
    pointsPerGame: 0,
    playerNames: [],
    newPlayerName: "",
  });

  const updateSessionState = (updates: Partial<CreateSessionState>) => {
    setSessionState((prev) => ({ ...prev, ...updates }));
  };

  const proceedToNextStep = () => {
    updateSessionState({ currentStep: sessionState.currentStep + 1 });
  };

  const returnToPreviousStep = () => {
    if (sessionState.currentStep === 1) {
      router.push("/");
    } else {
      updateSessionState({ currentStep: sessionState.currentStep - 1 });
    }
  };

  const proceedToFieldSelection = () => {
    if (sessionState.tournamentName.trim()) {
      proceedToNextStep();
    }
  };

  const selectNumberOfFields = (fieldCount: number) => {
    updateSessionState({ numberOfFields: fieldCount });
    proceedToNextStep();
  };

  const selectPointsPerGame = (points: number) => {
    updateSessionState({ pointsPerGame: points });
    proceedToNextStep();
  };

  const addPlayerToList = () => {
    if (
      sessionState.newPlayerName.trim() &&
      !sessionState.playerNames.includes(sessionState.newPlayerName.trim())
    ) {
      updateSessionState({
        playerNames: [
          ...sessionState.playerNames,
          sessionState.newPlayerName.trim(),
        ],
        newPlayerName: "",
      });
      // Focus the input after adding player to keep keyboard open on mobile
      setTimeout(() => {
        playerInputRef.current?.focus();
      }, 10);
    }
  };

  const removePlayerFromList = (playerName: string) => {
    updateSessionState({
      playerNames: sessionState.playerNames.filter(
        (name) => name !== playerName
      ),
    });
  };

  const startGameSession = () => {
    const initialPlayers: Player[] = sessionState.playerNames.map((name) => ({
      name,
      gamesPlayed: 0,
    }));

    const newSession: AmericanoSession = {
      sessionId: nanoid(),
      tournamentName: sessionState.tournamentName.trim(),
      numberOfFields: sessionState.numberOfFields,
      pointsPerGame: sessionState.pointsPerGame,
      playersList: initialPlayers,
      matchesList: [],
      currentRoundNumber: 0,
      sessionCreatedAt: new Date().toISOString(),
    };

    createSession(newSession);
    generateNextMatch(newSession.sessionId);
    router.push(`/session/${newSession.sessionId}`);
  };

  const handleTournamentNameKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      proceedToFieldSelection();
    }
  };

  const handlePlayerNameKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      addPlayerToList();
    }
  };

  const renderProgressIndicator = () => {
    const progressItems = [];

    if (sessionState.currentStep > 1 && sessionState.tournamentName) {
      progressItems.push(`Tournament: ${sessionState.tournamentName}`);
    }
    if (sessionState.currentStep > 2 && sessionState.numberOfFields > 0) {
      progressItems.push(
        `${sessionState.numberOfFields} field${
          sessionState.numberOfFields > 1 ? "s" : ""
        }`
      );
    }
    if (sessionState.currentStep > 3 && sessionState.pointsPerGame > 0) {
      progressItems.push(`${sessionState.pointsPerGame} points`);
    }

    if (progressItems.length === 0) return null;

    return (
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
        <div className="text-xs text-muted-foreground mb-1">Selected:</div>
        <div className="text-sm font-medium">{progressItems.join(" • ")}</div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (sessionState.currentStep) {
      case 1:
        return (
          <Card className="w-full">
            <CardHeader className="text-center p-4 sm:p-6 relative">
              <div className="absolute top-4 left-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={returnToPreviousStep}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg sm:text-xl">
                Tournament Name
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Give your tournament a name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <Input
                placeholder="Enter tournament name"
                value={sessionState.tournamentName}
                onChange={(e) =>
                  updateSessionState({ tournamentName: e.target.value })
                }
                onKeyPress={handleTournamentNameKeyPress}
                className="text-center text-base sm:text-lg h-12 sm:h-14"
                maxLength={50}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={proceedToFieldSelection}
                  disabled={!sessionState.tournamentName.trim()}
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
                >
                  Continue
                </Button>
                <Button
                  onClick={returnToPreviousStep}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                How many fields?
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Select the number of padel courts available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5, 6].map((fieldCount) => (
                  <Button
                    key={fieldCount}
                    onClick={() => selectNumberOfFields(fieldCount)}
                    variant="outline"
                    className="h-12 sm:h-16 text-base sm:text-lg font-semibold"
                  >
                    {fieldCount}
                  </Button>
                ))}
              </div>
              <Button
                onClick={returnToPreviousStep}
                variant="ghost"
                className="w-full mt-4"
              >
                Back
              </Button>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                Points per game?
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Select the target score for each match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:gap-3">
                {[16, 21, 24].map((points) => (
                  <Button
                    key={points}
                    onClick={() => selectPointsPerGame(points)}
                    variant="outline"
                    className="h-12 sm:h-16 text-base sm:text-lg font-semibold"
                  >
                    {points} points
                  </Button>
                ))}
              </div>
              <Button
                onClick={returnToPreviousStep}
                variant="ghost"
                className="w-full mt-4"
              >
                Back
              </Button>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">Add Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              {sessionState.playerNames.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">
                    Players ({sessionState.playerNames.length}):
                  </h4>
                  <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto">
                    {sessionState.playerNames.map((playerName, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted p-2 sm:p-3 rounded"
                      >
                        <span className="text-xs sm:text-sm truncate flex-1 mr-2">
                          {playerName}
                        </span>
                        <Button
                          onClick={() => removePlayerFromList(playerName)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  ref={playerInputRef}
                  placeholder="Enter player name"
                  value={sessionState.newPlayerName}
                  onChange={(e) =>
                    updateSessionState({ newPlayerName: e.target.value })
                  }
                  onKeyPress={handlePlayerNameKeyPress}
                  className="flex-1 h-10 sm:h-11"
                />
                <Button
                  onClick={addPlayerToList}
                  disabled={!sessionState.newPlayerName.trim()}
                  className="h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={startGameSession}
                  disabled={sessionState.playerNames.length < 4}
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
                >
                  Start Games ({sessionState.playerNames.length}/4+ players)
                </Button>
                <Button
                  onClick={returnToPreviousStep}
                  variant="ghost"
                  className="w-full h-10"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 bg-background">
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-8">
        {renderProgressIndicator()}
        {renderCurrentStep()}
      </div>
    </div>
  );
}
