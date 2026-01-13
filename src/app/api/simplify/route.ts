import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import Groq from "groq-sdk";

const SYSTEM_PROMPT =
  "Du bist ein Assistent für Verwaltungshilfe (GovTech). Deine Aufgabe: komplexe juristische/behördliche Schreiben in klare, leicht verständliche Sprache übertragen.\n\nWICHTIG (DSGVO): Gib NIEMALS personenbezogene Daten aus (z.B. Namen, Anschriften, E-Mail, Telefonnummern, IBAN, Aktenzeichen mit personenbezogenem Bezug). Wenn solche Daten im Eingangstext vorkommen, lasse sie weg oder ersetze sie durch neutrale Platzhalter wie [PERSON], [ADRESSE], [KONTAKT].\n\nFORMAT (sehr wichtig):\n- Gib NUR Klartext aus (Plain Text).\n- KEIN Markdown. Keine Hashtags (#), keine Markdown-Überschriften, keine Codeblöcke.\n- Verwende als Abschnittstitel ausschließlich nummerierte Überschriften im Stil: '1) ...' (ohne #).\n\nSPRACHE (sehr wichtig):\n- Der gesamte Output (inklusive Abschnittstitel) MUSS in der gewählten Zielsprache sein.\n- Verwende keine deutschen Wörter, wenn die Zielsprache nicht Deutsch ist.\n\nRegeln: (1) Keine inhaltlichen Details, Beträge, Fristen oder Pflichten weglassen. (2) Schreibe in 'Einfache Sprache'. (3) Verwende immer die gewählte Zielsprache. (4) Gib am Ende IMMER einen Disclaimer in der Zielsprache aus, sinngemäß: 'Dies ist eine KI-generierte Vereinfachung zur Verständnishilfe und stellt keine Rechtsberatung dar.' (5) Ausgabe soll ein wiederholbares Schema haben.\n\nAUSGABE-SCHEMA (immer in dieser Reihenfolge; Abschnittstitel in Zielsprache übersetzen, keine #):\n1) Short summary (2-4 sentences)\n2) What this is about (bullet points, plain text)\n3) What you need to do (concrete steps)\n4) Deadlines & dates (bullet points; if none: state clearly that no clear deadline is mentioned)\n5) Required documents/information (bullet points)\n6) What happens if you do nothing (1-3 sentences)\n7) Questions/contact (only general info from the text; NO personal data)\n8) Disclaimer (see rule 4)";

function redactPersonalData(input: string) {
  let t = input;

  // Emails
  t = t.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[KONTAKT]");

  // Phone numbers (simple, permissive)
  t = t.replace(
    /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,}[\s-]?\d{2,}(?:[\s-]?\d{2,})/g,
    "[KONTAKT]"
  );

  // IBAN
  t = t.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, "[IBAN]");

  // German/Austrian postal codes + city in one line
  t = t.replace(/\b\d{4,5}\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß\- ]{2,}\b/g, "[ORT]");

  // Street + house number (very rough)
  t = t.replace(
    /\b[A-ZÄÖÜ][A-Za-zÄÖÜäöüß\- ]{2,}(?:straße|strasse|gasse|weg|platz|allee|ring|damm|ufer|promenade)\s+\d+[A-Za-z]?\b/gi,
    "[ADRESSE]"
  );

  // Common header fields
  t = t.replace(
    /^(\s*)(name|vorname|nachname|adresse|anschrift|straße|strasse|plz|ort|telefon|tel\.|e-mail|email|iban|kontoinhaber|empfänger|absender)\s*:\s*.*$/gim,
    "$1$2: [REDAKTIERT]"
  );

  return t;
}

type Body = {
  text?: string;
  targetLanguage?: string;
};

const MAX_TEXT_CHARS = 60_000;
const FREE_DOC_LIMIT = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

const ALLOWED_LANGUAGES = new Set([
  "Deutsch",
  "Englisch",
  "Türkisch",
  "Ukrainisch",
  "Arabisch",
  "Polnisch",
  "Russisch",
  "Serbokroatisch",
  "Rumänisch",
  "Italienisch",
  "Spanisch",
  "Französisch",
]);

type RateState = { windowStart: number; count: number };
const rateLimitState = new Map<string, RateState>();

function getClientKey(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0]?.trim() || "local";
  const ua = req.headers.get("user-agent") || "";
  return `${ip}::${ua.slice(0, 40)}`;
}

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
  try {
    const secret = process.env.APP_COOKIE_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server ist nicht konfiguriert: APP_COOKIE_SECRET fehlt." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const clientKey = getClientKey(req);
    const now = Date.now();
    const st = rateLimitState.get(clientKey);
    if (!st || now - st.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitState.set(clientKey, { windowStart: now, count: 1 });
    } else {
      st.count += 1;
      if (st.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Zu viele Anfragen. Bitte kurz warten und erneut versuchen." },
          { status: 429, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    const body = (await req.json()) as Body;

    const text = (body.text || "").trim();
    const targetLanguage = (body.targetLanguage || "Deutsch").trim();

    if (!text) {
      return NextResponse.json(
        { error: "Kein Text übergeben." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (text.length > MAX_TEXT_CHARS) {
      return NextResponse.json(
        { error: "Text ist zu lang. Bitte ein kürzeres Dokument verwenden." },
        { status: 413, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!ALLOWED_LANGUAGES.has(targetLanguage)) {
      return NextResponse.json(
        { error: "Ungültige Zielsprache." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const premium = await readSignedCookie("kk_premium", secret);
    const usedRaw = premium ? null : await readSignedCookie("kk_used", secret);
    const used = premium
      ? 0
      : Math.max(0, Math.min(999, Number.parseInt(usedRaw || "0", 10) || 0));
    if (!premium && used >= FREE_DOC_LIMIT) {
      return NextResponse.json(
        { error: "Free-Limit erreicht (3 Dokumente). Bitte Premium aktivieren." },
        { status: 402, headers: { "Cache-Control": "no-store" } }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Server ist nicht konfiguriert: GROQ_API_KEY fehlt. Lege eine .env.local an.",
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const client = new Groq({ apiKey });

    const redactedText = redactPersonalData(text);

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Zielsprache: ${targetLanguage}.\n\nEingangstext (personenbezogene Daten wurden bereits soweit möglich serverseitig redigiert):\n\n${redactedText}`,
        },
      ],
    });

    const simplifiedText = completion.choices?.[0]?.message?.content?.trim();

    if (!simplifiedText) {
      return NextResponse.json(
        { error: "Keine Antwort vom Modell erhalten." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!premium) {
      await writeSignedCookie("kk_used", String(used + 1), secret, {
        maxAgeSec: 60 * 60 * 24 * 365,
      });
    }

    return NextResponse.json(
      { simplifiedText },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Serverfehler. Bitte später erneut versuchen." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
