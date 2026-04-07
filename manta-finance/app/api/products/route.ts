import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

// GET all products with live stock (stock - totalSold)
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await validateSession(token);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Get total qty sold per SKU from all SaleItems
  const soldAgg = await prisma.saleItem.groupBy({
    by: ["sku"],
    _sum: { qty: true },
  });
  const soldMap = new Map(soldAgg.map((s) => [s.sku, s._sum.qty ?? 0]));

  const rows = products.map((p) => {
    const totalSold = soldMap.get(p.sku) ?? 0;
    const liveStock = p.stock - totalSold;
    const marginUnit = p.hargaJual - p.hpp;
    const marginPersen = p.hargaJual > 0 ? ((p.hargaJual - p.hpp) / p.hargaJual) * 100 : 0;
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      hpp: p.hpp,
      hargaJual: p.hargaJual,
      baseStock: p.stock,
      totalSold,
      liveStock,
      marginUnit,
      marginPersen,
    };
  });

  return NextResponse.json({ products: rows });
}

// POST create a single product
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const valid = await validateSession(token);
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { sku, name, category, hpp, hargaJual, stock } = body as {
      sku: string; name: string; category: string; hpp: number; hargaJual: number; stock: number;
    };

    if (!sku || !name) {
      return NextResponse.json({ error: "sku dan name wajib diisi" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        category: (category ?? "").trim(),
        hpp: hpp ?? 0,
        hargaJual: hargaJual ?? 0,
        stock: stock ?? 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === "P2002") {
      return NextResponse.json({ error: "SKU sudah ada" }, { status: 409 });
    }
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
