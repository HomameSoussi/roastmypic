import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Simple query to test connection
    const result = await sql`SELECT NOW() as current_time`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Database connection failed'
    }, { status: 500 });
  }
}
