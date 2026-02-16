import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const cart = body?.cart ?? {};

    await prisma.user.update({
      where: { id: userId },
      data: { cart },
    });

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Failed to update cart" },
      { status: 400 },
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cart: true },
    });

    return NextResponse.json({ cart: user?.cart ?? {} });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch cart" },
      { status: 400 },
    );
  }
}
