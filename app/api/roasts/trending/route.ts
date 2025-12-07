import { NextRequest, NextResponse } from 'next/server';
import { getTrendingRoasts, generateFingerprint } from '@/lib/db';


// GET - Get trending roasts (last 24 hours)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const userFingerprint = generateFingerprint(request);

    const roasts = await getTrendingRoasts(limit, userFingerprint);

    return NextResponse.json({
      success: true,
      roasts
    });
  } catch (error) {
    console.error('Error fetching trending roasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending roasts' },
      { status: 500 }
    );
  }
}
