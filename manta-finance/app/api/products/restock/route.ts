import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

// POST restock a product (add stock)
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await validateSession(token);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, qty, note } = body as { productId: string; qty: number; note?: string };

    if (!productId || !qty || qty <= 0) {
      return NextResponse.json({ error: "productId dan qty (>0) wajib diisi" }, { status: 400 });
    }

    // Update product stock
    const product = await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: qty } },
    });

    // Create stock log
    await prisma.stockLog.create({
      data: {
        productId,
        type: "restock",
        qty,
        note: note ?? null,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === "P2025") {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    console.error("Restock error:", err);
    return NextResponse.json({ error: "Gagal restock" }, { status: 500 });
  }
}
