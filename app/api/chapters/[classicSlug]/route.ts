import { NextRequest, NextResponse } from 'next/server';
import { Classic, Chapter } from '../../../../lib/models';

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

    const classic = await Classic.findOne({
      where: { slug: classicSlug },
      include: [
        {
          model: Chapter,
          as: 'chapters',
          attributes: ['id', 'number', 'title'],
          order: [['number', 'ASC']],
        },
      ],
    });

    if (!classic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Classic not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: classic.chapters,
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