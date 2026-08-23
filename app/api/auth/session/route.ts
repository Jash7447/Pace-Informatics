import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = session ? await verifySessionToken(session) : false;

  return NextResponse.json({ success: true, authenticated: isAuthenticated });
}
