import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { deviceId } = body;

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
  }

  const experiment = await prisma.experiment.findUnique({ where: { id } });

  if (!experiment) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  if (!experiment.active) {
    return NextResponse.json({ error: "Experiment is not active" }, { status: 400 });
  }

  // Check for existing assignment
  const existing = await prisma.assignment.findUnique({
    where: { experimentId_deviceId: { experimentId: id, deviceId } },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  // Assign based on ratio
  const variant = Math.random() * 100 < experiment.ratioA ? "A" : "B";

  const assignment = await prisma.assignment.create({
    data: { experimentId: id, deviceId, variant },
  });

  return NextResponse.json(assignment, { status: 201 });
}
