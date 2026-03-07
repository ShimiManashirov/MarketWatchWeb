import { Request, Response } from 'express';
import User from '../models/user_model';
import { AuthRequest } from '../middleware/auth_middleware';

const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as AuthRequest).user?._id);
        if (!user) return res.status(404).send("User not found");
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?._id;
        const { username, imageUrl } = req.body;
        // Build update object only with provided fields
        const updateData: { username?: string; image?: string } = {};
        if (username) updateData.username = username;

        // If a new file was uploaded, prefer that file path
        if (req.file) {
            updateData.image = req.file.path;
        } else if (imageUrl) {
            // Allow providing an external image URL
            updateData.image = imageUrl;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(400).send(err);
    }
};

export default { getProfile, updateProfile };
