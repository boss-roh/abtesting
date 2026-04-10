"use client";

import { useAuth } from "@/lib/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, checking } = useAuth();

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
