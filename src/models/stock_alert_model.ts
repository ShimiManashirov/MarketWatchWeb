import mongoose, { Schema, Document } from 'mongoose';

export interface IStockAlert extends Document {
    user: mongoose.Types.ObjectId;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    isTriggered: boolean;
    createdAt: Date;
}

const StockAlertSchema: Schema = new Schema({
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
    targetPrice: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        enum: ['ABOVE', 'BELOW'],
        required: true
    },
    isTriggered: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Efficient multi-field indexing for faster lookup by worker and user queries
StockAlertSchema.index({ user: 1, createdAt: -1 });
StockAlertSchema.index({ isTriggered: 1, symbol: 1 });

export default mongoose.model<IStockAlert>('StockAlert', StockAlertSchema);
