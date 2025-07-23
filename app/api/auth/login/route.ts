import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { DatabaseService } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await DatabaseService.findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is inactive',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Update last login
    await DatabaseService.updateUserLastLogin(user.id);

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        message: 'Login successful',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to login',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}