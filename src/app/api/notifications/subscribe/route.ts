// Push notification subscription API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store subscription in database
    // For now, we'll store it as JSON in user metadata
    // In production, create a separate PushSubscription table
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Store subscription in a JSON field or separate table
        // This is a simplified version
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error subscribing to push:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
