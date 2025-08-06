'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store/useSessionStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import MatchTab from '@/components/MatchTab';
import ResultsTab from '@/components/ResultsTab';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const { sessionsMap } = useSessionStore();
  const currentSession = sessionsMap[sessionId];

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Session not found</h1>
          <p className="text-muted-foreground">The tournament session you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatSessionDate = (isoDateString: string) => {
    return new Date(isoDateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <header className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {currentSession.tournamentName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Created {formatSessionDate(currentSession.sessionCreatedAt)} • {currentSession.playersList.length} players • {currentSession.numberOfFields} field{currentSession.numberOfFields !== 1 ? 's' : ''} • {currentSession.pointsPerGame} points per game
            </p>
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </header>

        <Tabs defaultValue="match" className="w-full">
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