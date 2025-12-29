// API route for individual repair operations
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repair = await prisma.repairJob.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        partsUsed: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!repair) {
      return NextResponse.json(
        { error: 'Repair job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(repair);
  } catch (error: any) {
    console.error('Error fetching repair:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repair' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const repair = await prisma.repairJob.update({
      where: { id: params.id },
      data: body,
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

    return NextResponse.json(repair);
  } catch (error: any) {
    console.error('Error updating repair:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update repair' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.repairJob.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting repair:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete repair' },
      { status: 500 }
    );
  }
}
