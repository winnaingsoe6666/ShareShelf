"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { saveAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const returnUrl = searchParams.get("returnUrl");

    if (token && refreshToken) {
      saveAuth({ token, refreshToken, userId: 0, name: "", email: "", trustScore: 0 });
      router.push(returnUrl || "/items");
    } else {
      setState("error");
    }
  }, [searchParams, router]);

  if (state === "error") {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-purple-900">
            Authentication failed
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Something went wrong during sign-in. Please try again.
          </p>
          <a href="/login">
            <Button variant="outline" className="mt-6">
              Back to Sign In
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
        <Loader2 className="mx-auto h-10 w-10 text-purple-400 animate-spin" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-purple-900">
          Signing you in...
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}
