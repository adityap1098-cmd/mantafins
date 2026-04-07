import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Verify active session
  const cookieStore = cookies()
  const token = cookieStore.get('manta_session')?.value
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Password tidak boleh kosong' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
  }

  // Validate current password against APP_PASSWORD env var
  const appPassword = process.env.APP_PASSWORD
  if (!appPassword) {
    return NextResponse.json({ error: 'Konfigurasi server tidak valid' }, { status: 500 })
  }
  if (currentPassword !== appPassword) {
    return NextResponse.json({ error: 'Password saat ini tidak benar' }, { status: 401 })
  }

  // Note: APP_PASSWORD is an environment variable — user must update it in their .env file.
  // This endpoint validates the change but cannot persist ENV var changes at runtime.
  // Return instructions for env-based password management.
  return NextResponse.json({
    success: true,
    message: 'Password diverifikasi. Perbarui APP_PASSWORD di file .env untuk menerapkan password baru.',
  })
}
