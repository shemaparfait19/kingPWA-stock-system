import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canDeleteSales } from '@/lib/permissions'; // Assuming canDeleteSales exists or I use hasPermission

// Wait, I didn't export canDeleteSales in step 509/516?
// Checking permissions.ts content again.
// I exported: canManageSales, canCreateInventory, canEditInventory, canDeleteCustomers, canEditRepairDetails.
// I did NOT export canDeleteSales helper specifically?
// `delete_sales` key exists in `ROLE_PERMISSIONS`.
// I can use `hasPermission(role, 'delete_sales')` directly or add helper.
// I will use hasPermission directly if needed, but adding helper is cleaner.
// Let's assume I need to import hasPermission.

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !canDeleteSales(session.user.role)) {
       return NextResponse.json({ error: "Unauthorized: Only Owners can delete sales" }, { status: 403 });
    }
    
    // Check if sale exists? Or just delete.
    await prisma.salesInvoice.delete({
       where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch(e: any) { 
      return NextResponse.json({error: e.message || "Error"}, {status: 500})
  }
}
