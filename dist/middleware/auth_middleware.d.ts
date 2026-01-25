import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
