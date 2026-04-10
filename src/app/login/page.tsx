"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid admin key");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#e5e8eb] rounded-xl p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">AB</span>
            </div>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 text-center mb-1">
            A/B Testing Tool
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter admin key to continue
          </p>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full border border-[#e5e8eb] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Admin Key"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
