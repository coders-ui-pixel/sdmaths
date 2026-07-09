import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required")
  }

  // Some hosts (e.g. cPanel/shared hosting) only accept local MySQL/MariaDB
  // connections via a Unix socket, not TCP — even for "localhost". When
  // DB_SOCKET_PATH is set, connect via the socket instead, reusing the
  // user/password/database parsed out of DATABASE_URL.
  const socketPath = process.env.DB_SOCKET_PATH
  const connectionConfig = socketPath
    ? (() => {
        const url = new URL(connectionString)
        return {
          socketPath,
          user: decodeURIComponent(url.username),
          password: decodeURIComponent(url.password),
          database: url.pathname.replace(/^\//, ""),
        }
      })()
    : connectionString

  const adapter = new PrismaMariaDb(connectionConfig)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
