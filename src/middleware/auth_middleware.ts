import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { _id: string };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).send("Access Denied: No token provided");
    }

    const secret = process.env.JWT_SECRET || 'test_secret';
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).send("Invalid or expired token");
        }

        (req as AuthRequest).user = decoded as { _id: string };
        next();
    });
};