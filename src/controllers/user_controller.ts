import { Request, Response } from 'express';
import User from '../models/user_model';
import { AuthRequest } from '../middleware/auth_middleware';

const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password -refreshTokens');
        if (!user) return res.status(404).send("User not found");
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { username } = req.body;
        let updateData: any = { username };

        // If a new file was uploaded, add its path to the update object
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        ).select('-password -refreshTokens');

        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(400).send(err);
    }
};

export default { getProfile, updateProfile };
