import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
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
    where: { experimentId_userId: { experimentId: id, userId } },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  // Assign based on ratio
  const variant = Math.random() * 100 < experiment.ratioA ? "A" : "B";

  const assignment = await prisma.assignment.create({
    data: { experimentId: id, userId, variant },
  });

  return NextResponse.json(assignment, { status: 201 });
}
