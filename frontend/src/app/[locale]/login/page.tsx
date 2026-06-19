"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Library } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

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
        router.push("/items");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr.response?.status;
        if (status === 429) {
          setError("Too many attempts. Please wait and try again.");
        } else if (status === 401) {
          setError(axiosErr.response?.data?.message || "Invalid email or password");
        } else {
          setError("Invalid email or password");
        }
      } else {
        setError("Invalid email or password");
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
              <div className="mb-8 text-center">
                <Library className="mx-auto h-12 w-12 text-purple-300" />
                <h1 className="mt-4 font-heading text-3xl font-bold text-purple-900">
                  Welcome back
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Sign in to your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  Sign In
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
