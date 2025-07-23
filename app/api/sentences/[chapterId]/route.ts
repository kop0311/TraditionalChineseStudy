import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;

    // Validate chapter ID
    const chapterIdNum = parseInt(chapterId);
    if (isNaN(chapterIdNum) || chapterIdNum <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid chapter ID',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Find chapter with sentences
    const chapter = await Chapter.findByPk(chapterIdNum, {
      include: [
        {
          model: Sentence,
          as: 'sentences',
          attributes: ['id', 'number', 'text', 'pinyin', 'translation'],
          order: [['number', 'ASC']],
        },
      ],
    });

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          number: chapter.number,
        },
        sentences: chapter.sentences,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sentences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sentences',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}