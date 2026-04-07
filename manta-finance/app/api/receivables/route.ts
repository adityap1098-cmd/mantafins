import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'
import { computeTransactionMetrics } from '@/lib/calculator/margin'

type SaleWithItems = Awaited<ReturnType<typeof prisma.sale.findMany<{ include: { items: true } }>>>[number]

export interface SaleReceivableRow {
  id: string
  refNo: string
  date: string // ISO string
  grandTotal: number
  paid: number
  balance: number
  status: string
}

export interface CustomerReceivable {
  customer: string
  totalTransaksi: number
  totalTagihan: number
  totalTerbayar: number
  totalPiutang: number
  avgDiskonPersen: number
  sales: SaleReceivableRow[]
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

  // Group by customer
  const customerMap = new Map<string, SaleWithItems[]>()
  for (const sale of sales) {
    const existing = customerMap.get(sale.customer) ?? []
    customerMap.set(sale.customer, [...existing, sale])
  }

  const receivables: CustomerReceivable[] = []

  for (const entry of Array.from(customerMap.entries())) {
    const customer = entry[0]
    const customerSales = entry[1]

    let totalTagihan = 0
    let totalTerbayar = 0
    let totalPiutang = 0
    let sumDiscounts = 0
    let sumGrossRevenue = 0

    const saleRows: SaleReceivableRow[] = customerSales.map((sale: SaleWithItems) => {
      const metrics = computeTransactionMetrics({
        grandTotal: sale.grandTotal,
        items: sale.items.map((item) => ({
          hppUnit: item.hppUnit,
          hargaUnit: item.hargaUnit,
          qty: item.qty,
        })),
      })

      const grossRevenue = sale.items.reduce(
        (sum: number, item) => sum + item.hargaUnit * item.qty,
        0
      )

      totalTagihan += sale.grandTotal
      totalTerbayar += sale.paid
      totalPiutang += sale.balance
      sumDiscounts += metrics.diskon
      sumGrossRevenue += grossRevenue

      return {
        id: sale.id,
        refNo: sale.refNo,
        date: sale.date.toISOString(),
        grandTotal: sale.grandTotal,
        paid: sale.paid,
        balance: sale.balance,
        status: sale.status,
      }
    })

    const avgDiskonPersen =
      sumGrossRevenue > 0 ? (sumDiscounts / sumGrossRevenue) * 100 : 0

    receivables.push({
      customer,
      totalTransaksi: customerSales.length,
      totalTagihan,
      totalTerbayar,
      totalPiutang,
      avgDiskonPersen: Math.round(avgDiskonPersen * 100) / 100,
      sales: saleRows,
    })
  }

  // Sort by totalPiutang descending
  receivables.sort((a, b) => b.totalPiutang - a.totalPiutang)

  return NextResponse.json({ receivables })
}
