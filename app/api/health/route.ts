import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '../../../lib/models';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await sequelize.authenticate();
    
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