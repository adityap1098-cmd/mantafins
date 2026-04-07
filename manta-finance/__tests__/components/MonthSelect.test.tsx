// @vitest-environment jsdom
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MonthSelect from '@/app/_components/MonthSelect'

describe('MonthSelect', () => {
  it('renders a select element with 12 options plus placeholder (13 total)', () => {
    render(<MonthSelect value="" onChange={vi.fn()} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(13)
  })

  it('renders a placeholder option with empty value', () => {
    render(<MonthSelect value="" onChange={vi.fn()} />)
    const placeholder = screen.getByRole('option', { name: /pilih bulan/i })
    expect(placeholder).toBeDefined()
    expect((placeholder as HTMLOptionElement).value).toBe('')
  })

  it('calls onChange with string "3" when user selects March', () => {
    const handleChange = vi.fn()
    render(<MonthSelect value="" onChange={handleChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '3' } })
    expect(handleChange).toHaveBeenCalledWith('3')
  })

  it('selected option matches the value prop', () => {
    render(<MonthSelect value="5" onChange={vi.fn()} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('5')
  })
})
