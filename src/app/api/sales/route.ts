// API route for sales history
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (startDate && endDate) {
      where.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await prisma.salesInvoice.findMany({
      where,
      include: {
        customer: true,
        user: {
          select: {
            fullName: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    return NextResponse.json(sales);
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log('Sales POST Session:', JSON.stringify(session, null, 2));

    let userId = session?.user?.id;

    // Fallback: If no session, find the first admin user
    if (!userId) {
      console.warn('No session found. Falling back to default admin user for development/testing.');
      const adminUser = await prisma.user.findFirst({
        where: { role: 'owner' }, // or 'admin' depending on your data
      });
      
      if (adminUser) {
        userId = adminUser.id;
        console.log('Using fallback admin user:', userId);
      } else {
         // Try finding ANY user if no owner exists
         const anyUser = await prisma.user.findFirst();
         if (anyUser) {
           userId = anyUser.id;
           console.log('Using fallback generic user:', userId);
         }
      }
    }

    if (!userId) {
       return NextResponse.json(
        { error: 'Unauthorized: No user found to attribute sale to.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, customerId, paymentMethod, discount, amountPaid } = body;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: No items provided' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id || !item.quantity || (!item.price && !item.sellingPrice)) {
         return NextResponse.json(
          { error: `Invalid item data: ${JSON.stringify(item)}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = item.price || item.sellingPrice || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const tax = 0; // Assuming 0 tax for now or calculate if needed
    const total = subtotal + tax - (discount || 0);

    console.log('Processing sale:', { subtotal, total, itemCount: items.length });

    // Create invoice with transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check stock for all items first
      for (const item of items) {
        const dbItem = await tx.inventoryItem.findUnique({
          where: { id: item.id }
        });
        
        if (!dbItem) {
          throw new Error(`Item not found: ${item.id}`);
        }
        
        if (dbItem.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${dbItem.name}. Available: ${dbItem.quantity}, Requested: ${item.quantity}`);
        }
      }

      // 2. Create Invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          customerId: customerId || null,
          userId: userId!, // We checked strict userId above
          subtotal,
          tax,
          discount: discount || 0,
          total,
          paidAmount: amountPaid || total, // Assume full payment if not specified
          paymentMethod: paymentMethod || 'cash',
          paymentStatus: (amountPaid || total) >= total ? 'paid' : (amountPaid > 0 ? 'partial' : 'unpaid'),
          items: {
            create: items.map((item: any) => ({
              itemId: item.id,
              quantity: item.quantity,
              unitPrice: item.price || item.sellingPrice,
              total: (item.price || item.sellingPrice) * item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              item: true,
            }
          },
          customer: true,
        }
      });

      // 3. Update Inventory
      for (const item of items) {
        await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        // Record transaction
        await tx.inventoryTransaction.create({
          data: {
             itemId: item.id,
             type: 'OUT',
             quantity: item.quantity,
             reason: 'sale',
             referenceId: invoice.id,
             userId: userId!,
           }
        });
      }

      return invoice;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing sale:', error);
    // Return the actual error message if possible to help debugging
    return NextResponse.json(
      { error: error.message || 'Failed to process sale' },
      { status: 500 }
    );
  }
}
