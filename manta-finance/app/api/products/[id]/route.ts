import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

// PATCH update a product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await validateSession(token);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.category !== undefined) data.category = String(body.category).trim();
    if (body.hpp !== undefined) data.hpp = Number(body.hpp);
    if (body.hargaJual !== undefined) data.hargaJual = Number(body.hargaJual);
    if (body.stock !== undefined) data.stock = Number(body.stock);

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ product });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === "P2025") {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Gagal update produk" }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await validateSession(token);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Delete stock logs first
    await prisma.stockLog.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === "P2025") {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Gagal hapus produk" }, { status: 500 });
  }
}
