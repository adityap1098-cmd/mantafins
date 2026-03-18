'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors"
    >
      Keluar
    </button>
  )
}
