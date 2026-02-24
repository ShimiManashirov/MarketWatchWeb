import api from './api';

export interface StockQuote {
    symbol: string;
    longName?: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
}

export interface StockAlert {
    _id: string;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    isTriggered: boolean;
}

export const searchStocks = async (query: string) => {
    return api.get(`/stocks/search?q=${query}`);
};

export const getStockQuote = async (symbol: string) => {
    return api.get<StockQuote>(`/stocks/quote/${symbol}`);
};

export const createAlert = async (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    return api.post('/stocks/alerts', { symbol, targetPrice, condition });
};

export const getAlerts = async () => {
    return api.get<StockAlert[]>('/stocks/alerts');
};

export const deleteAlert = async (id: string) => {
    return api.delete(`/stocks/alerts/${id}`);
};

export const updateAlert = async (id: string, data: { targetPrice?: number; condition?: 'ABOVE' | 'BELOW' }) => {
    return api.put(`/stocks/alerts/${id}`, data);
};

