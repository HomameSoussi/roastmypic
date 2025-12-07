import { NextRequest, NextResponse } from 'next/server';
import { viewStory, generateFingerprint } from '@/lib/db';


// POST - Mark story as viewed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const userFingerprint = generateFingerprint(request);

    const success = await viewStory(storyId, userFingerprint);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to view story' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error viewing story:', error);
    return NextResponse.json(
      { error: 'Failed to view story' },
      { status: 500 }
    );
  }
}
