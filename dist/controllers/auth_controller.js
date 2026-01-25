"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user_model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (_id) => {
    const accessSecret = process.env.JWT_SECRET || 'test_secret';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret';
    if (!accessSecret || !refreshSecret) {
        throw new Error('Missing JWT secrets in environment');
    }
    const accessToken = jsonwebtoken_1.default.sign({ _id }, accessSecret, { expiresIn: '1h' });
    const refreshToken = jsonwebtoken_1.default.sign({ _id, random: Math.random() }, refreshSecret);
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const exists = await user_model_1.default.findOne({ email });
        if (exists)
            return res.status(400).send("User already exists");
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = new user_model_1.default({ email, password: hashedPassword, username });
        await user.save();
        res.status(201).send({ _id: user._id, username: user.username });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        res.status(400).json({ message });
    }
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        const user = await user_model_1.default.findOne({ username }).select('+password +refreshTokens');
        if (!user || !user.password)
            return res.status(400).send("Invalid username or password");
        const validPass = await bcryptjs_1.default.compare(password, user.password);
        if (!validPass)
            return res.status(400).send("Invalid username or password");
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.status(200).send({ accessToken, refreshToken, username: user.username, _id: user._id });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        res.status(500).json({ message });
    }
};
// Add these functions to your existing auth_controller.ts
const refresh = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken)
        return res.status(401).send("No refresh token provided");
    try {
        // Find user who owns this refresh token
        const user = await user_model_1.default.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
        if (!user)
            return res.status(403).send("Invalid refresh token");
        // Verify the token
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret';
        jsonwebtoken_1.default.verify(refreshToken, refreshSecret, (err, decoded) => {
            if (err)
                return res.status(403).send("Invalid refresh token");
            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
            // Replace old refresh token with the new one in DB
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            user.refreshTokens.push(newRefreshToken);
            user.save();
            res.status(200).send({ accessToken, refreshToken: newRefreshToken });
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
};
const logout = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken)
        return res.status(401).send("No token provided");
    try {
        const user = await user_model_1.default.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
        if (!user)
            return res.status(403).send("Invalid token");
        // Remove the specific refresh token from DB to logout the device
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
        res.status(200).send("Logged out successfully");
    }
    catch (err) {
        res.status(400).send(err);
    }
};
// Don't forget to update the export at the bottom!
exports.default = { register, login, logout, refresh };
//# sourceMappingURL=auth_controller.js.map