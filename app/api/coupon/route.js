import prisma from "@/lib/prisma";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const normalized = code.toUpperCase();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: normalized,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (coupon.forNewUser) {
      const userorders = await prisma.order.findMany({ where: { userId } });

      if (userorders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users" },
          { status: 400 },
        );
      }
    }

    if (coupon.forMember) {
      if (!userId) {
        return NextResponse.json(
          { error: "Coupon valid for members only" },
          { status: 401 },
        );
      }

      // Prefer session claim check (fast & reliable); fallback to Clerk user metadata.
      const isPlusFromSession = typeof has === "function" && has({ plan: "plus" });
      if (!isPlusFromSession) {
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          const publicMeta = user?.publicMetadata ?? {};
          const privateMeta = user?.privateMetadata ?? {};

          const isPlusFromMeta =
            publicMeta?.plan === "plus" ||
            publicMeta?.isPlus === true ||
            privateMeta?.plan === "plus" ||
            (Array.isArray(publicMeta?.subscriptions) && publicMeta.subscriptions.includes("plus")) ||
            (Array.isArray(privateMeta?.subscriptions) && privateMeta.subscriptions.includes("plus"));

          if (!isPlusFromMeta) {
            return NextResponse.json(
              { error: "Coupon valid for members only" },
              { status: 401 },
            );
          }
        } catch (err) {
          console.error("Failed to verify membership:", err);
          return NextResponse.json({ error: "Failed to verify membership" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
