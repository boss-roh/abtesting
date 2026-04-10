import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const experiments = await prisma.experiment.findMany({
    include: {
      assignments: { select: { variant: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = experiments.map((exp) => {
    const countA = exp.assignments.filter((a) => a.variant === "A").length;
    const countB = exp.assignments.filter((a) => a.variant === "B").length;
    const { assignments: _, ...rest } = exp;
    return { ...rest, countA, countB };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, key, description, ratioA, variantALabel, variantAValue, variantBLabel, variantBValue } = body;

  if (!name || !key) {
    return NextResponse.json({ error: "name and key are required" }, { status: 400 });
  }

  const existing = await prisma.experiment.findUnique({ where: { key } });
  if (existing) {
    return NextResponse.json({ error: "key already exists" }, { status: 409 });
  }

  const experiment = await prisma.experiment.create({
    data: {
      name,
      key,
      description: description || null,
      ratioA: ratioA ?? 50,
      variantALabel: variantALabel || "A",
      variantAValue: variantAValue || "{}",
      variantBLabel: variantBLabel || "B",
      variantBValue: variantBValue || "{}",
    },
  });

  return NextResponse.json(experiment, { status: 201 });
}
