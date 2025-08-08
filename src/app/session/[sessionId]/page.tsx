"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, Share2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/useSessionStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import MatchTab from "@/components/MatchTab";
import ResultsTab from "@/components/ResultsTab";
import { copyToClipboard } from "@/lib/shareUtils";
import { toast } from "sonner";
import { useState } from "react";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const defaultTab = searchParams.get('tab') || 'match';
  const [isSharing, setIsSharing] = useState(false);

  const { sessionsMap } = useSessionStore();
  const currentSession = sessionsMap[sessionId];

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Session not found</h1>
          <p className="text-muted-foreground">
            The tournament session you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatSessionDate = (isoDateString: string) => {
    return new Date(isoDateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShareSession = async () => {
    setIsSharing(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSession)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create share link');
      }
      
      const { shareUrl } = await response.json();
      await copyToClipboard(shareUrl);
      toast.success("Share link copied to clipboard!", {
        description: "Anyone with this link can view the tournament results.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error("Failed to create share link", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        <header className="flex items-center gap-2 sm:gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-4xl font-bold truncate font-quantico">
                {currentSession.tournamentName}
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareSession}
                disabled={isSharing}
                className="flex items-center gap-2 shrink-0"
              >
                {isSharing ? (
                  <>
                    <Share2 className="h-4 w-4" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Sharing...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {currentSession.playersList.length} players •{" "}
              {currentSession.numberOfCourts} court
              {currentSession.numberOfCourts !== 1 ? "s" : ""} •{" "}
              {currentSession.pointsPerGame} points per game
            </p>
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </header>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="match">Match</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="match">
            <MatchTab session={currentSession} />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTab session={currentSession} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
