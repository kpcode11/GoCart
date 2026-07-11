import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//Get dashboard data for seller (total orders, total earnings, total products)
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ message: "not authorized" }, { status: 401 });
    }

    const [ordersAgg, totalProducts, ratings] = await Promise.all([
      prisma.order.aggregate({
        where: { storeId },
        _count: true,
        _sum: { total: true },
      }),
      prisma.product.count({
        where: { storeId },
      }),
      prisma.rating.findMany({
        where: { product: { storeId } },
        include: { user: true, product: true },
      })
    ]);

    const totalEarningsValue = ordersAgg._sum.total ?? 0;

    const dashboardData = {
      ratings,
      totalOrders: ordersAgg._count,
      totalEarnings: Math.round(totalEarningsValue * 100) / 100,
      totalProducts,
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 404 },
    );
  }
}
