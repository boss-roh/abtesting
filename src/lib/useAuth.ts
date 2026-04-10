"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/docs"];

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecking(false);
      setAuthenticated(true);
      return;
    }

    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/login");
        } else {
          setAuthenticated(true);
        }
        setChecking(false);
      });
  }, [pathname, router]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
  };

  return { authenticated, checking, logout };
}
