/**
 * @vitest-environment jsdom
 * Tests for Breadcrumbs component — SIDE-02
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import { usePathname } from 'next/navigation'
import Breadcrumbs from '@/app/_components/Breadcrumbs'

const mockUsePathname = vi.mocked(usePathname)

describe('Breadcrumbs — SIDE-02', () => {
  it('renders Home link for /dashboard', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Breadcrumbs />)
    // Home icon link should navigate to /dashboard
    const homeLink = screen.getByRole('link', { name: '' })
    expect(homeLink).toHaveAttribute('href', '/dashboard')
  })

  it('renders correct label for /stock', () => {
    mockUsePathname.mockReturnValue('/stock')
    render(<Breadcrumbs />)
    expect(screen.getByText('Stock')).toBeInTheDocument()
  })

  it('renders correct label for /receivables', () => {
    mockUsePathname.mockReturnValue('/receivables')
    render(<Breadcrumbs />)
    expect(screen.getByText('Piutang')).toBeInTheDocument()
  })

  it('renders correct label for /import', () => {
    mockUsePathname.mockReturnValue('/import')
    render(<Breadcrumbs />)
    expect(screen.getByText('Import Data')).toBeInTheDocument()
  })

  it('renders last segment as non-link span (current page)', () => {
    mockUsePathname.mockReturnValue('/finance')
    render(<Breadcrumbs />)
    const financeEl = screen.getByText('Finance')
    // Current page is rendered as a span, not an anchor
    expect(financeEl.tagName).toBe('SPAN')
  })
})
