import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const key = searchParams.get("key");
  const deviceId = searchParams.get("deviceId");

  if (!key || !deviceId) {
    return NextResponse.json(
      { error: "key and deviceId are required" },
      { status: 400 }
    );
  }

  const experiment = await prisma.experiment.findUnique({ where: { key } });

  if (!experiment) {
    return NextResponse.json(
      { error: "Experiment not found" },
      { status: 404 }
    );
  }

  if (!experiment.active) {
    return NextResponse.json(
      { error: "Experiment is not active" },
      { status: 400 }
    );
  }

  // Check for existing assignment
  const existing = await prisma.assignment.findUnique({
    where: {
      experimentId_deviceId: { experimentId: experiment.id, deviceId },
    },
  });

  if (existing) {
    const isA = existing.variant === "A";
    return NextResponse.json({
      variant: existing.variant,
      label: isA ? experiment.variantALabel : experiment.variantBLabel,
      value: JSON.parse(isA ? experiment.variantAValue : experiment.variantBValue),
    });
  }

  // Assign based on ratio
  const variant = Math.random() * 100 < experiment.ratioA ? "A" : "B";

  await prisma.assignment.create({
    data: { experimentId: experiment.id, deviceId, variant },
  });

  const isA = variant === "A";
  return NextResponse.json({
    variant,
    label: isA ? experiment.variantALabel : experiment.variantBLabel,
    value: JSON.parse(isA ? experiment.variantAValue : experiment.variantBValue),
  });
}
