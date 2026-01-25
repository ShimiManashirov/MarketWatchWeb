import { Request, Response } from 'express';
import User from '../models/user_model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const generateTokens = (userId: string) => {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessSecret || !refreshSecret) {
        throw new Error('Missing JWT secrets in environment');
    }

    const accessToken = jwt.sign({ _id: userId }, accessSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ _id: userId }, refreshSecret);
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
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.password) return res.status(400).send("Invalid email or password");

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).send("Invalid email or password");

        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).send({ accessToken, refreshToken, username: user.username, _id: user._id });
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
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) return res.status(403).send("Invalid refresh token");

        // Verify the token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err: any, decoded: any) => {
            if (err) return res.status(403).send("Invalid refresh token");

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

            // Replace old refresh token with the new one in DB
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            user.refreshTokens.push(newRefreshToken);
            user.save();

            res.status(200).send({ accessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).send("No token provided");

    try {
        const user = await User.findOne({ refreshTokens: refreshToken });
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