import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/app/_components/Sidebar'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('manta_session')?.value
  if (!token || !(await validateSession(token))) {
    redirect('/login')
  }

  // Query piutang count server-side (customers with outstanding balance in latest period)
  let piutangCount = 0
  try {
    const latestPeriod = await prisma.period.findFirst({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })
    if (latestPeriod) {
      const salesWithBalance = await prisma.sale.findMany({
        where: { periodId: latestPeriod.id },
        select: { customer: true, grandTotal: true, paid: true },
      })
      const customersWithOutstanding = new Set(
        salesWithBalance
          .filter((s) => s.grandTotal - s.paid > 0)
          .map((s) => s.customer)
      )
      piutangCount = customersWithOutstanding.size
    }
  } catch {
    // Non-critical — badge simply won't show if query fails
    piutangCount = 0
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Sidebar piutangCount={piutangCount} />
      <main className="main-content" style={{ padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  )
}
