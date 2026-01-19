import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth-helper';
import { startOfDay, endOfDay, parseISO, format, isValid } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || !['owner', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to current month if no dates provided
    const now = new Date();
    const startDate = startDateParam ? parseISO(startDateParam) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = endDateParam ? parseISO(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (!isValid(startDate) || !isValid(endDate)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // 1. Fetch Completed Repair Jobs (Income & Parts Cost)
    const repairs = await prisma.repairJob.findMany({
      where: {
        AND: [
             // Use completedAt or collectedAt or updatedAt? Use updatedAt for simplicity or completedAt if strictly enforced
             // User's report seems to trigger on dates. Let's use `updatedAt` or `completedAt`.
             // If status is 'collected' or 'ready', it counts as potential income?
             // Actually, `depositPaid` happens anytime. `balance` happens later.
             // To simplify: We track based on `createdAt` or `completedAt`. 
             // Let's use `createdAt` for now to match the user's likely mental model of "Jobs received/done today", 
             // OR `updatedAt` for when money came in? 
             // BETTER: Use `completedAt` for finished jobs, or fall back to `createdAt`.
             // Given the "RAPOLO" context, it's usually cash flow. But we lack a separate "Payments" table.
             // We will use `createdAt` for grouping for now as it's the stable "Job Date".
             { createdAt: { gte: startOfDay(startDate) } },
             { createdAt: { lte: endOfDay(endDate) } }
        ]
      },
      include: {
        assignedUser: true,
        partsUsed: true
      }
    });

    // 2. Fetch Sales (Income & COGS)
    const sales = await prisma.salesInvoice.findMany({
      where: {
        saleDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      },
      include: {
        user: true,
        items: {
          include: {
            item: true
          }
        }
      }
    });

    // 3. Fetch Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      }
    });

    // 4. Aggregate Data
    // We want a daily breakdown and a technician breakdown.
    
    // Map to hold daily data
    // Key: YYYY-MM-DD
    const dailyMap = new Map<string, any>();

    // Helper to init day
    const getDayEntry = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        if (!dailyMap.has(key)) {
            dailyMap.set(key, {
                date: key,
                income: 0,
                loss: 0, // Costs (Parts + Expenses)
                expenses: 0,
                technicians: {} // { 'UserId': { name: 'King', income: 0, loss: 0 } }
            });
        }
        return dailyMap.get(key);
    };

    // Helper to init tech in a day
    const getTechEntry = (dayEntry: any, user: any) => {
        const userId = user?.id || 'unknown';
        const userName = user?.fullName || 'Unknown';
        // Map user "Alex" or "King" based on name parsing if needed, but fullName is safer.
        
        if (!dayEntry.technicians[userId]) {
            dayEntry.technicians[userId] = {
                name: userName,
                income: 0,
                loss: 0
            };
        }
        return dayEntry.technicians[userId];
    };

    // Process Repairs
    repairs.forEach(repair => {
        // Calculate Repair Income (Actual Cost)
        // If Actual Cost is 0 (pending), use Estimated? No, report assumes finalized.
        // We only count it if it has cost.
        const income = repair.actualCost;
        
        // Calculate Repair Loss (Parts Cost)
        let partsCost = 0;
        repair.partsUsed.forEach(part => {
             partsCost += part.totalCost || (part.unitCost * part.quantity) || 0;
        });

        const entry = getDayEntry(repair.createdAt); // Group by Created Date
        const tech = getTechEntry(entry, repair.assignedUser);

        entry.income += income;
        entry.loss += partsCost;
        
        tech.income += income;
        tech.loss += partsCost;
    });

    // Process Sales
    sales.forEach(sale => {
        const income = sale.total; // Sale Total
        
        // Calculate COGS (Cost of parts sold)
        let cogs = 0;
        sale.items.forEach(lineItem => {
            // Unit cost derived from original item if possible.
            // SalesItem doesn't store historical unitCost. We check current item.unitCost
            // This is an approximation if cost changed, but best we have.
            cogs += (lineItem.item?.unitCost || 0) * lineItem.quantity;
        });

        const entry = getDayEntry(sale.saleDate);
        const tech = getTechEntry(entry, sale.user);

        entry.income += income;
        entry.loss += cogs;

        tech.income += income;
        tech.loss += cogs;
    });

    // Process Expenses
    expenses.forEach(expense => {
        const entry = getDayEntry(expense.expenseDate);
        entry.expenses += expense.amount;
        entry.loss += expense.amount; // Expenses count towards total "Loss" (Outflow)
    });

    // Convert Map to sorted Array
    const dailyReport = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate Summary/Totals
    const summary = {
        totalIncome: 0,
        totalLoss: 0,
        totalExpenses: 0,
        netProfit: 0,
        byTechnician: {} as any
    };

    dailyReport.forEach(day => {
        summary.totalIncome += day.income;
        summary.totalLoss += day.loss;
        summary.totalExpenses += day.expenses;
        
        // Aggregate Tech totals
        Object.values(day.technicians).forEach((t: any) => {
            if (!summary.byTechnician[t.name]) {
                summary.byTechnician[t.name] = { income: 0, loss: 0, profit: 0 };
            }
            summary.byTechnician[t.name].income += t.income;
            summary.byTechnician[t.name].loss += t.loss;
            summary.byTechnician[t.name].profit += (t.income - t.loss);
        });
    });

    summary.netProfit = summary.totalIncome - summary.totalLoss;

    return NextResponse.json({
        period: { start: startDate, end: endDate },
        daily: dailyReport,
        summary
    });

  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
