import type { Metadata } from 'next'
import ReceivablesClient from '@/app/receivables/_components/ReceivablesClient'

export const metadata: Metadata = { title: 'Piutang | Manta Racing Finance' }

export default async function ReceivablesPage() {
  return <ReceivablesClient />
}
