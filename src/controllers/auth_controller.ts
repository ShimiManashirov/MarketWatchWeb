import { Request, Response } from 'express';
import User from '../models/user_model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const generateTokens = (_id: string) => {
    const accessSecret = process.env.JWT_SECRET || 'test_secret';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret';

    if (!accessSecret || !refreshSecret) {
        throw new Error('Missing JWT secrets in environment');
    }

    const accessToken = jwt.sign({ _id }, accessSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ _id, random: Math.random() }, refreshSecret);

    return { accessToken, refreshToken };
};

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body;


        const exists = await User.findOne({ email });
        if (exists) return res.status(400).send("User already exists");


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ email, password: hashedPassword, username });
        await user.save();

        res.status(201).send({ _id: user._id, username: user.username });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        res.status(400).json({ message });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        const user = await User.findOne({ username }).select('+password +refreshTokens');
        if (!user || !user.password) return res.status(400).send("Invalid username or password");

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).send("Invalid username or password");

        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        // Use atomic $push to avoid VersionError during login
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { refreshTokens: refreshToken } },
            { new: true }
        );

        res.status(200).send({
            accessToken,
            refreshToken,
            user: {
                _id: updatedUser?._id,
                username: updatedUser?.username,
                email: updatedUser?.email,
                image: updatedUser?.image
            }
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        res.status(500).json({ message });
    }
};


// Add these functions to your existing auth_controller.ts

const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).send("No refresh token provided");

    try {
        // Find user who owns this refresh token
        const user = await User.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
        if (!user) return res.status(403).send("Invalid refresh token");

        // Verify the token
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret';
        jwt.verify(refreshToken, refreshSecret, async (err: any, decoded: any) => {
            if (err) return res.status(403).send("Invalid refresh token");

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

            // Replace old refresh token with new one atomically to avoid VersionError
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id, refreshTokens: refreshToken },
                    {
                        $set: { "refreshTokens.$": newRefreshToken }
                    },
                    { new: true }
                );

                if (!updatedUser) {
                    return res.status(403).send("Refresh token already used or invalid");
                }

                res.status(200).send({ accessToken, refreshToken: newRefreshToken });
            } catch (saveError) {
                console.error("Token rotation error:", saveError);
                res.status(500).send("Internal server error during token rotation");
            }
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).send("No token provided");

    try {
        const user = await User.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
        if (!user) return res.status(403).send("Invalid token");

        // Remove the specific refresh token from DB to logout the device
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();

        res.status(200).send("Logged out successfully");
    } catch (err) {
        res.status(400).send(err);
    }
};

// Don't forget to update the export at the bottom!
export default { register, login, logout, refresh };