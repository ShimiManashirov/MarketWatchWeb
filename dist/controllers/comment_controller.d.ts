import { Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
declare const _default: {
    createComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCommentsByPost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
