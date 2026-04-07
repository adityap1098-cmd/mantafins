/**
 * @vitest-environment jsdom
 * Tests for Sidebar component — SIDE-01
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation — usePathname and useRouter are client-only
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}))

// Mock next/link — avoids router context requirement in tests
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import { usePathname } from 'next/navigation'
import Sidebar from '@/app/_components/Sidebar'

const mockUsePathname = vi.mocked(usePathname)

describe('Sidebar — SIDE-01', () => {
  const NAV_LABELS = ['Dashboard', 'Import Data', 'Stock', 'Penjualan', 'Finance', 'Piutang', 'Export']
  const NAV_HREFS  = ['/dashboard', '/import', '/stock', '/sales', '/finance', '/receivables', '/export']

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('renders all 7 navigation links', () => {
    render(<Sidebar />)
    NAV_LABELS.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders links with correct hrefs', () => {
    render(<Sidebar />)
    // Pair each label with its expected href for verification
    const NAV_MAP = [
      { label: 'Dashboard',   href: '/dashboard' },
      { label: 'Import Data', href: '/import' },
      { label: 'Stock',       href: '/stock' },
      { label: 'Penjualan',   href: '/sales' },
      { label: 'Finance',     href: '/finance' },
      { label: 'Piutang',     href: '/receivables' },
      { label: 'Export',      href: '/export' },
    ]
    NAV_MAP.forEach(({ label, href }) => {
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') }))
        .toHaveAttribute('href', href)
    })
  })

  it('applies active class to current route link', () => {
    mockUsePathname.mockReturnValue('/stock')
    render(<Sidebar />)
    const stockLink = screen.getByRole('link', { name: /stock/i })
    // Active link must have bg-blue-50 and text-blue-700 classes
    expect(stockLink.className).toMatch(/bg-blue-50/)
    expect(stockLink.className).toMatch(/text-blue-700/)
  })

  it('does not apply active class to non-current route links', () => {
    mockUsePathname.mockReturnValue('/stock')
    render(<Sidebar />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink.className).not.toMatch(/bg-blue-50/)
  })

  it('renders brand name', () => {
    render(<Sidebar />)
    expect(screen.getByText('Manta Racing')).toBeInTheDocument()
  })
})
