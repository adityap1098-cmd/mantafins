import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const periods = await prisma.period.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json({ periods });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, month, year } = body as {
    name: string;
    month: number;
    year: number;
  };

  if (!name || !month || !year) {
    return NextResponse.json(
      { error: "name, month, year are required" },
      { status: 400 }
    );
  }

  const period = await prisma.period.create({
    data: { name: name.trim(), month: Number(month), year: Number(year) },
  });

  return NextResponse.json({ period }, { status: 201 });
}
