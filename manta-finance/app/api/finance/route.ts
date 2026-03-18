import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export interface FinanceSummary {
  totalPendapatan: number
  totalHpp: number
  labaKotor: number
  totalDiskon: number
  totalBiayaOperasional: number
  labaBersih: number
  marginKotor: number
  marginBersih: number
  totalPiutang: number
  totalTerbayar: number
  operationalCosts: { id: string; description: string; amount: number }[]
}

export interface ProductMarginRow {
  productName: string
  sku: string
  totalQty: number
  hppUnit: number
  avgHargaAktual: number
  totalLabaKotor: number
  marginPersen: number
}

export interface CustomerDiscountRow {
  customer: string
  totalTransaksi: number
  totalPenjualan: number
  totalDiskon: number
  avgDiskonPersen: number
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

  const [sales, opCosts] = await Promise.all([
    prisma.sale.findMany({
      where: { periodId },
      include: { items: true },
    }),
    prisma.operationalCost.findMany({
      where: { periodId },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // --- P&L Summary ---
  let totalPendapatan = 0
  let totalHpp = 0
  let totalDiskon = 0
  let totalPiutang = 0
  let totalTerbayar = 0

  for (const sale of sales) {
    totalPendapatan += sale.grandTotal
    totalTerbayar += sale.paid
    if (sale.status !== 'Terbayar') {
      totalPiutang += sale.balance
    }
    for (const item of sale.items) {
      totalHpp += item.hppUnit * item.qty
      totalDiskon += item.hargaUnit * item.qty
    }
    totalDiskon -= sale.grandTotal
  }

  const labaKotor = totalPendapatan - totalHpp
  const totalBiayaOperasional = opCosts.reduce((sum, c) => sum + c.amount, 0)
  const labaBersih = labaKotor - totalBiayaOperasional
  const marginKotor = totalPendapatan > 0 ? (labaKotor / totalPendapatan) * 100 : 0
  const marginBersih = totalPendapatan > 0 ? (labaBersih / totalPendapatan) * 100 : 0

  const summary: FinanceSummary = {
    totalPendapatan: round2(totalPendapatan),
    totalHpp: round2(totalHpp),
    labaKotor: round2(labaKotor),
    totalDiskon: round2(totalDiskon),
    totalBiayaOperasional: round2(totalBiayaOperasional),
    labaBersih: round2(labaBersih),
    marginKotor: round2(marginKotor),
    marginBersih: round2(marginBersih),
    totalPiutang: round2(totalPiutang),
    totalTerbayar: round2(totalTerbayar),
    operationalCosts: opCosts.map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
    })),
  }

  // --- Product Margin Table ---
  const productMap = new Map<
    string,
    {
      productName: string
      sku: string
      hppUnit: number
      totalQty: number
      sumTotalHarga: number
      sumTotalHpp: number
    }
  >()

  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.productName
      const existing = productMap.get(key)
      if (existing) {
        existing.totalQty += item.qty
        existing.sumTotalHarga += item.totalHarga
        existing.sumTotalHpp += item.totalHpp
      } else {
        productMap.set(key, {
          productName: item.productName,
          sku: item.sku,
          hppUnit: item.hppUnit,
          totalQty: item.qty,
          sumTotalHarga: item.totalHarga,
          sumTotalHpp: item.totalHpp,
        })
      }
    }
  }

  const productMargins: ProductMarginRow[] = Array.from(productMap.values()).map((p) => {
    const productLabaKotor = p.sumTotalHarga - p.sumTotalHpp
    const marginPersen = p.sumTotalHarga > 0 ? (productLabaKotor / p.sumTotalHarga) * 100 : 0
    const avgHargaAktual = p.totalQty > 0 ? p.sumTotalHarga / p.totalQty : 0
    return {
      productName: p.productName,
      sku: p.sku,
      totalQty: p.totalQty,
      hppUnit: round2(p.hppUnit),
      avgHargaAktual: round2(avgHargaAktual),
      totalLabaKotor: round2(productLabaKotor),
      marginPersen: round2(marginPersen),
    }
  })

  // --- Customer Discount Table ---
  const customerMap = new Map<
    string,
    {
      totalTransaksi: number
      totalPenjualan: number
      totalDiskon: number
    }
  >()

  for (const sale of sales) {
    const grossRevenue = sale.items.reduce((sum, item) => sum + item.hargaUnit * item.qty, 0)
    const saleDiskon = grossRevenue - sale.grandTotal
    const existing = customerMap.get(sale.customer)
    if (existing) {
      existing.totalTransaksi += 1
      existing.totalPenjualan += sale.grandTotal
      existing.totalDiskon += saleDiskon
    } else {
      customerMap.set(sale.customer, {
        totalTransaksi: 1,
        totalPenjualan: sale.grandTotal,
        totalDiskon: saleDiskon,
      })
    }
  }

  const customerDiscounts: CustomerDiscountRow[] = Array.from(customerMap.entries()).map(
    ([customer, data]) => {
      const base = data.totalPenjualan + data.totalDiskon
      const avgDiskonPersen = base > 0 ? (data.totalDiskon / base) * 100 : 0
      return {
        customer,
        totalTransaksi: data.totalTransaksi,
        totalPenjualan: round2(data.totalPenjualan),
        totalDiskon: round2(data.totalDiskon),
        avgDiskonPersen: round2(avgDiskonPersen),
      }
    }
  )

  return NextResponse.json({ summary, productMargins, customerDiscounts })
}
