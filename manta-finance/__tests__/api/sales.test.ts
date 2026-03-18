import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma and auth before importing route
vi.mock('@/lib/prisma', () => ({
  prisma: {
    sale: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  SESSION_COOKIE_NAME: 'manta_session',
  validateSession: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/auth'
import { GET } from '@/app/api/sales/route'

const mockSales = [
  {
    id: 'sale1',
    periodId: 'period1',
    date: new Date('2026-01-15T10:00:00Z'),
    refNo: 'INV-001',
    supplier: '',
    customer: 'Customer A',
    grandTotal: 100000,
    paid: 100000,
    balance: 0,
    status: 'Terbayar',
    items: [
      {
        id: 'item1',
        saleId: 'sale1',
        sku: 'SKU-001',
        productName: 'Product A',
        qty: 2,
        hppUnit: 10000,
        hargaUnit: 15000,
        totalHpp: 20000,
        totalHarga: 30000,
      },
      {
        id: 'item2',
        saleId: 'sale1',
        sku: 'SKU-002',
        productName: 'Product B',
        qty: 1,
        hppUnit: 50000,
        hargaUnit: 70000,
        totalHpp: 50000,
        totalHarga: 70000,
      },
    ],
  },
  {
    id: 'sale2',
    periodId: 'period1',
    date: new Date('2026-01-16T11:00:00Z'),
    refNo: 'INV-002',
    supplier: '',
    customer: 'Customer B',
    grandTotal: 50000,
    paid: 25000,
    balance: 25000,
    status: 'Piutang',
    items: [
      {
        id: 'item3',
        saleId: 'sale2',
        sku: 'SKU-001',
        productName: 'Product A',
        qty: 3,
        hppUnit: 10000,
        hargaUnit: 18000,
        totalHpp: 30000,
        totalHarga: 54000,
      },
    ],
  },
]

function makeRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(url)
  Object.entries(cookies).forEach(([name, value]) => {
    req.cookies.set(name, value)
  })
  return req
}

describe('GET /api/sales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session cookie is missing', async () => {
    const req = makeRequest('http://localhost/api/sales?periodId=period1')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when session is invalid', async () => {
    vi.mocked(validateSession).mockResolvedValue(false)
    const req = makeRequest('http://localhost/api/sales?periodId=period1', { manta_session: 'bad-token' })
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when periodId is missing', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    const req = makeRequest('http://localhost/api/sales', { manta_session: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns rows array with SaleRow shape', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales as any)
    const req = makeRequest('http://localhost/api/sales?periodId=period1', { manta_session: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rows).toHaveLength(2)
  })

  it('each row includes display fields', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales as any)
    const req = makeRequest('http://localhost/api/sales?periodId=period1', { manta_session: 'valid-token' })
    const res = await GET(req)
    const body = await res.json()
    const row = body.rows.find((r: any) => r.id === 'sale1')
    expect(row.id).toBe('sale1')
    expect(row.date).toBe('2026-01-15T10:00:00.000Z')
    expect(row.refNo).toBe('INV-001')
    expect(row.customer).toBe('Customer A')
    expect(row.status).toBe('Terbayar')
    expect(row.grandTotal).toBe(100000)
    expect(row.paid).toBe(100000)
    expect(row.balance).toBe(0)
    expect(row.itemCount).toBe(2)
  })

  it('each row includes computed metrics via computeTransactionMetrics', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales as any)
    const req = makeRequest('http://localhost/api/sales?periodId=period1', { manta_session: 'valid-token' })
    const res = await GET(req)
    const body = await res.json()

    // sale1: items = [{hppUnit:10000, hargaUnit:15000, qty:2}, {hppUnit:50000, hargaUnit:70000, qty:1}]
    // hppTotal = 10000*2 + 50000*1 = 70000
    // grossRevenue = 15000*2 + 70000*1 = 100000
    // diskon = 100000 - 100000 = 0
    // labaKotor = 100000 - 70000 = 30000
    // marginPersen = 30000/100000 * 100 = 30
    const row1 = body.rows.find((r: any) => r.id === 'sale1')
    expect(row1.totalHpp).toBe(70000)
    expect(row1.diskon).toBe(0)
    expect(row1.labaKotor).toBe(30000)
    expect(row1.marginPersen).toBeCloseTo(30, 1)
  })

  it('each row includes nested items with SaleItemDetail shape', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales as any)
    const req = makeRequest('http://localhost/api/sales?periodId=period1', { manta_session: 'valid-token' })
    const res = await GET(req)
    const body = await res.json()
    const row = body.rows.find((r: any) => r.id === 'sale1')
    expect(row.items).toHaveLength(2)
    const item = row.items.find((i: any) => i.sku === 'SKU-001')
    expect(item.productName).toBe('Product A')
    expect(item.qty).toBe(2)
    expect(item.hppUnit).toBe(10000)
    expect(item.hargaUnit).toBe(15000)
    expect(item.totalHpp).toBe(20000)
    expect(item.totalHarga).toBe(30000)
  })

  it('calls prisma.sale.findMany with periodId and includes items ordered by date desc', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales as any)
    const req = makeRequest('http://localhost/api/sales?periodId=period1', { manta_session: 'valid-token' })
    await GET(req)
    expect(prisma.sale.findMany).toHaveBeenCalledWith({
      where: { periodId: 'period1' },
      include: { items: true },
      orderBy: { date: 'desc' },
    })
  })
})
