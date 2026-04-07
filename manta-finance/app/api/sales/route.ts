import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'
import { computeTransactionMetrics } from '@/lib/calculator/margin'

export interface SaleItemDetail {
  sku: string
  productName: string
  qty: number
  hppUnit: number
  hargaUnit: number
  totalHpp: number
  totalHarga: number
}

export interface SaleRow {
  id: string
  date: string // ISO string
  refNo: string
  customer: string
  status: string
  grandTotal: number
  paid: number
  balance: number
  itemCount: number
  totalHpp: number
  labaKotor: number
  diskon: number
  marginPersen: number
  items: SaleItemDetail[]
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

  const sales = await prisma.sale.findMany({
    where: { periodId },
    include: { items: true },
    orderBy: { date: 'desc' },
  })

  const rows: SaleRow[] = sales.map((sale) => {
    const metrics = computeTransactionMetrics({
      grandTotal: sale.grandTotal,
      items: sale.items.map((item) => ({
        hppUnit: item.hppUnit,
        hargaUnit: item.hargaUnit,
        qty: item.qty,
      })),
    })

    const saleItems: SaleItemDetail[] = sale.items.map((item) => ({
      sku: item.sku,
      productName: item.productName,
      qty: item.qty,
      hppUnit: item.hppUnit,
      hargaUnit: item.hargaUnit,
      totalHpp: item.totalHpp,
      totalHarga: item.totalHarga,
    }))

    return {
      id: sale.id,
      date: sale.date.toISOString(),
      refNo: sale.refNo,
      customer: sale.customer,
      status: sale.status,
      grandTotal: sale.grandTotal,
      paid: sale.paid,
      balance: sale.balance,
      itemCount: sale.items.length,
      totalHpp: metrics.hppTotal,
      labaKotor: metrics.labaKotor,
      diskon: metrics.diskon,
      marginPersen: metrics.marginPersen,
      items: saleItems,
    }
  })

  return NextResponse.json({ rows })
}
