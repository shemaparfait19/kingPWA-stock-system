// API route for repairs - GET all repairs and POST new repair
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push-service';

import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const repairs = await prisma.repairJob.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(assignedTo && { assignedTo }),
      },
      include: {
        customer: true,
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        partsUsed: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(repairs);
  } catch (error: any) {
    console.error('Error fetching repairs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repairs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    const session = await auth();
    if (!session || !session.user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    body = await request.json();
    console.log('Creating repair with data:', JSON.stringify(body, null, 2));
    
    const {
      customerId,
      deviceType,
      brand,
      model,
      serialNumber,
      imei,
      problemDescription,
      promisedDate,
      priority,
      estimatedCost, // Destructure this
      depositPaid,
      assignedTo,
      createdBy,
      photoUrls,
    } = body;

    // ... validation ...

    // Generate job number logic ... (lines 135-152)

    const cost = estimatedCost ? parseFloat(estimatedCost) : 0;
    const deposit = depositPaid ? parseFloat(depositPaid) : 0;

    const repair = await prisma.repairJob.create({
      data: {
        jobNumber,
        customerId,
        deviceType,
        brand,
        model,
        serialNumber: serialNumber || null,
        imei: imei || null,
        problemDescription,
        promisedDate: new Date(promisedDate),
        priority: priority || 'normal',
        estimatedCost: cost,
        actualCost: cost, // Default actual cost to estimated cost for now
        depositPaid: deposit,
        balance: cost - deposit,
        assignedTo: assignedTo || null,
        createdBy,
        photoUrls: photoUrls || [],
        status: 'pending',
      },
      include: {
        customer: true,
        assignedUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    console.log('Repair created successfully:', repair.id);

    // Create notification for assigned technician
    if (assignedTo) {
      try {
        await prisma.notification.create({
          data: {
            userId: assignedTo,
            type: 'new_repair',
            message: `New repair job assigned: ${jobNumber}`,
            relatedId: repair.id,
          },
        });
        
        // Send Push Notification
        await sendPushNotification(
          assignedTo,
          'New Repair Assigned',
          `Job ${jobNumber} has been assigned to you.`,
          `/repairs/${repair.id}`
        );
        
        console.log('Notification created for technician');
      } catch (notifError) {
        console.error('Failed to create notification (non-critical):', notifError);
        // Don't fail the whole request if notification fails
      }
    }

    return NextResponse.json(repair);
  } catch (error: any) {
    console.error('Error creating repair - Full error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Request body was:', body);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create repair' },
      { status: 500 }
    );
  }
}
