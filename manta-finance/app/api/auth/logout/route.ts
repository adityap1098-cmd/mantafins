import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (token) await deleteSession(token)
  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return res
}
