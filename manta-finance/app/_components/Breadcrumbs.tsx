'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const SEGMENT_LABELS: Record<string, string> = {
  dashboard:   'Dashboard',
  import:      'Import Data',
  stock:       'Stock',
  sales:       'Penjualan',
  finance:     'Finance',
  receivables: 'Piutang',
  export:      'Export',
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-gray-500">
      <Link href="/dashboard" className="hover:text-gray-800" aria-label="home">
        <Home size={14} />
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const label = SEGMENT_LABELS[seg] ?? seg
        const isLast = i === segments.length - 1
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-400" />
            {isLast ? (
              <span className="text-gray-800 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-800">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
