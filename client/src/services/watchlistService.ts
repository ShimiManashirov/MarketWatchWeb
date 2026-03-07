import api from './api';

export interface WatchlistItem {
    _id: string;
    symbol: string;
    name: string;
    addedAt: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    lastUpdate: string | null;
}

export const getWatchlist = async () => {
    return api.get<WatchlistItem[]>('/watchlist');
};

export const addToWatchlist = async (symbol: string, name: string) => {
    return api.post('/watchlist', { symbol, name });
};

export const removeFromWatchlist = async (symbol: string) => {
    return api.delete(`/watchlist/${symbol}`);
};
