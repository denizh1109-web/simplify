import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const FREE_DOC_LIMIT = 3;

function hmacSign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

async function readSignedCookie(name: string, secret: string) {
  const store = await cookies();
  const raw = store.get(name)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = hmacSign(payload, secret);
  if (!safeEqual(expected, sig)) return null;
  return payload;
}

export async function GET() {
  const secret = process.env.APP_COOKIE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server ist nicht konfiguriert." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const premium = await readSignedCookie("kk_premium", secret);
  if (premium) {
    return NextResponse.json(
      { premium: true, remaining: null },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const usedRaw = await readSignedCookie("kk_used", secret);
  const used = Math.max(0, Math.min(999, Number.parseInt(usedRaw || "0", 10) || 0));
  const remaining = Math.max(0, FREE_DOC_LIMIT - used);

  return NextResponse.json(
    { premium: false, remaining },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
