import { Request } from 'express';

declare global {
    namespace Express {
        interface User {
            _id: string;
        }
    }
}

export interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}
