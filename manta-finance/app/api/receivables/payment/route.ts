import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'

interface PaymentRequestBody {
  saleId: string
  amount: number
  note?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const valid = await validateSession(token)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: PaymentRequestBody
  try {
    body = (await req.json()) as PaymentRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { saleId, amount, note } = body

  // Validate inputs
  if (!saleId || typeof saleId !== 'string') {
    return NextResponse.json({ error: 'saleId is required' }, { status: 400 })
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'amount must be a positive number' },
      { status: 400 }
    )
  }

  // Fetch the sale
  const sale = await prisma.sale.findUnique({ where: { id: saleId } })
  if (!sale) {
    return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
  }

  // Check overpayment
  if (amount > sale.balance) {
    return NextResponse.json(
      { error: 'Jumlah pembayaran melebihi sisa piutang' },
      { status: 400 }
    )
  }

  // Compute new values immutably
  const newPaid = sale.paid + amount
  const newBalance = sale.balance - amount
  const newStatus = newBalance <= 0 ? 'Terbayar' : sale.status

  // Atomic transaction: update sale + create PaymentLog
  await prisma.$transaction([
    prisma.sale.update({
      where: { id: saleId },
      data: {
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
      },
    }),
    prisma.paymentLog.create({
      data: {
        saleId,
        refNo: sale.refNo,
        customer: sale.customer,
        amount,
        date: new Date(),
        note: note ?? null,
      },
    }),
  ])

  return NextResponse.json(
    { success: true, saleId, newPaid, newBalance, newStatus },
    { status: 201 }
  )
}
