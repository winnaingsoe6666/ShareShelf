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
        saveAuth(res.data.data);
        router.push("/items");
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
                  label={t("registerPage.name")}
                  placeholder={t("registerPage.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label={t("registerPage.email")}
                  type="email"
                  placeholder={t("registerPage.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="space-y-1">
                  <Input
                    label={t("registerPage.password")}
                    type="password"
                    placeholder={t("registerPage.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-stone-500">
                    Must be at least 8 characters with one uppercase letter and one digit.
                  </p>
                  {/* Password strength indicator */}
                  {password && (
                    <>
                      <div className="mt-1 flex gap-1">
                        {[1, 2, 3].map((level) => {
                          const filled = level <= strength;
                          const color =
                            strength === 1
                              ? "bg-red-500"
                              : strength === 2
                                ? "bg-amber-500"
                                : "bg-green-500";
                          return (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                                filled ? color : "bg-stone-200"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {strength === 1
                          ? "Weak"
                          : strength === 2
                            ? "Fair"
                            : "Strong"}{" "}
                        password
                      </p>
                    </>
                  )}
                </div>
                {/* Community field with MapPin icon */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-medium text-purple-800">
                    <MapPin className="h-3.5 w-3.5" /> {t("registerPage.community")}
                  </label>
                  <Input
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    placeholder={t("registerPage.communityPlaceholder")}
                  />
                </div>
                <Button type="submit" loading={loading} className="w-full">
                  {loading ? t("registerPage.creating") : t("registerPage.submit")}
                </Button>
              </form>

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
