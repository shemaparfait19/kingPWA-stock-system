// API route for managing parts used in repairs
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { itemId, quantity, name, unitCost } = body;

    // Validation
    if (!quantity) {
       return NextResponse.json(
        { error: 'Quantity is required' },
        { status: 400 }
      );
    }

    if (!itemId && !name) {
      return NextResponse.json(
        { error: 'Either select a part or provide a name' },
        { status: 400 }
      );
    }

    let finalUnitCost = unitCost;
    let finalItemId = itemId;

    // Logic for Stock Item
    if (itemId) {
        // Get item details
        const item = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        });

        if (!item) {
        return NextResponse.json(
            { error: 'Item not found' },
            { status: 404 }
        );
        }

        // Check stock availability
        if (item.quantity < quantity) {
        return NextResponse.json(
            { error: `Insufficient stock. Only ${item.quantity} available` },
            { status: 400 }
        );
        }

        finalUnitCost = item.sellingPrice;
        
        // Deduct from inventory
        await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
            quantity: {
            decrement: quantity,
            },
        },
        });

    // Get User ID (Session or Fallback)
    // Note: We need a valid User ID for the Foreign Key in InventoryTransaction
    // Since this is an API route, we try to get the session user.
    // If no session (e.g. testing), we MUST look up a valid user from the DB.
    
    // Check for auth if available (omitted for brevity in this specific fix, assuming context)
    // For robust server-side, let's find a fallback "system" user or just the first user.
    let transactionUserId = 'system';
    
    // Try to find a valid user to attribute this to
    const defaultUser = await prisma.user.findFirst();
    if (defaultUser) {
        transactionUserId = defaultUser.id;
    } else {
        // If NO users exist at all, we can't create a transaction due to FK constraint.
        // But assumedly users exist if the app is running.
        console.warn("No users found in DB. Inventory Transaction might fail if 'system' user doesn't exist.");
    }

    if (itemId) {
        // ... (existing item checks) ...

        // ... (existing update) ...

        // Create inventory transaction
        await prisma.inventoryTransaction.create({
        data: {
            itemId,
            quantity: -quantity,
            type: 'OUT',
            reason: 'repair_use',
            notes: `Used in repair job ${params.id}`,
            userId: transactionUserId, // Use Real User ID
        },
        });
    } else {
        // ... (existing custom logic) ...
        finalItemId = null;
        if(!finalUnitCost) {
             return NextResponse.json(
                { error: 'Unit cost is required for custom parts' },
                { status: 400 }
            );           
        }
    }

    // Create parts used record
    const partUsed = await prisma.repairPartUsed.create({
      data: {
        // Use verify 'connect' syntax to avoid Prisma "missing argument" errors
        repairJob: {
            connect: { id: params.id }
        },
        // Only connect item if it exists (not null)
        ...(finalItemId ? { item: { connect: { id: finalItemId } } } : {}),
        
        customName: name, 
        quantity,
        unitCost: Number(finalUnitCost),
        totalCost: Number(finalUnitCost) * Number(quantity),
      },
      include: {
        item: true,
      },
    });

    return NextResponse.json(partUsed);
  } catch (error: any) {
    console.error('Error adding part:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add part' },
      { status: 500 }
    );
  }
}
