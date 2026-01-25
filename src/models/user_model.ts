import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    image?: string;
    refreshTokens: string[];
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    image: {
        type: String,
        default: ""
    },
    refreshTokens: {
        type: [String],
        default: [],
        select: false
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);