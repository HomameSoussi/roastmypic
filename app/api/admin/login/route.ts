import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession, setAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Verify credentials using bcrypt
    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT session token
    const jwtToken = await createSession(username);

    // Set secure HTTP-only cookie with JWT
    await setAdminSession(jwtToken);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        username,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
