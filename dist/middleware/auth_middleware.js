"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    // Debug logs (temporary) to diagnose token issues
    console.log('authMiddleware: Authorization header =', authHeader);
    console.log('authMiddleware: token =', token);
    console.log('authMiddleware: JWT_SECRET present =', !!process.env.JWT_SECRET);
    if (!token)
        return res.status(401).send("Access Denied: No token provided");
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).send("Invalid or expired token");
        req.user = user;
        next();
    });
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth_middleware.js.map