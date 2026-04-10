"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Experiment {
  id: string;
  key: string;
  name: string;
  description: string | null;
  ratioA: number;
  variantALabel: string;
  variantBLabel: string;
  active: boolean;
  createdAt: string;
  _count: { assignments: number };
}

export default function Home() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [ratioA, setRatioA] = useState(50);
  const [variantALabel, setVariantALabel] = useState("");
  const [variantAValue, setVariantAValue] = useState("");
  const [variantBLabel, setVariantBLabel] = useState("");
  const [variantBValue, setVariantBValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExperiments = async () => {
    const res = await fetch("/api/experiments");
    const data = await res.json();
    setExperiments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !key.trim()) return;

    const res = await fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        key,
        description,
        ratioA,
        variantALabel: variantALabel || "A",
        variantAValue: variantAValue || "{}",
        variantBLabel: variantBLabel || "B",
        variantBValue: variantBValue || "{}",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }

    setName("");
    setKey("");
    setDescription("");
    setRatioA(50);
    setVariantALabel("");
    setVariantAValue("");
    setVariantBLabel("");
    setVariantBValue("");
    setShowForm(false);
    fetchExperiments();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/experiments/${id}`, { method: "DELETE" });
    fetchExperiments();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchExperiments();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">A/B Tests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and monitor your experiments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Experiment
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-[#e5e8eb] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Create Experiment
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-4">
              <svg
                className="w-4 h-4 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Experiment Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-[#e5e8eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Homepage CTA Test"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Experiment Key
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) =>
                    setKey(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  className="w-full border border-[#e5e8eb] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="homepage-cta-test"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-[#e5e8eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Optional description"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Traffic Allocation
                </label>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />A:{" "}
                    {ratioA}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    B: {100 - ratioA}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full overflow-hidden pointer-events-none">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${ratioA}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={ratioA}
                  onChange={(e) => setRatioA(Number(e.target.value))}
                  className="w-full relative z-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    A
                  </span>
                  <span className="text-sm font-semibold text-blue-800">
                    Variant A
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={variantALabel}
                    onChange={(e) => setVariantALabel(e.target.value)}
                    className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Label (e.g. Blue Button)"
                  />
                  <input
                    type="text"
                    value={variantAValue}
                    onChange={(e) => setVariantAValue(e.target.value)}
                    className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder='Value JSON (e.g. {"color":"blue"})'
                  />
                </div>
              </div>
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                    B
                  </span>
                  <span className="text-sm font-semibold text-orange-800">
                    Variant B
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={variantBLabel}
                    onChange={(e) => setVariantBLabel(e.target.value)}
                    className="w-full border border-orange-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="Label (e.g. Red Button)"
                  />
                  <input
                    type="text"
                    value={variantBValue}
                    onChange={(e) => setVariantBValue(e.target.value)}
                    className="w-full border border-orange-200 rounded-lg px-3 py-1.5 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder='Value JSON (e.g. {"color":"red"})'
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-[#e5e8eb] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Create Experiment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Experiment List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : experiments.length === 0 ? (
        <div className="bg-white border border-[#e5e8eb] rounded-xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No experiments yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Click &quot;New Experiment&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e8eb] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e8eb] bg-[#f9fafb]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Experiment
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Key
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Allocation
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Users
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e8eb]">
              {experiments.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-[#f9fafb] transition-colors"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/experiments/${exp.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {exp.name}
                    </Link>
                    {exp.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">
                        {exp.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                      {exp.key}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-gray-600">
                          {exp.variantALabel} {exp.ratioA}%
                        </span>
                      </div>
                      <span className="text-gray-300">/</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="text-gray-600">
                          {exp.variantBLabel} {100 - exp.ratioA}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm text-gray-700 font-medium">
                      {exp._count.assignments.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        exp.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exp.active ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {exp.active ? "Running" : "Paused"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(exp.id, exp.active)}
                        className="text-xs px-2.5 py-1 text-gray-600 border border-[#e5e8eb] rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {exp.active ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-xs px-2.5 py-1 text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
