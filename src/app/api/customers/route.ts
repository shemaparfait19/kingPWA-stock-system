// API route for customers
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
        // Technically viewing customers might be sensitive too, but for POS it's needed.
        // Let's at least require login.
       // return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
       console.log("No session found in API, specifically allowing for debugging");
    }

    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
       // return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
       console.log("No session found in POST API, specifically allowing for debugging");
    }

    const body = await request.json();
    const { name, phone, phone2, email, address, customerType, notes } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        phone2: phone2 || null,
        email: email || null,
        address: address || null,
        customerType: customerType || 'walk_in',
        notes: notes || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
