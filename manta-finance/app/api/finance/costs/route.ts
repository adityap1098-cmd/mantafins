import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const valid = await validateSession(token)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { periodId, description, amount } = body as {
    periodId?: unknown
    description?: unknown
    amount?: unknown
  }

  if (!periodId || typeof periodId !== 'string') {
    return NextResponse.json({ error: 'periodId is required' }, { status: 400 })
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return NextResponse.json({ error: 'description must be a non-empty string' }, { status: 400 })
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }

  const cost = await prisma.operationalCost.create({
    data: {
      periodId,
      description: description.trim(),
      amount,
    },
  })

  return NextResponse.json(
    { id: cost.id, periodId: cost.periodId, description: cost.description, amount: cost.amount },
    { status: 201 }
  )
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const valid = await validateSession(token)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 })
  }

  try {
    await prisma.operationalCost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    const error = err as { code?: string }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Operational cost not found' }, { status: 404 })
    }
    throw err
  }
}
