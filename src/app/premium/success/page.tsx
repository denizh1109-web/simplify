import { Suspense } from "react";
import PremiumSuccessClient from "./success-client";

export default function PremiumSuccessPage() {
  return (
    <Suspense>
      <PremiumSuccessClient />
    </Suspense>
  );
}
