// API route for inventory items
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const items = await prisma.inventoryItem.findMany({
      where: {
        active: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    body = await request.json();
    
    console.log('Received inventory item data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.name || !body.sku || !body.categoryId) {
      console.error('Missing required fields:', { name: body.name, sku: body.sku, categoryId: body.categoryId });
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, and categoryId are required' },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.inventoryCategory.findUnique({
      where: { id: body.categoryId },
    });

    if (!category) {
      console.error('Category not found:', body.categoryId);
      return NextResponse.json(
        { error: `Category with ID ${body.categoryId} not found` },
        { status: 400 }
      );
    }

    console.log('Creating item with category:', category.name);

    // Create the item
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode || null,
        unitCost: parseFloat(body.unitCost) || 0,
        sellingPrice: parseFloat(body.sellingPrice) || 0,
        quantity: parseInt(body.quantity) || 0,
        reorderLevel: parseInt(body.reorderLevel) || 10,
        reorderQuantity: parseInt(body.reorderQuantity) || 50,
        location: body.location || null,
        categoryId: body.categoryId,
        supplierId: body.supplierId || null,
        lowStockAlert: body.lowStockAlert || false,
        active: body.active !== undefined ? body.active : true,
      },
      include: {
        category: true,
      },
    });

    console.log('Item created successfully:', item.id);
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error creating item - Full error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Check for unique constraint violation (duplicate SKU)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `An item with SKU "${body?.sku}" already exists` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}
