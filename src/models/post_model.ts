import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    owner: mongoose.Types.ObjectId;
    image?: string;
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Index for faster queries by owner
postSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', postSchema);
