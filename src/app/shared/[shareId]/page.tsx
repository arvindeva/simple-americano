"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { nanoid } from 'nanoid';
import { AmericanoSession } from '@/types';

interface SharedSessionPageProps {
  params: Promise<{ shareId: string }>;
}

export default function SharedSessionPage({ params }: SharedSessionPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createSession } = useSessionStore();
  const { shareId } = use(params);

  useEffect(() => {
    async function loadSharedSession() {
      try {
        const response = await fetch(`/api/share/${shareId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tournament not found or expired');
          } else {
            setError('Failed to load tournament');
          }
          return;
        }
        
        const { session }: { session: AmericanoSession } = await response.json();
        
        // Create new session with new ID (same as current import logic)
        const newSession: AmericanoSession = {
          ...session,
          sessionId: nanoid(),
          tournamentName: session.tournamentName || 'Imported Tournament'
        };
        
        createSession(newSession);
        router.push(`/session/${newSession.sessionId}?tab=results`);
      } catch (err) {
        console.error('Failed to load shared session:', err);
        setError('Failed to load tournament');
      } finally {
        setLoading(false);
      }
    }
    
    loadSharedSession();
  }, [shareId, createSession, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading shared tournament...</p>
          <p className="text-muted-foreground">Please wait while we import your tournament</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}