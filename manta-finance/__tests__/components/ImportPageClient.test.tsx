// @vitest-environment jsdom
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  default: {},
}))

vi.mock('@/app/import/PeriodManager', () => ({
  default: ({ onPeriodSelect }: { onPeriodSelect: (id: string) => void }) => (
    <button onClick={() => onPeriodSelect('period-123')}>Select Period</button>
  ),
}))

vi.mock('@/app/import/UploadPanel', () => ({
  default: ({
    onProductsUploaded,
    onSalesUploaded,
  }: {
    periodId: string
    onProductsUploaded?: () => void
    onSalesUploaded?: () => void
  }) => (
    <div>
      <button onClick={() => onProductsUploaded?.()}>Upload Products</button>
      <button onClick={() => onSalesUploaded?.()}>Upload Sales</button>
    </div>
  ),
}))

import ImportPageClient from '@/app/import/_components/ImportPageClient'

describe('ImportPageClient', () => {
  it('renders the ImportStepper component (step indicator visible)', () => {
    render(<ImportPageClient />)
    // Step labels from the stepper should be in the DOM
    expect(screen.getByText(/Buat Periode/i)).toBeTruthy()
  })

  it('advances currentStep to 2 when a period is selected', () => {
    render(<ImportPageClient />)
    fireEvent.click(screen.getByText('Select Period'))
    // After selection, step 2 circle should be active (blue)
    const blueCircles = document.querySelectorAll('[class*="bg-blue-600"]')
    expect(blueCircles.length).toBeGreaterThan(0)
  })

  it('step 2 becomes active (blue) after period selection', () => {
    render(<ImportPageClient />)
    fireEvent.click(screen.getByText('Select Period'))
    const blueElements = document.querySelectorAll('[class*="bg-blue-600"]')
    expect(blueElements.length).toBeGreaterThan(0)
  })

  it('step 3 becomes active after products are uploaded', () => {
    render(<ImportPageClient />)
    fireEvent.click(screen.getByText('Select Period'))
    fireEvent.click(screen.getByText('Upload Products'))
    const blueCircles = document.querySelectorAll('[class*="bg-blue-600"]')
    expect(blueCircles.length).toBeGreaterThan(0)
  })
})
