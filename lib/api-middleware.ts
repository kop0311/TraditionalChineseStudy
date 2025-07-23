import { NextRequest, NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  path?: string | undefined;
}

export function createApiResponse<T>(
  data: T,
  success: boolean = true,
  path?: string
): ApiResponse<T> {
  if (success) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  } else {
    return {
      success: false,
      error: typeof data === 'string' ? data : 'An error occurred',
      timestamp: new Date().toISOString(),
      path,
    };
  }
}

export function handleApiError(error: any, path?: string): NextResponse {
  console.error('API Error:', error);
  
  const response = createApiResponse(
    error.message || 'Internal server error',
    false,
    path
  );

  return NextResponse.json(response, { status: 500 });
}

export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

export async function withApiHandler<T>(
  request: NextRequest,
  handler: (request: NextRequest, ...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<NextResponse> {
  try {
    const result = await handler(request, ...args);
    return NextResponse.json(
      createApiResponse(result, true, request.nextUrl.pathname)
    );
  } catch (error) {
    return handleApiError(error, request.nextUrl.pathname);
  }
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}