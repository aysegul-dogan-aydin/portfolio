"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("admin_authenticated");
      if (authStatus === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Only redirect if not already on auth page
        if (pathname !== "/admin/auth") {
          router.push("/admin/auth");
        }
      }
    };

    checkAuth();
  }, [router, pathname]);

  // If we're on the auth page, don't show the guard
  if (pathname === "/admin/auth") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
