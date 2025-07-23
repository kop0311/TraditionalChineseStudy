import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { User } from '../../../../lib/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, phone } = body;

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username, email, and password are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email or username already exists',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: 'parent',
      is_active: true,
    });

    // Remove password from response
    const { password: _, ...userResponse } = user.toJSON();

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