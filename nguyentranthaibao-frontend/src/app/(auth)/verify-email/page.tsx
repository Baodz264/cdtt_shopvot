import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
