import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-helper';

/**
 * GET /api/auth/me
 * Returns the authenticated user's data based on the active NextAuth session.
 * Used by the client-side auth-provider to verify and refresh the session.
 */
export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
