"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function Header() {
  const { authenticated, checking, logout } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) return null;
  if (checking) return null;

  return (
    <header className="bg-white border-b border-[#e5e8eb] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AB</span>
          </div>
          <span className="font-semibold text-[15px] text-gray-900">
            A/B Testing
          </span>
        </Link>
        {authenticated && (
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
