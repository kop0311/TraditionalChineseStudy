import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { DatabaseService } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, email, and password are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await DatabaseService.findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await DatabaseService.createUser({
      name,
      email,
      password_hash: hashedPassword,
      role: 'user',
      active: true,
      email_verified: false,
      last_login: null,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        message: 'User registered successfully',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register user',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}