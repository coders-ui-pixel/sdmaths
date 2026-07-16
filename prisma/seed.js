"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var prisma_1 = require("../lib/prisma");
var site_1 = require("../lib/site");
var bcryptjs_1 = require("bcryptjs");
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminEmail, adminPassword, hashedPassword, brandingCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Starting Production Cleanup...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 22, , 23]);
                    // 1. Delete existing data (Reverse order of dependencies)
                    console.log("🧹 Clearing test data...");
                    return [4 /*yield*/, prisma_1.prisma.notification.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.notificationTemplate.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.message.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.mCQResult.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.mCQQuestion.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.mCQExam.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.progress.deleteMany()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.payment.deleteMany()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.importantQuestion.deleteMany()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.note.deleteMany()];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.lesson.deleteMany()];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.course.deleteMany()];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.session.deleteMany()];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.account.deleteMany()];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.user.deleteMany()];
                case 16:
                    _a.sent();
                    console.log("✅ Database cleared.");
                    adminEmail = "admin@mathschool.com";
                    adminPassword = "AdminPassword2026!";
                    return [4 /*yield*/, bcryptjs_1["default"].hash(adminPassword, 10)];
                case 17:
                    hashedPassword = _a.sent();
                    console.log("\uD83D\uDC64 Creating production admin: ".concat(adminEmail));
                    return [4 /*yield*/, prisma_1.prisma.user.create({
                            data: {
                                email: adminEmail,
                                name: "Administrator",
                                password: hashedPassword,
                                role: "ADMIN"
                            }
                        })
                        // 3. Initialize Branding
                    ];
                case 18:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.branding.count()];
                case 19:
                    brandingCount = _a.sent();
                    if (!(brandingCount === 0)) return [3 /*break*/, 21];
                    console.log("🎨 Initializing default branding...");
                    return [4 /*yield*/, prisma_1.prisma.branding.create({
                            data: {
                                id: "global",
                                siteName: site_1.SITE_NAME,
                                primaryColor: "#3b82f6",
                                secondaryColor: "#1e40af",
                                heroHeadline: "Experience Mathematics",
                                heroHighlight: "Like Never Before",
                                heroSubtitle: "Join the most advanced online platform for mathematical excellence in Nepal."
                            }
                        })];
                case 20:
                    _a.sent();
                    _a.label = 21;
                case 21:
                    console.log("✨ Site is now ready for production!");
                    console.log("----------------------------------");
                    console.log("Email: ".concat(adminEmail));
                    console.log("Password: ".concat(adminPassword));
                    console.log("----------------------------------");
                    console.log("IMPORTANT: Please change the admin password immediately after logging in.");
                    return [3 /*break*/, 23];
                case 22:
                    error_1 = _a.sent();
                    console.error("❌ Cleanup failed:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 23];
                case 23: return [2 /*return*/];
            }
        });
    });
}
main()["finally"](function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
