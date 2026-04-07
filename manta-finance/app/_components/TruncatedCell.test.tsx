// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TruncatedCell } from './TruncatedCell'

describe('TruncatedCell — MISC-01: truncated product name tooltip', () => {
  it('renders truncated text with max-w truncate classes', () => {
    const { container } = render(
      <TruncatedCell
        text="A Very Long Product Name That Exceeds Column Width"
        maxWidth="max-w-[200px]"
      />
    )
    // The container element should have a className containing 'truncate'
    const el = container.firstChild as HTMLElement
    expect(el.className).toMatch(/truncate/)
  })

  it('native title attribute contains full text', () => {
    const { container } = render(
      <TruncatedCell text="Full Product Name" maxWidth="max-w-[200px]" />
    )
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('title')).toBe('Full Product Name')
  })

  it('renders the text content visually', () => {
    render(<TruncatedCell text="Short Name" maxWidth="max-w-[200px]" />)
    expect(screen.getByText('Short Name')).toBeInTheDocument()
  })
})
