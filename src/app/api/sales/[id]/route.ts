import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth-helper';
import { canDeleteSales } from '@/lib/permissions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(request);
    
    if (!session || !session.user) {
       console.warn(`Unauthorized sales delete attempt - No session`);
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    console.log(`DELETE /api/sales/${params.id} by user:`, session.user.email, 'Role:', userRole);

    const isAuthorized = canDeleteSales(userRole);

    if (!isAuthorized) {
       console.warn(`Unauthorized sales delete attempt by role: ${userRole}`);
       return NextResponse.json({ 
          error: `Unauthorized: Role '${userRole}' cannot delete sales` 
       }, { status: 403 });
    }
    
    await prisma.salesInvoice.delete({
       where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch(e: any) { 
      return NextResponse.json({error: e.message || "Error"}, {status: 500})
  }
}
