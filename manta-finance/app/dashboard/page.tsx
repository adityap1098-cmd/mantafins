import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import LogoutButton from './_components/LogoutButton'

export default async function DashboardPage() {
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
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">Dashboard siap digunakan</p>
        <p className="text-sm mt-2">Fitur dashboard akan tersedia di Phase 3.</p>
      </div>
    </main>
  )
}
