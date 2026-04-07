import type { Metadata } from 'next'
import DashboardClient from '@/app/dashboard/_components/DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard | Manta Racing Finance',
}

export default async function DashboardPage() {
  return <DashboardClient />
}
