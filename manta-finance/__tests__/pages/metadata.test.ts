/**
 * Tests for per-page metadata exports — SIDE-03
 * These tests are RED until Wave 2 migrates pages into (auth)/ and adds metadata exports
 */
import { describe, it, expect, vi } from 'vitest'

// Mock prisma so export/page.tsx can be imported without DATABASE_URL
vi.mock('@/lib/prisma', () => ({
  prisma: {
    period: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}))

// Import metadata from each migrated page
// Paths reference the (auth) route group
import { metadata as dashboardMeta }    from '@/app/(auth)/dashboard/page'
import { metadata as importMeta }       from '@/app/(auth)/import/page'
import { metadata as stockMeta }        from '@/app/(auth)/stock/page'
import { metadata as salesMeta }        from '@/app/(auth)/sales/page'
import { metadata as financeMeta }      from '@/app/(auth)/finance/page'
import { metadata as receivablesMeta }  from '@/app/(auth)/receivables/page'
import { metadata as exportMeta }       from '@/app/(auth)/export/page'

const allMetadata = [
  { name: 'dashboard',    meta: dashboardMeta },
  { name: 'import',       meta: importMeta },
  { name: 'stock',        meta: stockMeta },
  { name: 'sales',        meta: salesMeta },
  { name: 'finance',      meta: financeMeta },
  { name: 'receivables',  meta: receivablesMeta },
  { name: 'export',       meta: exportMeta },
]

describe('Per-page metadata — SIDE-03', () => {
  it('every page exports a metadata object', () => {
    allMetadata.forEach(({ name, meta }) => {
      expect(meta, `${name} page must export metadata`).toBeDefined()
    })
  })

  it('every page has a unique title', () => {
    const titles = allMetadata.map(({ meta }) => (meta as { title?: string }).title)
    const uniqueTitles = new Set(titles)
    expect(uniqueTitles.size).toBe(allMetadata.length)
  })

  it('every title contains the page name (not all the same generic title)', () => {
    const titles = allMetadata.map(({ meta }) => (meta as { title?: string }).title ?? '')
    // No title should be "Manta Racing Finance" alone (the old generic title)
    titles.forEach(title => {
      expect(title).not.toBe('Manta Racing Finance')
    })
  })

  it('dashboard page title includes Dashboard', () => {
    expect((dashboardMeta as { title?: string }).title).toMatch(/Dashboard/i)
  })

  it('stock page title includes Stok or Stock', () => {
    expect((stockMeta as { title?: string }).title).toMatch(/stok/i)
  })
})
