import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'
import { type StockRow } from '@/app/api/stock/route'

function toStockRow(snapshot: {
  id: string
  periodId: string
  sku: string
  name: string
  category: string
  hpp: number
  hargaJual: number
  stock: number
}): StockRow {
  const marginUnit = snapshot.hargaJual - snapshot.hpp
  const marginPersen =
    snapshot.hargaJual > 0
      ? ((snapshot.hargaJual - snapshot.hpp) / snapshot.hargaJual) * 100
      : 0

  return {
    ...snapshot,
    marginUnit,
    marginPersen,
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sku: string } }
): Promise<NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const valid = await validateSession(token)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const periodId = req.nextUrl.searchParams.get('periodId')
  if (!periodId) {
    return NextResponse.json({ error: 'periodId required' }, { status: 400 })
  }

  const { sku } = params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = body as Record<string, unknown>
  if (
    typeof parsed.stock !== 'number' ||
    !Number.isInteger(parsed.stock) ||
    parsed.stock < 0
  ) {
    return NextResponse.json(
      { error: 'stock must be a non-negative integer' },
      { status: 400 }
    )
  }

  try {
    const updated = await prisma.productSnapshot.update({
      where: { periodId_sku: { periodId, sku } },
      data: { stock: parsed.stock },
    })

    const row = toStockRow(updated)
    return NextResponse.json({ row })
  } catch (err: unknown) {
    const prismaError = err as { code?: string }
    if (prismaError?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    throw err
  }
}
