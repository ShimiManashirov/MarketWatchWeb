import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlistItem extends Document {
    user: mongoose.Types.ObjectId;
    symbol: string;
    name: string;
    addedAt: Date;
}

const WatchlistItemSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    name: {
        type: String,
        default: ''
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate symbols per user
WatchlistItemSchema.index({ user: 1, symbol: 1 }, { unique: true });

export default mongoose.model<IWatchlistItem>('WatchlistItem', WatchlistItemSchema);
