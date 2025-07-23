import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running',
      },
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running',
      },
      error: 'Database connection failed',
    };

    return NextResponse.json(
      {
        success: false,
        data: healthData,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}