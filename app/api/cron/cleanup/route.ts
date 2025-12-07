import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredStories } from '@/lib/db';


// GET - Cleanup expired stories (called by Vercel Cron)
export async function GET(request: NextRequest) {
  try {
    // Note: This endpoint can be called manually or via external cron service
    // For production, consider adding authentication

    const deletedCount = await cleanupExpiredStories();

    return NextResponse.json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up expired stories:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup expired stories' },
      { status: 500 }
    );
  }
}
