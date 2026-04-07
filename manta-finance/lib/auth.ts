import { prisma } from './prisma'

export const SESSION_COOKIE_NAME = 'manta_session'
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createSession(): Promise<string> {
  const token = crypto.randomUUID()
  await prisma.session.create({
    data: {
      token,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  })
  return token
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false
  const session = await prisma.session.findUnique({ where: { token } })
  if (!session) return false
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } })
    return false
  }
  return true
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } })
}
