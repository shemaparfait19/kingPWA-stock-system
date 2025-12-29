// API route for individual inventory item operations
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode || null,
        unitCost: body.unitCost !== undefined ? parseFloat(body.unitCost) : undefined,
        sellingPrice: body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : undefined,
        quantity: body.quantity !== undefined ? parseInt(body.quantity) : undefined,
        reorderLevel: body.reorderLevel !== undefined ? parseInt(body.reorderLevel) : undefined,
        reorderQuantity: body.reorderQuantity !== undefined ? parseInt(body.reorderQuantity) : undefined,
        location: body.location !== undefined ? body.location : undefined,
        categoryId: body.categoryId,
        supplierId: body.supplierId !== undefined ? body.supplierId : undefined,
        lowStockAlert: body.lowStockAlert,
        active: body.active,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error updating item:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An item with this SKU already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}
