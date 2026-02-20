import prisma from "@/lib/prisma";
import { Receipt, Signature } from "lucide-react";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// initialize Stripe with explicit API version to avoid warnings
// use test key in non-production environments if provided
const stripe = new Stripe(
  process.env.NODE_ENV === "production"
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY,
  { apiVersion: "2022-11-15" },
);

export async function POST(request) {
  try {
    const body = await request.text();
    // NextRequest exposes headers via .headers
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderIds, userId, appId } = session.data[0].metadata;

      if (appId != "gocart") {
        return NextResponse.json(
          { received: true },
          { message: "Invalid app id" },
        );
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        //mark order as paid
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: {
                id: orderId,
              },
              data: {
                isPaid: true,
              },
            });
          }),
        );
        //delete cart from user
        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        //delete order from db
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.delete({
              where: { id: orderId },
            });
          }),
        );
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }

      case "payment_intent.canceled": {
        // stripe uses American spelling in webhook events
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }

      default:
        console.log("Unhandled Event type: ", event.type);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const config = {
  api: { bodyparser: false },
};
