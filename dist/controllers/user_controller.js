"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user_model"));
const getProfile = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.user?._id);
        if (!user)
            return res.status(404).send("User not found");
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
};
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { username, imageUrl } = req.body;
        // Build update object only with provided fields
        const updateData = {};
        if (username)
            updateData.username = username;
        // If a new file was uploaded, prefer that file path
        if (req.file) {
            updateData.image = req.file.path;
        }
        else if (imageUrl) {
            // Allow providing an external image URL
            updateData.image = imageUrl;
        }
        const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).send(updatedUser);
    }
    catch (err) {
        res.status(400).send(err);
    }
};
exports.default = { getProfile, updateProfile };
//# sourceMappingURL=user_controller.js.map