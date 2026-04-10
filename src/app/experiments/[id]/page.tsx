"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Assignment {
  id: string;
  deviceId: string;
  variant: string;
  assignedAt: string;
}

interface Experiment {
  id: string;
  key: string;
  name: string;
  description: string | null;
  ratioA: number;
  variantALabel: string;
  variantAValue: string;
  variantBLabel: string;
  variantBValue: string;
  active: boolean;
  createdAt: string;
  assignments: Assignment[];
}

export default function ExperimentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [ratioA, setRatioA] = useState(50);
  const [variantALabel, setVariantALabel] = useState("");
  const [variantAValue, setVariantAValue] = useState("");
  const [variantBLabel, setVariantBLabel] = useState("");
  const [variantBValue, setVariantBValue] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [assignResult, setAssignResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [variantFilter, setVariantFilter] = useState<"ALL" | "A" | "B">("ALL");

  const fetchExperiment = async () => {
    const res = await fetch(`/api/experiments/${id}`);
    const data = await res.json();
    setExperiment(data);
    setRatioA(data.ratioA);
    setVariantALabel(data.variantALabel);
    setVariantAValue(data.variantAValue);
    setVariantBLabel(data.variantBLabel);
    setVariantBValue(data.variantBValue);
  };

  useEffect(() => {
    fetchExperiment();
  }, [id]);

  const handleUpdateSettings = async () => {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ratioA,
        variantALabel,
        variantAValue,
        variantBLabel,
        variantBValue,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetchExperiment();
  };

  const handleToggle = async () => {
    if (!experiment) return;
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !experiment.active }),
    });
    fetchExperiment();
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId.trim()) return;

    const res = await fetch(`/api/experiments/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    const data = await res.json();

    if (res.ok) {
      setAssignResult(`Device "${deviceId}" → Variant ${data.variant}`);
      setDeviceId("");
      fetchExperiment();
    } else {
      setAssignResult(`Error: ${data.error}`);
    }
  };

  if (!experiment) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12 text-gray-400">Loading...</div>
      </div>
    );
  }

  const countA = experiment.assignments.filter((a) => a.variant === "A").length;
  const countB = experiment.assignments.filter((a) => a.variant === "B").length;
  const total = experiment.assignments.length;
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((countB / total) * 100) : 0;

  const filteredAssignments = experiment.assignments.filter((a) => {
    const matchesSearch = search
      ? a.deviceId.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesVariant =
      variantFilter === "ALL" ? true : a.variant === variantFilter;
    return matchesSearch && matchesVariant;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-indigo-600 transition-colors">
          A/B Tests
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{experiment.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-[#e5e8eb] rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {experiment.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  experiment.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    experiment.active ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                {experiment.active ? "Running" : "Paused"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                Key: {experiment.key}
              </code>
              <span className="text-xs text-gray-400">
                Created{" "}
                {new Date(experiment.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            {experiment.description && (
              <p className="text-sm text-gray-500 mt-3">
                {experiment.description}
              </p>
            )}
          </div>
          <button
            onClick={handleToggle}
            className={`text-sm px-4 py-1.5 rounded-lg border font-medium transition-colors ${
              experiment.active
                ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {experiment.active ? "Pause" : "Resume"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Total Exposed Devices</span>
            <span className="font-medium text-gray-900">
              {total.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
            {total > 0 && (
              <>
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${pctA}%` }}
                />
                <div
                  className="bg-orange-500 transition-all"
                  style={{ width: `${pctB}%` }}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-blue-500" />
              {experiment.variantALabel}: {countA.toLocaleString()} ({pctA}%)
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-orange-500" />
              {experiment.variantBLabel}: {countB.toLocaleString()} ({pctB}%)
            </div>
          </div>
        </div>
      </div>

      {/* API Integration */}
      <div className="bg-white border border-[#e5e8eb] rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <h2 className="text-sm font-semibold text-gray-900">
            API Integration
          </h2>
        </div>
        <div className="bg-[#1e1e2e] rounded-lg px-4 py-3">
          <code className="text-sm text-emerald-400 font-mono">
            <span className="text-purple-400">GET</span>{" "}
            /api/assign?key={experiment.key}&deviceId=
            <span className="text-yellow-300">DEVICE_ID</span>
          </code>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Returns: {`{ variant, label, value }`} — same device always gets same
          variant
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Settings */}
        <div className="bg-white border border-[#e5e8eb] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Experiment Settings
          </h2>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600">
                Traffic Allocation
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {variantALabel}: {ratioA}%
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {variantBLabel}: {100 - ratioA}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={ratioA}
              onChange={(e) => setRatioA(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border border-blue-200 rounded-xl p-3 bg-blue-50/40">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-4 h-4 rounded bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  A
                </span>
                <span className="text-xs font-semibold text-blue-800">
                  Variant A
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={variantALabel}
                  onChange={(e) => setVariantALabel(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={variantAValue}
                  onChange={(e) => setVariantAValue(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder='{"color": "blue"}'
                />
              </div>
            </div>
            <div className="border border-orange-200 rounded-xl p-3 bg-orange-50/40">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-4 h-4 rounded bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                  B
                </span>
                <span className="text-xs font-semibold text-orange-800">
                  Variant B
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={variantBLabel}
                  onChange={(e) => setVariantBLabel(e.target.value)}
                  className="w-full border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={variantBValue}
                  onChange={(e) => setVariantBValue(e.target.value)}
                  className="w-full border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder='{"color": "red"}'
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateSettings}
            className="w-full py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>

        {/* Test Assignment */}
        <div className="bg-white border border-[#e5e8eb] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Test Assignment
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Enter a Device ID to test the assignment logic.
          </p>
          <form onSubmit={handleAssign} className="flex gap-2 mb-3">
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="flex-1 border border-[#e5e8eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Device ID"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Assign
            </button>
          </form>
          {assignResult && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                assignResult.startsWith("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {assignResult}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Table */}
      <div className="bg-white border border-[#e5e8eb] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e8eb]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Assignment Log
            </h2>
            <span className="text-xs text-gray-400">
              {total.toLocaleString()} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-[#e5e8eb] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search by Device ID..."
              />
            </div>
            <div className="flex items-center border border-[#e5e8eb] rounded-lg overflow-hidden">
              {(["ALL", "A", "B"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariantFilter(v)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    variantFilter === v
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v === "ALL"
                    ? "All"
                    : v === "A"
                    ? experiment.variantALabel
                    : experiment.variantBLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
        {experiment.assignments.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No assignments yet. Use the test panel above or the API to assign
            devices.
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No results found.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-2.5">
                  Device ID
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-2.5">
                  Variant
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-2.5">
                  Assigned At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e8eb]">
              {filteredAssignments.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-[#f9fafb] transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-gray-700 font-mono">
                    {a.deviceId}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.variant === "A"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          a.variant === "A" ? "bg-blue-500" : "bg-orange-500"
                        }`}
                      />
                      {a.variant === "A"
                        ? experiment.variantALabel
                        : experiment.variantBLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">
                    {new Date(a.assignedAt).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#f9fafb]">
                <td
                  colSpan={3}
                  className="px-5 py-2.5 text-xs text-gray-400 text-center"
                >
                  Showing {filteredAssignments.length} of{" "}
                  {total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
