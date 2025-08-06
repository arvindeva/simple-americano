"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/useSessionStore";
import { AmericanoSession } from "@/types";
import { importSessionFromUrl } from "@/lib/shareUtils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShineBorder } from "@/components/magicui/shine-border";

export default function HomePage() {
  const { sessionsMap, createSession } = useSessionStore();
  const [sessionsList, setSessionsList] = useState<AmericanoSession[]>([]);

  useEffect(() => {
    const importedSession = importSessionFromUrl();
    if (importedSession) {
      createSession(importedSession);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [createSession]);

  useEffect(() => {
    setSessionsList(Object.values(sessionsMap));
  }, [sessionsMap]);

  const formatSessionDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <header className="text-center py-6 sm:py-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Americano Padel
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Tournament organizer for fair and fun matches
          </p>
        </header>

        <div className="flex justify-center px-4">
          <Link href="/create">
            <div className="relative overflow-hidden rounded-lg">
              <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                duration={3}
                borderWidth={3}
              />
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-12 sm:h-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg"
              >
                Create New Tournament
              </Button>
            </div>
          </Link>
        </div>

        {sessionsList.length > 0 && (
          <div className="space-y-3 sm:space-y-4 px-3 sm:px-0">
            <h2 className="text-lg sm:text-xl font-semibold">
              Your Tournaments
            </h2>
            <div className="grid gap-2 sm:gap-3">
              {sessionsList.map((session) => (
                <Link
                  key={session.sessionId}
                  href={`/session/${session.sessionId}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">
                            {session.tournamentName}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs sm:text-sm">
                            <span className="block">
                              {session.playersList.length} players •{" "}
                              {session.numberOfCourts} court
                              {session.numberOfCourts !== 1 ? "s" : ""} •{" "}
                              {session.pointsPerGame} points
                            </span>
                            <span className="block mt-1">
                              {formatSessionDate(session.sessionCreatedAt)}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="text-right text-xs sm:text-sm text-muted-foreground shrink-0">
                          Round {session.currentRoundNumber}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 sm:p-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          {session.matchesList.length} matches played
                        </span>
                        <span className="text-primary font-medium">
                          Continue →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {sessionsList.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium mb-2">No tournaments yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first Americano tournament to get started
              </p>
              <Link href="/create">
                <Button variant="outline">Create Tournament</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
