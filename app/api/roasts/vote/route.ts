import { NextRequest, NextResponse } from 'next/server';
import { voteOnRoast, generateFingerprint } from '@/lib/db';

// POST - Vote on a roast (toggle vote)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roastId } = body;

    if (!roastId) {
      return NextResponse.json(
        { error: 'Missing roastId' },
        { status: 400 }
      );
    }

    const userFingerprint = generateFingerprint(request);

    const result = await voteOnRoast(roastId, userFingerprint);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      votes: result.votes
    });
  } catch (error) {
    console.error('Error voting on roast:', error);
    return NextResponse.json(
      { error: 'Failed to vote on roast' },
      { status: 500 }
    );
  }
}
