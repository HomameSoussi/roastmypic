import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

// POST: Track an analytics event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, properties, timestamp } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Store in database (create analytics table if needed)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id SERIAL PRIMARY KEY,
          event VARCHAR(255) NOT NULL,
          properties JSONB,
          timestamp BIGINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        INSERT INTO analytics_events (event, properties, timestamp)
        VALUES (${event}, ${JSON.stringify(properties || {})}, ${timestamp})
      `;
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if DB storage fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Return success even on error - analytics should never break the app
    return NextResponse.json({ success: true });
  }
}

// GET: Retrieve analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    // In a real app, verify admin authentication here
    
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query;
    if (event) {
      query = sql`
        SELECT * FROM analytics_events
        WHERE event = ${event}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT * FROM analytics_events
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
    }

    const result = await query;

    return NextResponse.json({
      events: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
