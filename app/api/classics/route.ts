import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { data: classics, error } = await supabase
      .from('classics')
      .select('id, slug, title, author, dynasty')
      .order('created_at');

    if (error) throw error;

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