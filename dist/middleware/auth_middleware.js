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
    if (!token) {
        return res.status(401).send("Access Denied: No token provided");
    }
    const secret = process.env.JWT_SECRET || 'test_secret';
    jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).send("Invalid or expired token");
        }
        req.user = decoded;
        next();
    });
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth_middleware.js.map