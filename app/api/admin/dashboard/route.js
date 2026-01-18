import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/dist/types/server";
import authAdmin from "@/middlewares/authAdmin";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 400 });
    }

    //totol orders
    const orders = await prisma.order.count();
    //total stores
    const stores = await prisma.store.count();
    const allOrders = await prisma.order.findMany({
      select: { createdAt: true, total: true },
    });

    let totalRevenue = 0;
    allOrders.forEach((order) => {
      totalRevenue += order.total;
    });

    const revenue = totalRevenue.toFixed(2);

    //total products
    const products = await prisma.product.count();

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
      { status: 401 },
    );
  }
}
