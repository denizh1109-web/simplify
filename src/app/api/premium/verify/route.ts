import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import Stripe from "stripe";

function hmacSign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

async function writeSignedCookie(
  name: string,
  payload: string,
  secret: string,
  opts?: { maxAgeSec?: number }
) {
  const sig = hmacSign(payload, secret);
  const store = await cookies();
  store.set({
    name,
    value: `${payload}.${sig}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: opts?.maxAgeSec,
  });
}

export async function POST(req: Request) {
  const secret = process.env.APP_COOKIE_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeSecret) {
    return NextResponse.json(
      { error: "Server ist nicht konfiguriert." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = (await req.json()) as { session_id?: string };
  const sessionId = (body.session_id || "").trim();
  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id fehlt." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2025-12-15.clover",
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const isPaid = session.payment_status === "paid";
  const subId = typeof session.subscription === "string" ? session.subscription : null;

  let isActiveSub = false;
  if (subId) {
    const sub = await stripe.subscriptions.retrieve(subId);
    isActiveSub = sub.status === "active" || sub.status === "trialing";
  }

  if (!isPaid || !isActiveSub) {
    return NextResponse.json(
      { error: "Premium konnte nicht bestätigt werden." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const payload = `v1:${Date.now()}`;
  await writeSignedCookie("kk_premium", payload, secret, {
    maxAgeSec: 60 * 60 * 24 * 365,
  });

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
