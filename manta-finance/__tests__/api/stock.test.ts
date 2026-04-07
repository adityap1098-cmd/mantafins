import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma and auth before importing route
vi.mock('@/lib/prisma', () => ({
  prisma: {
    productSnapshot: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  SESSION_COOKIE_NAME: 'manta_session',
  validateSession: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/auth'
import { GET } from '@/app/api/stock/route'

const mockSnapshots = [
  { id: 'snap1', periodId: 'period1', sku: 'SKU-001', name: 'Product A', category: 'Cat1', hpp: 10000, hargaJual: 15000, stock: 5 },
  { id: 'snap2', periodId: 'period1', sku: 'SKU-002', name: 'Product B', category: 'Cat2', hpp: 20000, hargaJual: 25000, stock: 3 },
]

function makeRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(url)
  Object.entries(cookies).forEach(([name, value]) => {
    req.cookies.set(name, value)
  })
  return req
}

describe('GET /api/stock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session cookie is missing', async () => {
    const req = makeRequest('http://localhost/api/stock?periodId=period1')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when session is invalid', async () => {
    vi.mocked(validateSession).mockResolvedValue(false)
    const req = makeRequest('http://localhost/api/stock?periodId=period1', { manta_session: 'bad-token' })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when periodId is missing', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    const req = makeRequest('http://localhost/api/stock', { manta_session: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns rows with computed margins and inventorySummary', async () => {
    vi.mocked(validateSession).mockResolvedValue(true)
    vi.mocked(prisma.productSnapshot.findMany).mockResolvedValue(mockSnapshots as any)
    const req = makeRequest('http://localhost/api/stock?periodId=period1', { manta_session: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()

    // rows
    expect(body.rows).toHaveLength(2)
    const rowA = body.rows.find((r: any) => r.sku === 'SKU-001')
    expect(rowA.marginUnit).toBe(5000)        // 15000 - 10000
    expect(rowA.marginPersen).toBeCloseTo(33.33, 1) // (5000/15000)*100

    // inventorySummary
    expect(body.inventorySummary.totalHppValue).toBe(10000 * 5 + 20000 * 3)   // 110000
    expect(body.inventorySummary.totalHargaJualValue).toBe(15000 * 5 + 25000 * 3) // 150000
    expect(body.inventorySummary.potentialProfit).toBe(150000 - 110000)         // 40000
  })
})
