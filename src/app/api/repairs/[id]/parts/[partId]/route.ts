// API route for removing parts from repair
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; partId: string } }
) {
  try {
    // Get part details before deleting
    const part = await prisma.repairPart.findUnique({
      where: { id: params.partId },
    });

    if (!part) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      );
    }

    // Delete the part
    await prisma.repairPart.delete({
      where: { id: params.partId },
    });

    // Return quantity to inventory
    await prisma.inventoryItem.update({
      where: { id: part.itemId },
      data: {
        quantity: {
          increment: part.quantity,
        },
      },
    });

    // Create inventory transaction
    await prisma.inventoryTransaction.create({
      data: {
        itemId: part.itemId,
        quantity: part.quantity,
        type: 'IN',
        reason: 'return',
        notes: `Returned from repair job ${params.id}`,
        userId: 'system', // Should be actual user ID
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing part:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove part' },
      { status: 500 }
    );
  }
}
