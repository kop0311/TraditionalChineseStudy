import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classicSlug: string }> }
) {
  try {
    const { classicSlug } = await params;

    // Validate slug format
    if (!classicSlug || !/^[a-z0-9-]+$/.test(classicSlug)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid classic slug',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // First, find the classic by slug
    const { data: classic, error: classicError } = await supabase
      .from('classics')
      .select('id')
      .eq('slug', classicSlug)
      .single();

    if (classicError || !classic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Classic not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Then, get chapters for this classic
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, number, title')
      .eq('classic_id', classic.id)
      .order('number');

    if (chaptersError) throw chaptersError;

    return NextResponse.json({
      success: true,
      data: chapters || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chapters',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}