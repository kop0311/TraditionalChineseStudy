import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Failed to connect to Supabase database'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Database connection test failed'
    }, { status: 500 });
  }
}