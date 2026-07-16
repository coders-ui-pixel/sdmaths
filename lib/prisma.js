"use strict";
var _a;
exports.__esModule = true;
exports.prisma = void 0;
var client_1 = require("@prisma/client");
var adapter_mariadb_1 = require("@prisma/adapter-mariadb");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var globalForPrisma = global;
function createPrismaClient() {
    var connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is required");
    }
    // Some hosts (e.g. cPanel/shared hosting) only accept local MySQL/MariaDB
    // connections via a Unix socket, not TCP — even for "localhost". When
    // DB_SOCKET_PATH is set, connect via the socket instead, reusing the
    // user/password/database parsed out of DATABASE_URL.
    var socketPath = process.env.DB_SOCKET_PATH;
    var connectionConfig = socketPath
        ? (function () {
            var url = new URL(connectionString);
            return {
                socketPath: socketPath,
                user: decodeURIComponent(url.username),
                password: decodeURIComponent(url.password),
                database: url.pathname.replace(/^\//, "")
            };
        })()
        : connectionString;
    var adapter = new adapter_mariadb_1.PrismaMariaDb(connectionConfig);
    return new client_1.PrismaClient({
        adapter: adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
    });
}
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : createPrismaClient();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
