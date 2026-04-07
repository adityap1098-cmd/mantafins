import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { parseProducts } from "@/lib/parser/products";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await validateSession(token);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File wajib diisi" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rows = parseProducts(buffer);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Tidak ada data produk di file" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    const warnings: string[] = [];

    for (const row of rows) {
      if (!row.sku) {
        warnings.push(`Produk "${row.name}" tidak punya SKU, dilewati`);
        continue;
      }

      const existing = await prisma.product.findUnique({ where: { sku: row.sku } });
      if (existing) {
        await prisma.product.update({
          where: { sku: row.sku },
          data: {
            name: row.name,
            category: row.category,
            hpp: row.hpp,
            hargaJual: row.hargaJual,
            stock: row.stock,
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            sku: row.sku,
            name: row.name,
            category: row.category,
            hpp: row.hpp,
            hargaJual: row.hargaJual,
            stock: row.stock,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      count: created + updated,
      created,
      updated,
      warnings,
    });
  } catch (err) {
    console.error("Upload products error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload gagal" },
      { status: 500 }
    );
  }
}
