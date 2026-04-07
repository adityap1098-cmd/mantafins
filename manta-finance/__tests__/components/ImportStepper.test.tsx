// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ImportStepper from '@/app/_components/ImportStepper'

const STEPS = [
  { label: 'Buat Periode' },
  { label: 'Upload Produk' },
  { label: 'Upload Penjualan' },
]

describe('ImportStepper', () => {
  it('renders the correct number of step labels from the steps prop', () => {
    render(<ImportStepper steps={STEPS} currentStep={1} />)
    expect(screen.getByText('Buat Periode')).toBeTruthy()
    expect(screen.getByText('Upload Produk')).toBeTruthy()
    expect(screen.getByText('Upload Penjualan')).toBeTruthy()
  })

  it('the current step circle has blue background styling (bg-blue-600)', () => {
    render(<ImportStepper steps={STEPS} currentStep={1} />)
    const circles = document.querySelectorAll('[class*="bg-blue-600"]')
    expect(circles.length).toBeGreaterThan(0)
  })

  it('completed steps show green background (bg-green-500)', () => {
    render(<ImportStepper steps={STEPS} currentStep={3} />)
    const greenCircles = document.querySelectorAll('[class*="bg-green-500"]')
    expect(greenCircles.length).toBeGreaterThanOrEqual(2)
  })

  it('future steps show gray background (bg-gray-200)', () => {
    render(<ImportStepper steps={STEPS} currentStep={1} />)
    const grayCircles = document.querySelectorAll('[class*="bg-gray-200"]')
    expect(grayCircles.length).toBeGreaterThan(0)
  })
})
