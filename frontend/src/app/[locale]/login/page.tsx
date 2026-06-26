"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Library } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import AuthDivider from "@/components/ui/AuthDivider";
import api from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      router.push("/items");
    }
  }, [router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        saveAuth(res.data.data);
        const returnUrl = searchParams.get("returnUrl");
        router.push(returnUrl || "/items");
      } else {
        setError(res.data.message || t("loginPage.failed"));
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr.response?.status;
        if (status === 429) {
          setError(t("loginPage.failed"));
        } else if (status === 401) {
          setError(axiosErr.response?.data?.message || t("loginPage.failed"));
        } else {
          setError(t("loginPage.failed"));
        }
      } else {
        setError(t("loginPage.failed"));
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
                <Library className="mx-auto h-12 w-12 text-purple-300" />
                <h1 className="mt-4 font-heading text-3xl font-bold text-purple-900">
                  {t("loginPage.title")}
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Sign in to your account
                </p>
              </div>

              <GoogleSignInButton text="Sign in with Google" />
              <AuthDivider />

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {searchParams.get("error") === "google_auth_failed" && !error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    Google sign-in failed. Please try again.
                  </div>
                )}
                <Input
                  label={t("loginPage.email")}
                  type="email"
                  placeholder={t("loginPage.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label={t("loginPage.password")}
                  type="password"
                  placeholder={t("loginPage.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  {loading ? t("loginPage.loggingIn") : t("loginPage.submit")}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-600">
                {t("loginPage.noAccount")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200"
                >
                  {t("loginPage.register")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
