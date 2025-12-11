import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

// Get all content (roasts and stories)
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'roasts'; // 'roasts' or 'stories'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (type === 'roasts') {
      const result = await sql`
        SELECT 
          id, 
          image_url, 
          roast_text, 
          roast_style, 
          language,
          votes, 
          created_at,
          is_active
        FROM public_roasts
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countResult = await sql`
        SELECT COUNT(*) as total FROM public_roasts
      `;

      return NextResponse.json({
        success: true,
        content: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0]?.total || '0'),
        },
      });
    } else if (type === 'stories') {
      const result = await sql`
        SELECT 
          id,
          image_url,
          roast_text,
          roast_style,
          username,
          views,
          created_at,
          expires_at
        FROM roast_stories
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countResult = await sql`
        SELECT COUNT(*) as total FROM roast_stories
      `;

      return NextResponse.json({
        success: true,
        content: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0]?.total || '0'),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired session') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Content fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete content
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID required' },
        { status: 400 }
      );
    }

    if (type === 'roast') {
      // Soft delete by setting is_active to false
      await sql`
        UPDATE public_roasts 
        SET is_active = false 
        WHERE id = ${id}
      `;
    } else if (type === 'story') {
      // Hard delete story
      await sql`DELETE FROM roast_stories WHERE id = ${id}`;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired session') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Content delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
