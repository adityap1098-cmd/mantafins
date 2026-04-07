import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth guard
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
    return NextResponse.json({ error: 'periodId is required' }, { status: 400 })
  }

  try {
    const [transaksiCount, detailItemCount, piutangCustomers, stockCount] = await Promise.all([
      prisma.sale.count({ where: { periodId } }),
      prisma.saleItem.count({ where: { sale: { periodId } } }),
      prisma.sale.groupBy({ by: ['customer'], where: { periodId } }).then((r) => r.length),
      prisma.productSnapshot.count({ where: { periodId } }),
    ])

    return NextResponse.json({
      laporanKeuangan: 1,
      transaksi: transaksiCount,
      detailItem: detailItemCount,
      piutang: piutangCustomers,
      stock: stockCount,
      marginProduk: stockCount,
      marginKonsumen: piutangCustomers,
    })
  } catch (err) {
    console.error('[/api/export/preview] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error', detail: String(err) },
      { status: 500 }
    )
  }
}
