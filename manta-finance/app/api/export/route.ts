import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'
import { buildWorkbook, ExportConfig } from '@/lib/export/buildWorkbook'
import { computeTransactionMetrics } from '@/lib/calculator/margin'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export async function POST(req: NextRequest): Promise<Response> {
  // Auth guard
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const valid = await validateSession(token)
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Parse body
  let config: ExportConfig
  try {
    config = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  // Validate required fields
  if (!config.periodId) {
    return new Response(JSON.stringify({ error: 'periodId is required' }), { status: 400 })
  }

  const { periodId } = config

  try {
    // Fetch all data sources in parallel
    const [sales, opCosts, snapshots] = await Promise.all([
      prisma.sale.findMany({
        where: { periodId },
        include: { items: true },
        orderBy: { date: 'desc' },
      }),
      prisma.operationalCost.findMany({
        where: { periodId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.productSnapshot.findMany({
        where: { periodId },
      }),
    ])

    // --- Build saleRows (for transaksi + detailItem sheets) ---
    const saleRows = sales.map((sale) => {
      const metrics = computeTransactionMetrics({
        grandTotal: sale.grandTotal,
        items: sale.items.map((item) => ({
          hppUnit: item.hppUnit,
          hargaUnit: item.hargaUnit,
          qty: item.qty,
        })),
      })

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
        items: sale.items.map((item) => ({
          sku: item.sku,
          productName: item.productName,
          qty: item.qty,
          hppUnit: item.hppUnit,
          hargaUnit: item.hargaUnit,
          totalHpp: item.totalHpp,
          totalHarga: item.totalHarga,
        })),
      }
    })

    // --- Build P&L summary ---
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

    // FinanceSummary shape used by laporanKeuangan sheet builder:
    // { totalPendapatan, totalHpp, labaKotor, totalDiskon, totalPiutang, totalTerbayar, netProfit }
    const summary = {
      totalPendapatan: round2(totalPendapatan),
      totalHpp: round2(totalHpp),
      labaKotor: round2(labaKotor),
      totalDiskon: round2(totalDiskon),
      totalPiutang: round2(totalPiutang),
      totalTerbayar: round2(totalTerbayar),
      netProfit: round2(labaBersih),
    }

    // Suppress unused variable warning — marginKotor/marginBersih not needed for export sheet
    void marginKotor
    void marginBersih

    // --- Build customerRows (piutang sheet) ---
    // CustomerRow shape: { customer, totalTransactions, totalGrandTotal, totalTerbayar, totalPiutang, avgDiskonPersen }
    // sale.paid = amount already paid (terbayar), sale.balance = outstanding (piutang)
    const piutangMap = new Map<
      string,
      { totalTransactions: number; totalGrandTotal: number; totalTerbayar: number; totalPiutang: number; sumDiskon: number; sumGross: number }
    >()
    for (const sale of sales) {
      const grossRevenue = sale.items.reduce((s, item) => s + item.hargaUnit * item.qty, 0)
      const saleDiskon = grossRevenue - sale.grandTotal
      const existing = piutangMap.get(sale.customer)
      if (existing) {
        existing.totalTransactions += 1
        existing.totalGrandTotal += sale.grandTotal
        existing.totalTerbayar += sale.paid
        existing.totalPiutang += sale.balance
        existing.sumDiskon += saleDiskon
        existing.sumGross += grossRevenue
      } else {
        piutangMap.set(sale.customer, {
          totalTransactions: 1,
          totalGrandTotal: sale.grandTotal,
          totalTerbayar: sale.paid,
          totalPiutang: sale.balance,
          sumDiskon: saleDiskon,
          sumGross: grossRevenue,
        })
      }
    }
    const customerRows = Array.from(piutangMap.entries()).map(([customer, d]) => ({
      customer,
      totalTransactions: d.totalTransactions,
      totalGrandTotal: round2(d.totalGrandTotal),
      totalTerbayar: round2(d.totalTerbayar),
      totalPiutang: round2(d.totalPiutang),
      avgDiskonPersen: round2(d.sumGross > 0 ? (d.sumDiskon / d.sumGross) * 100 : 0),
    }))

    // Category code → readable name translation
    const CATEGORY_MAP: Record<string, string> = {
      '001': 'Klep',
      '002': 'Blok Cylinder',
      '003': 'TPS',
      '004': 'Retainer',
      '005': 'Shim',
      '006': 'Rocker Arm',
      '007': 'Tensioner',
      '008': 'Timing Gear',
    }
    const translateCategory = (code: string): string => CATEGORY_MAP[code] ?? code

    // --- Build stockItems (stock sheet) ---
    // StockItem shape: { sku, name, category, hpp, hargaJual, stock, marginUnit, marginPersen }
    // marginPersen stored as decimal (0.72) for ExcelJS '0.0%' format
    const stockItems = snapshots.map((s) => {
      const marginUnit = s.hargaJual - s.hpp
      const marginPersen = s.hargaJual > 0 ? (s.hargaJual - s.hpp) / s.hargaJual : 0
      return {
        sku: s.sku,
        name: s.name,
        category: translateCategory(s.category),
        hpp: s.hpp,
        hargaJual: s.hargaJual,
        stock: s.stock,
        marginUnit: round2(marginUnit),
        marginPersen: round2(marginPersen),
      }
    })

    // --- Build productMarginRows (marginProduk sheet) ---
    // ProductMarginRow shape: { sku, name, category, hppUnit, hargaJual, avgTransactionPrice, marginPersen, totalQtySold }
    // Build a product catalog from snapshots for category/hargaJual/name lookup
    const snapshotBySku = new Map(snapshots.map((s) => [s.sku, s]))

    const prodMap = new Map<
      string,
      { productName: string; sku: string; hppUnit: number; totalQty: number; sumTotalHarga: number; sumTotalHpp: number }
    >()
    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = prodMap.get(item.sku)
        if (existing) {
          existing.totalQty += item.qty
          existing.sumTotalHarga += item.totalHarga
          existing.sumTotalHpp += item.totalHpp
        } else {
          prodMap.set(item.sku, {
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
    const productMarginRows = Array.from(prodMap.values()).map((p) => {
      const snap = snapshotBySku.get(p.sku)
      const avgTransactionPrice = p.totalQty > 0 ? p.sumTotalHarga / p.totalQty : 0
      // marginPersen as decimal (0.72) for ExcelJS '0.0%' format
      const marginPersen = p.sumTotalHarga > 0
        ? (p.sumTotalHarga - p.sumTotalHpp) / p.sumTotalHarga
        : 0
      return {
        sku: p.sku,
        name: p.productName,
        category: translateCategory(snap?.category ?? 'Unknown'),
        hppUnit: round2(p.hppUnit),
        hargaJual: round2(snap?.hargaJual ?? 0),
        avgTransactionPrice: round2(avgTransactionPrice),
        marginPersen: round2(marginPersen),
        totalQtySold: p.totalQty,
      }
    })

    // --- Build customerDiscountRows (marginKonsumen sheet) ---
    // CustomerDiscountRow shape: { customer, totalTransactions, totalGrandTotal, avgDiskonPersen }
    const customerDiscountRows = Array.from(piutangMap.entries()).map(([customer, d]) => ({
      customer,
      totalTransactions: d.totalTransactions,
      totalGrandTotal: round2(d.totalGrandTotal),
      avgDiskonPersen: round2(d.sumGross > 0 ? (d.sumDiskon / d.sumGross) * 100 : 0),
    }))

    // Assemble ExportData and build workbook
    const data = {
      summary,
      saleRows,
      customerRows,
      stockItems,
      productMarginRows,
      customerDiscountRows,
    }

    const workbook = await buildWorkbook(config, data)
    const buffer = await workbook.xlsx.writeBuffer()

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Manta-Racing-Export-${config.periodLabel}.xlsx"`,
      },
    })
  } catch (err) {
    console.error('[/api/export] Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
