import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Neon PostgreSQL connection settings (free tier compatible):
 *   - connection_limit=3: Stay well under the ~20 connection cap
 *   - pool_timeout=30:   Give queries enough time on cold starts
 *
 * The DATABASE_URL in .env must be the Neon pooled connection string
 * (ends with -pooler.neon.tech), NOT the direct connection.
 *
 * In production, query logging is disabled for performance.
 */
function buildDatabaseUrl(): string {
  const baseUrl = process.env.DATABASE_URL ?? ''
  if (!baseUrl || baseUrl.startsWith('file:')) {
    // Dev fallback: if no Neon URL, use whatever is set (allows local SQLite testing)
    return baseUrl
  }
  // Append Neon-friendly pool settings if not already present
  const separator = baseUrl.includes('?') ? '&' : '?'
  if (!baseUrl.includes('connection_limit')) {
    return `${baseUrl}${separator}connection_limit=3&pool_timeout=30`
  }
  return baseUrl
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
