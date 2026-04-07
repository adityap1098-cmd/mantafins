// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { CustomerReceivable } from '@/app/api/receivables/route'
import type { PaymentTarget } from './ReceivablesClient'
import ReceivablesTable from './ReceivablesTable'

function makeReceivable(salesBalance = 50000): CustomerReceivable {
  return {
    customer: 'PT Test Maju',
    totalTransaksi: 1,
    totalTagihan: salesBalance,
    totalTerbayar: 0,
    totalPiutang: salesBalance,
    avgDiskonPersen: 0,
    sales: [
      {
        id: 'sale-001',
        refNo: 'REF-001',
        date: new Date('2026-03-10').toISOString(),
        grandTotal: salesBalance,
        paid: 0,
        balance: salesBalance,
        status: 'Belum Bayar',
      },
    ],
  }
}

describe('quick-pay button', () => {
  it('renders a "Bayar" button on a customer row that has outstanding balance', () => {
    const receivables = [makeReceivable(50000)]
    render(
      <ReceivablesTable
        receivables={receivables}
        loading={false}
        expandedCustomer={null}
        onToggleExpand={vi.fn()}
        onRecordPayment={vi.fn()}
        onViewHistory={vi.fn()}
        onQuickPay={vi.fn()}
      />
    )

    // The quick-pay "Bayar" button should be directly on the customer row
    // (not inside the expanded detail sub-table)
    const bayarButtons = screen.getAllByText('Bayar')
    expect(bayarButtons.length).toBeGreaterThan(0)
  })

  it('clicking "Bayar" button calls onQuickPay with the first unpaid sale data', () => {
    const receivables = [makeReceivable(50000)]
    const onQuickPay = vi.fn()

    render(
      <ReceivablesTable
        receivables={receivables}
        loading={false}
        expandedCustomer={null}
        onToggleExpand={vi.fn()}
        onRecordPayment={vi.fn()}
        onViewHistory={vi.fn()}
        onQuickPay={onQuickPay}
      />
    )

    const bayarButton = screen.getByText('Bayar')
    fireEvent.click(bayarButton)

    expect(onQuickPay).toHaveBeenCalledOnce()
    const calledWith: PaymentTarget = onQuickPay.mock.calls[0][0]
    expect(calledWith.saleId).toBe('sale-001')
    expect(calledWith.balance).toBe(50000)
    expect(calledWith.refNo).toBe('REF-001')
  })
})
