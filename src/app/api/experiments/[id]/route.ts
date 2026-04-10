import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: {
      assignments: { orderBy: { assignedAt: "desc" } },
      _count: { select: { assignments: true } },
    },
  });

  if (!experiment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(experiment);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { ratioA, active, name, description, variantALabel, variantAValue, variantBLabel, variantBValue } = body;

  const data: Record<string, unknown> = {};
  if (ratioA !== undefined) data.ratioA = ratioA;
  if (active !== undefined) data.active = active;
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (variantALabel !== undefined) data.variantALabel = variantALabel;
  if (variantAValue !== undefined) data.variantAValue = variantAValue;
  if (variantBLabel !== undefined) data.variantBLabel = variantBLabel;
  if (variantBValue !== undefined) data.variantBValue = variantBValue;

  const experiment = await prisma.experiment.update({
    where: { id },
    data,
  });

  return NextResponse.json(experiment);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.experiment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
