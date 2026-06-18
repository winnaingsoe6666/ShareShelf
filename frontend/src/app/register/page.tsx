"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [community, setCommunity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(res.data.message || "Registration failed");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-emerald-700">ShareShelf</Link>
          <h1 className="mt-4 text-xl font-semibold text-stone-900">Create your account</h1>
          <p className="mt-1 text-sm text-stone-600">Join your community tool library</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="space-y-1">
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="text-xs text-stone-500">Must be at least 8 characters with one uppercase letter and one digit.</p>
          </div>
          <Input label="Community (optional)" value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. Downtown, University, Apt 4B" />
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
