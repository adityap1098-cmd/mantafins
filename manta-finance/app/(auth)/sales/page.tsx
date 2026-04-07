import type { Metadata } from 'next'
import SalesClient from '@/app/sales/_components/SalesClient'

export const metadata: Metadata = {
  title: 'Penjualan | Manta Racing Finance',
}

export default async function SalesPage() {
  return <SalesClient />
}
