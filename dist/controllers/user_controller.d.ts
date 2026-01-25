import { Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
declare const _default: {
    getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
};
export default _default;
