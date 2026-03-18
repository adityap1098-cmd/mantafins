import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Prisma v7 requires a driver adapter for SQLite
  // DATABASE_URL format: "file:../data/manta.db" — libsql accepts this format
  const adapter = new PrismaLibSql({ url: databaseUrl })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
