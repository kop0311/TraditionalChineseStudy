import { NextRequest, NextResponse } from 'next/server';
import { Classic } from '../../../lib/models';

export async function GET(request: NextRequest) {
  try {
    const classics = await Classic.findAll({
      attributes: ['id', 'slug', 'title', 'author', 'dynasty'],
    });

    return NextResponse.json({
      success: true,
      data: classics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching classics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch classics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}