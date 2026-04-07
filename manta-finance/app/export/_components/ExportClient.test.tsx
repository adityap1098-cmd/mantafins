// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import ExportClient from './ExportClient'

const DEFAULT_PERIODS = [{ id: 'p1', name: 'Jan 2026' }]

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
      blob: async () => new Blob(),
    })
  )
})

describe('ExportClient — EXPRT-01: loading spinner', () => {
  it('shows spinner element during export', async () => {
    // Make fetch hang so loading state persists
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/export/preview')) {
          return Promise.resolve({ ok: true, json: async () => ({}) })
        }
        // POST /api/export — never resolves (loading stays true)
        return new Promise(() => {})
      })
    )

    render(<ExportClient periods={DEFAULT_PERIODS} />)

    const exportButton = screen.getByRole('button', { name: /export excel/i })
    act(() => {
      fireEvent.click(exportButton)
    })

    // Spinner element should be in the document while loading
    expect(document.querySelector('[data-testid="export-spinner"]')).toBeTruthy()
  })

  it('button is disabled while loading', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/export/preview')) {
          return Promise.resolve({ ok: true, json: async () => ({}) })
        }
        return new Promise(() => {})
      })
    )

    render(<ExportClient periods={DEFAULT_PERIODS} />)

    const exportButton = screen.getByRole('button', { name: /export excel/i })
    act(() => {
      fireEvent.click(exportButton)
    })

    // Button with "Export Excel" text should be disabled while fetch is pending
    // Note: currently the button text changes to "Generating..." — so we look for disabled state
    const btn = screen.getByRole('button', { name: /export excel/i })
    expect(btn).toBeDisabled()
  })
})

describe('ExportClient — EXPRT-02: file size estimate', () => {
  it('shows estimated file size in preview panel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/export/preview')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              laporanKeuangan: 1,
              transaksi: 100,
              detailItem: 300,
              piutang: 5,
              stock: 50,
              marginProduk: 50,
              marginKonsumen: 5,
            }),
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })
    )

    render(<ExportClient periods={DEFAULT_PERIODS} />)

    // Wait for size estimate element to appear after preview fetch resolves
    await waitFor(() => {
      const el = document.querySelector('[data-testid="export-size-estimate"]')
      expect(el).toBeTruthy()
    })

    const el = document.querySelector('[data-testid="export-size-estimate"]')!
    expect(el.textContent).toMatch(/KB|MB/i)
  })
})
