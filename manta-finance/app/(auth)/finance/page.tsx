import type { Metadata } from 'next'
import FinanceClient from '@/app/finance/_components/FinanceClient'

export const metadata: Metadata = {
  title: 'Laporan Keuangan | Manta Racing Finance',
}

export default async function FinancePage() {
  return <FinanceClient />
}
