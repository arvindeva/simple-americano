import { Redis } from '@upstash/redis';
import { AmericanoSession } from '@/types';

const redis = Redis.fromEnv();

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const sessionData = await redis.get(shareId);
    
    if (!sessionData) {
      return Response.json(
        { error: 'Tournament not found or expired' }, 
        { status: 404 }
      );
    }
    
    // Check if data is already parsed or needs parsing
    let session: AmericanoSession;
    if (typeof sessionData === 'string') {
      session = JSON.parse(sessionData);
    } else {
      session = sessionData as AmericanoSession;
    }
    
    return Response.json({ session });
  } catch (error) {
    console.error('Failed to retrieve shared session:', error);
    return Response.json(
      { error: 'Failed to load tournament' }, 
      { status: 500 }
    );
  }
}