import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/_components/LogoutButton'
import ReceivablesClient from './_components/ReceivablesClient'

export default async function ReceivablesPage() {
  // Server-side session validation (defense in depth — middleware handles redirect but this double-checks)
  const cookieStore = cookies()
  const token = cookieStore.get('manta_session')?.value
  if (!token || !(await validateSession(token))) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manta Racing Finance</h1>
          <p className="text-xs text-gray-500">Dashboard Keuangan Internal</p>
        </div>
        <LogoutButton />
      </header>
      <nav className="bg-white border-b border-gray-100 px-6 py-2 flex gap-4">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Dashboard
        </Link>
        <Link href="/import" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Import Data
        </Link>
        <Link href="/stock" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Stock
        </Link>
        <Link href="/sales" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Penjualan
        </Link>
        <Link href="/finance" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Finance
        </Link>
        <Link
          href="/receivables"
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold border-b-2 border-blue-600"
        >
          Piutang
        </Link>
        <Link href="/export" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Export
        </Link>
      </nav>
      <ReceivablesClient />
    </main>
  )
}
