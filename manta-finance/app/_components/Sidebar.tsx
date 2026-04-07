'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Upload,
  Package,
  Boxes,
  ShoppingCart,
  BarChart2,
  CreditCard,
  Download,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import LogoutButton from './LogoutButton'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/import',      label: 'Import Data',    icon: Upload },
  { href: '/products',    label: 'Master Produk',  icon: Boxes },
  { href: '/stock',       label: 'Stock',          icon: Package },
  { href: '/sales',       label: 'Penjualan',      icon: ShoppingCart },
  { href: '/finance',     label: 'Finance',        icon: BarChart2 },
  { href: '/receivables', label: 'Piutang',        icon: CreditCard },
]

const BOTTOM_ITEMS = [
  { href: '/export',    label: 'Export',      icon: Download },
  { href: '/settings',  label: 'Pengaturan',  icon: Settings },
]

type SidebarMode = 'full' | 'collapsed' | 'mobile'

function getMode(width: number): SidebarMode {
  if (width > 1200) return 'full'
  if (width >= 768) return 'collapsed'
  return 'mobile'
}

export default function Sidebar({ piutangCount }: { piutangCount: number }) {
  const pathname = usePathname()
  const [mode, setMode] = useState<SidebarMode>('full')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function handleResize() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setMode(getMode(window.innerWidth))
      }, 150)
    }

    // Set initial mode
    setMode(getMode(window.innerWidth))
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isCollapsed = mode === 'collapsed'
  const isMobile = mode === 'mobile'

  const sidebarStyle: React.CSSProperties = {
    background: 'var(--sidebar-bg)',
    width: isCollapsed ? 56 : 260,
    transition: 'width 0.25s ease, transform 0.25s ease',
    transform: isMobile
      ? mobileOpen ? 'translateX(0)' : 'translateX(-100%)'
      : 'translateX(0)',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  }

  return (
    <>
      {/* Hamburger button — mobile only */}
      {isMobile && (
        <button
          className="sidebar-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        style={sidebarStyle}
        className={isCollapsed ? 'sidebar-collapsed' : ''}
      >
        {/* Brand */}
        <div
          className={`flex items-center px-3 py-5 ${isCollapsed ? 'justify-center' : 'gap-3 px-5'}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{
              width: 36,
              height: 36,
              background: '#ffffff',
              borderRadius: 10,
              padding: 3,
            }}
          >
            <Image
              src="/logo.jpeg"
              alt="Manta Racing"
              width={30}
              height={30}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
            />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">Manta Racing</p>
              <p
                className="uppercase font-semibold"
                style={{ fontSize: 10, letterSpacing: '0.8px', color: 'var(--sidebar-text)' }}
              >
                Finance Dashboard
              </p>
            </div>
          )}
          {/* Close button on mobile */}
          {isMobile && mobileOpen && (
            <button
              className="sidebar-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{ marginLeft: 'auto' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Main nav */}
        <div className={`flex-1 ${isCollapsed ? 'px-1' : 'px-3'}`}>
          {!isCollapsed && (
            <p
              className="uppercase font-semibold mb-2 px-2"
              style={{ fontSize: 10, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.18)' }}
            >
              Menu
            </p>
          )}
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link${active ? ' active' : ''}${isCollapsed ? ' sidebar-link-icon' : ''}`}
                  data-tooltip={label}
                >
                  <span
                    className="sidebar-icon flex items-center justify-center flex-shrink-0 relative"
                    style={{ width: 20, height: 20 }}
                  >
                    <Icon size={17} />
                    {/* Small red dot badge in collapsed mode */}
                    {href === '/receivables' && piutangCount > 0 && isCollapsed && (
                      <span className="sidebar-dot-badge" />
                    )}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{label}</span>
                      {href === '/receivables' && piutangCount > 0 && (
                        <span
                          className="text-white font-bold ml-auto"
                          style={{
                            fontSize: 10,
                            background: 'var(--red)',
                            padding: '2px 7px',
                            borderRadius: 20,
                          }}
                        >
                          {piutangCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {!isCollapsed && (
              <p
                className="uppercase font-semibold mb-2 px-2"
                style={{ fontSize: 10, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.18)' }}
              >
                Lainnya
              </p>
            )}
            <nav className="space-y-0.5">
              {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`sidebar-link${active ? ' active' : ''}${isCollapsed ? ' sidebar-link-icon' : ''}`}
                    data-tooltip={label}
                  >
                    <span
                      className="sidebar-icon flex items-center justify-center flex-shrink-0"
                      style={{ width: 20, height: 20 }}
                    >
                      <Icon size={17} />
                    </span>
                    {!isCollapsed && label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Logout */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <LogoutButton collapsed={isCollapsed} />
        </div>
      </aside>
    </>
  )
}
