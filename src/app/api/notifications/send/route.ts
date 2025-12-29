// Push notification sending API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userIds, title, message, icon, data } = body;

    if ((!userId && !userIds) || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get target user IDs
    const targetUserIds = userIds || [userId];

    // In production, this would:
    // 1. Fetch user push subscriptions from database
    // 2. Use web-push library to send notifications
    // 3. Handle failures and retry logic
    
    // For now, create in-app notifications
    const notifications = await Promise.all(
      targetUserIds.map((uid: string) =>
        prisma.notification.create({
          data: {
            userId: uid,
            type: data?.type || 'general',
            message: `${title}: ${message}`,
            relatedId: data?.relatedId || null,
          },
        })
      )
    );

    // TODO: Send actual push notifications using web-push
    // const webpush = require('web-push');
    // webpush.setVapidDetails(
    //   process.env.VAPID_SUBJECT,
    //   process.env.VAPID_PUBLIC_KEY,
    //   process.env.VAPID_PRIVATE_KEY
    // );
    // await webpush.sendNotification(subscription, JSON.stringify(payload));

    return NextResponse.json({
      success: true,
      sent: notifications.length,
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
