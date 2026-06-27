"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    let isMounted = true;

    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        if (isMounted) {
          if (res.data.success) {
            setStatus("success");
            saveAuth(res.data.data);
          } else {
            setStatus("error");
            setErrorMessage(res.data.message || "Failed to verify email.");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err.response?.data?.message || "Failed to verify email. The link may have expired.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 text-purple-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-500">Please wait while we verify your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-500">Your account has been successfully verified and you are now logged in.</p>
            <Button onClick={() => router.push("/items")} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{errorMessage}</p>
            <p className="text-gray-500 text-sm">If you need a new verification link, please try logging in to request one.</p>
            <Button onClick={() => router.push("/login")} variant="outline" className="w-full mt-4">
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
