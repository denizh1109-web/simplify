import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (!stripeSecret || !priceId) {
    return NextResponse.json(
      { error: "Stripe ist nicht konfiguriert." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2025-12-15.clover",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    allow_promotion_codes: true,
  });

  return NextResponse.json(
    { url: session.url },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
