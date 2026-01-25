import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    content: string;
    owner: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, { timestamps: true });

// Index for faster queries by post
commentSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', commentSchema);
