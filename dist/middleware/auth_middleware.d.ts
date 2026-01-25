import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
    file?: Express.Multer.File;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
