import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';
import { NextRequest } from 'next/server';
import { AmericanoSession } from '@/types';

const redis = Redis.fromEnv();

export async function POST(request: NextRequest) {
  try {
    const session: AmericanoSession = await request.json();
    const shareId = nanoid(8); // Generate 8-character ID
    
    // Ensure originalSessionId exists for deduplication (backward compatibility)
    const sessionToShare: AmericanoSession = {
      ...session,
      originalSessionId: session.originalSessionId || session.sessionId
    };
    
    // Save to Redis with 30-day expiration (30 * 24 * 60 * 60 seconds)
    await redis.setex(shareId, 30 * 24 * 60 * 60, JSON.stringify(sessionToShare));
    
    const shareUrl = `${request.nextUrl.origin}/shared/${shareId}`;
    
    return Response.json({ 
      shareId, 
      shareUrl 
    });
  } catch (error) {
    console.error('Failed to create share:', error);
    return Response.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}