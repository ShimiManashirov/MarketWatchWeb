import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Express } from 'express';

export interface AuthRequest extends Request {
    user?: { _id: string };
    file?: Express.Multer.File;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    // Debug logs (temporary) to diagnose token issues
    console.log('authMiddleware: Authorization header =', authHeader);
    console.log('authMiddleware: token =', token);
    console.log('authMiddleware: JWT_SECRET present =', !!process.env.JWT_SECRET);

    if (!token) return res.status(401).send("Access Denied: No token provided");

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) return res.status(403).send("Invalid or expired token");
        
        req.user = user as { _id: string };
        next();
    });
};