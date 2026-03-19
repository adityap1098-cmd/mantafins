import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import Sidebar from '@/app/_components/Sidebar'
import ExportClient from './_components/ExportClient'
import { prisma } from '@/lib/prisma'

export default async function ExportPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('manta_session')?.value
  if (!token || !(await validateSession(token))) {
    redirect('/login')
  }

  const periods = await prisma.period.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <ExportClient periods={periods} />
      </main>
    </div>
  )
}
