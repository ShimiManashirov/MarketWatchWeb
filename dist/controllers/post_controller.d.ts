import { Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
declare const _default: {
    createPost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAllPosts: (req: AuthRequest, res: Response) => Promise<void>;
    getPostById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPostsByOwner: (req: AuthRequest, res: Response) => Promise<void>;
    updatePost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deletePost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    likePost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    unlikePost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
