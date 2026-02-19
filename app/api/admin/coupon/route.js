import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { coupon } = await request.json();

    if (!coupon || typeof coupon.code !== "string" || !coupon.code.trim()) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // normalize and validate input fields
    const normalizedCoupon = {
      ...coupon,
      code: coupon.code.toUpperCase(),
      discount: Number(coupon.discount),
      forMember: !!coupon.forMember,
      forNewUser: !!coupon.forNewUser,
      isPublic: !!coupon.isPublic,
    };

    if (Number.isNaN(normalizedCoupon.discount)) {
      return NextResponse.json({ error: "Coupon discount must be a number" }, { status: 400 });
    }

    const expiresAtDate = new Date(normalizedCoupon.expiresAt);
    if (!normalizedCoupon.expiresAt || isNaN(expiresAtDate.getTime())) {
      return NextResponse.json({ error: "Valid expiresAt is required" }, { status: 400 });
    }

    let created;
    try {
      created = await prisma.coupon.create({ data: normalizedCoupon });
    } catch (err) {
      // Prisma unique constraint error (code P2002)
      if (err?.code === "P2002") {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      }
      throw err;
    }

    // schedule deletion only if expiry is a valid future date
    if (expiresAtDate > new Date()) {
      await inngest.send({
        name: "app/coupon.expired",
        data: {
          code: created.code,
          expires_at: created.expiresAt,
        },
      });
    }

    return NextResponse.json({ message: "coupon added successfully", coupon: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    try {
      await prisma.coupon.delete({ where: { code } });
    } catch (err) {
      // Prisma 'Record to delete does not exist' error
      if (err?.code === "P2025") {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
      }
      throw err;
    }

    return NextResponse.json({ message: "coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({});
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
