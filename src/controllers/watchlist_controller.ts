import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import WatchlistItem from '../models/watchlist_model';
import stockService from '../services/stock_service';

const addToWatchlist = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?._id;
        const { symbol, name } = req.body;

        if (!symbol) {
            return res.status(400).json({ message: "Symbol is required" });
        }

        const item = new WatchlistItem({ user: userId, symbol, name: name || '' });
        await item.save();
        res.status(201).json(item);
    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Asset already in watchlist" });
        }
        res.status(500).json({ message: 'Could not add to watchlist. Please try again.', code: 500 });
    }
};

const removeFromWatchlist = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?._id;
        const symbol = (req.params.symbol as string).toUpperCase();

        const deleted = await WatchlistItem.findOneAndDelete({ user: userId, symbol });
        if (!deleted) {
            return res.status(404).json({ message: "Asset not found in watchlist" });
        }
        res.status(200).json({ message: "Removed from watchlist" });
    } catch (err) {
        res.status(500).json({ message: 'Could not remove from watchlist. Please try again.', code: 500 });
    }
};

const getWatchlist = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?._id;
        const items = await WatchlistItem.find({ user: userId }).sort({ addedAt: -1 });

        // Fetch live quotes for each item
        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                try {
                    const quote = await stockService.getStockQuote(item.symbol);
                    return {
                        _id: item._id,
                        symbol: item.symbol,
                        name: item.name || (quote as any).longName || item.symbol,
                        addedAt: item.addedAt,
                        price: (quote as any).regularMarketPrice || null,
                        change: (quote as any).regularMarketChange || null,
                        changePercent: (quote as any).regularMarketChangePercent || null,
                        lastUpdate: new Date()
                    };
                } catch {
                    return {
                        _id: item._id,
                        symbol: item.symbol,
                        name: item.name,
                        addedAt: item.addedAt,
                        price: null,
                        change: null,
                        changePercent: null,
                        lastUpdate: null
                    };
                }
            })
        );

        res.status(200).json(enrichedItems);
    } catch (err) {
        res.status(500).json({ message: 'Could not load watchlist. Please try again.', code: 500 });
    }
};

export default {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist
};
