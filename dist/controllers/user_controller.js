"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user_model"));
const getProfile = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.user?._id).select('-password -refreshTokens');
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
        const { username } = req.body;
        let updateData = { username };
        // If a new file was uploaded, add its path to the update object
        if (req.file) {
            updateData.image = req.file.path;
        }
        const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -refreshTokens');
        res.status(200).send(updatedUser);
    }
    catch (err) {
        res.status(400).send(err);
    }
};
exports.default = { getProfile, updateProfile };
//# sourceMappingURL=user_controller.js.map