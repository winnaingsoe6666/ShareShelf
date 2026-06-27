"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side auth guard.
 * Wraps protected pages — redirects to /login if no JWT token is found in localStorage.
 * Passes the current path as returnUrl so the user is redirected back after login.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return <>{children}</>;
}
