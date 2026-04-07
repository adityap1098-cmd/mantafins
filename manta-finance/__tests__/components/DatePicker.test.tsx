// @vitest-environment jsdom
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DatePicker from '@/app/_components/DatePicker'

describe('DatePicker', () => {
  it('renders an input element with type="date"', () => {
    render(<DatePicker value="" onChange={vi.fn()} />)
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toBeTruthy()
    expect(dateInput.type).toBe('date')
  })

  it('input value matches the value prop', () => {
    render(<DatePicker value="2026-01-15" onChange={vi.fn()} />)
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput.value).toBe('2026-01-15')
  })

  it('calls onChange with "2026-01-15" when user types that date', () => {
    const handleChange = vi.fn()
    render(<DatePicker value="" onChange={handleChange} />)
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2026-01-15' } })
    expect(handleChange).toHaveBeenCalledWith('2026-01-15')
  })

  it('applies caller-provided className alongside base classes', () => {
    render(<DatePicker value="" onChange={vi.fn()} className="w-full" />)
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput.className).toContain('w-full')
    expect(dateInput.className).toContain('border')
  })
})
