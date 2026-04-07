'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (collapsed) {
    return (
      <button
        onClick={handleLogout}
        title="Keluar"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7px',
          borderRadius: 10,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--sidebar-text)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          const btn = e.currentTarget
          btn.style.borderColor = 'var(--red)'
          btn.style.color = 'var(--red)'
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget
          btn.style.borderColor = 'rgba(255,255,255,0.08)'
          btn.style.color = 'var(--sidebar-text)'
        }}
      >
        <LogOut size={16} />
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="btn btn-secondary btn-sm hover:!border-[var(--red)] hover:!text-[var(--red)]"
    >
      Keluar
    </button>
  )
}
