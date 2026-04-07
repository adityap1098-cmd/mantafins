import type { Metadata } from 'next'
import StockClient from '@/app/stock/_components/StockClient'

export const metadata: Metadata = {
  title: 'Stok Produk | Manta Racing Finance',
}

export default async function StockPage() {
  return <StockClient />
}
