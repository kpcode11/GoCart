import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    // Run queries concurrently
    const [orders, stores, products, allOrders, revenueAgg] = await Promise.all([
      prisma.order.count(),
      prisma.store.count(),
      prisma.product.count(),
      prisma.order.findMany({
        select: { createdAt: true, total: true },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
      })
    ]);

    const revenue = (revenueAgg._sum.total ?? 0).toFixed(2);

    const dashboardData = {
      orders,
      stores,
      products,
      revenue,
      allOrders,
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 },
    );
  }
}
