import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export interface StockRow {
  id: string
  periodId: string
  sku: string
  name: string
  category: string
  hpp: number
  hargaJual: number
  stock: number
  marginUnit: number
  marginPersen: number
}

export interface InventorySummary {
  totalHppValue: number
  totalHargaJualValue: number
  potentialProfit: number
}

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

function computeInventorySummary(rows: StockRow[]): InventorySummary {
  const totalHppValue = rows.reduce((sum, r) => sum + r.hpp * r.stock, 0)
  const totalHargaJualValue = rows.reduce(
    (sum, r) => sum + r.hargaJual * r.stock,
    0
  )
  const potentialProfit = totalHargaJualValue - totalHppValue

  return { totalHppValue, totalHargaJualValue, potentialProfit }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
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

  const snapshots = await prisma.productSnapshot.findMany({
    where: { periodId },
  })

  const rows = snapshots.map(toStockRow)
  const inventorySummary = computeInventorySummary(rows)

  return NextResponse.json({ rows, inventorySummary })
}
