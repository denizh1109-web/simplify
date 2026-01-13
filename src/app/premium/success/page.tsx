"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PremiumSuccessPage() {
  const params = useSearchParams();
  const sessionId = useMemo(() => params.get("session_id") || "", [params]);

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/premium/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!res.ok) throw new Error();
        if (!cancelled) setStatus("ok");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    if (sessionId) void run();
    else setStatus("error");

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-app-bg text-foreground">
      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <div className="rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Premium</h1>
          </div>
          <p className="mt-2 text-sm text-gov-brown">
            {status === "loading" && "Wir bestätigen deine Zahlung…"}
            {status === "ok" && "Premium ist aktiv. Du kannst jetzt unbegrenzt Dokumente vereinfachen."}
            {status === "error" && "Premium konnte nicht bestätigt werden. Bitte kontaktiere den Support."}
          </p>
          <a
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gov-blue px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-gov-blue/90"
          >
            Zurück zur App
          </a>
        </div>
      </div>
    </div>
  );
}
