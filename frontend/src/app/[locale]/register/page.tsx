"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPin, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import AuthDivider from "@/components/ui/AuthDivider";
import api from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";

const getStrength = (pwd: string): number => {
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const longEnough = pwd.length >= 8;
  if (longEnough && hasUpper && hasDigit) return 3;
  if (longEnough && (hasUpper || hasDigit)) return 2;
  return 1;
};

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      router.push("/items");
    }
  }, [router]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [community, setCommunity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = password ? getStrength(password) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        community: community || undefined,
      });
      if (res.data.success) {
        setIsSuccess(true);
      } else {
        setError(res.data.message || t("registerPage.failed"));
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || t("registerPage.failed"));
      } else {
        setError(t("registerPage.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 relative">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 bg-pattern-dots opacity-50"
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Green accent bar */}
            <div className="h-1 bg-green-600 w-full" />
            <div className="p-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <Users className="mx-auto h-12 w-12 text-purple-300" />
                <h1 className="mt-4 font-heading text-3xl font-bold text-purple-900">
                  {t("registerPage.title")}
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Join your community tool library
                </p>
              </div>

              <GoogleSignInButton text="Sign up with Google" />


              <p className="mt-6 text-center text-sm text-stone-600">
                {t("registerPage.haveAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200"
                >
                  {t("registerPage.login")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
