import YahooFinance from 'yahoo-finance2';
import mongoose from 'mongoose';
import StockAlert, { IStockAlert } from '../models/stock_alert_model';
import User from '../models/user_model';

const yahooFinance = new (YahooFinance as any)({ validation: { logErrors: false } });

const searchStocks = async (query: string) => {
    try {
        const results = await yahooFinance.search(query, {}, { validateResult: false }) as any;
        return (results.quotes || []).filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'INDEX' || q.quoteType === 'ETF');
    } catch (error) {
        console.error('Yahoo Finance Search Error:', error);
        throw new Error('Stock search is temporarily unavailable. Please try again later.');
    }
};

const getStockQuote = async (symbol: string) => {
    try {
        const quote = await yahooFinance.quote(symbol, {}, { validateResult: false }) as any;
        return quote;
    } catch (error) {
        console.error('Yahoo Finance Quote Error:', error);
        throw new Error(`Unable to fetch quote for ${symbol}. Please check the symbol and try again.`);
    }
};

const getHistoricalData = async (symbol: string, period1: string, period2: string | Date = new Date(), interval: '1d' | '1wk' | '1mo' = '1d') => {
    try {
        const queryOptions: any = { period1, period2, interval };
        const results = await yahooFinance.historical(symbol, queryOptions, { validateResult: false });
        return results || [];
    } catch (error: any) {
        if (error.message?.includes('No data')) return [];
        console.error('Yahoo Finance Historical Error:', error);
        throw new Error(`Unable to fetch historical data for ${symbol}.`);
    }
};

const createAlert = async (userId: string, symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alert = new StockAlert({
        user: userObjectId,
        symbol,
        targetPrice,
        condition
    });
    return await alert.save();
};

const getUserAlerts = async (userId: string) => {
    try {
        // Mongoose automatically casts the string userId to an ObjectId
        return await StockAlert.find({ user: userId }).sort({ createdAt: -1 });
    } catch (err) {
        console.error(`Error loading alerts for user ${userId}:`, err);
        throw new Error('Failed to load alerts');
    }
};

const deleteAlert = async (alertId: string, userId: string) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await StockAlert.findOneAndDelete({ _id: alertId, user: userObjectId });
};

// Check all active alerts against current market prices
const checkAlerts = async () => {
    const activeAlerts = await StockAlert.find({ isTriggered: false });
    const symbols = [...new Set(activeAlerts.map(a => a.symbol))]; // Unique symbols

    for (const symbol of symbols) {
        try {
            const quote = await yahooFinance.quote(symbol, {}, { validateResult: false }) as any;
            if (!quote || !quote.regularMarketPrice) continue;

            const currentPrice = quote.regularMarketPrice;
            const alertsForSymbol = activeAlerts.filter(a => a.symbol === symbol);

            for (const alert of alertsForSymbol) {
                let triggered = false;
                if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
                    triggered = true;
                } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
                    triggered = true;
                }

                if (triggered) {
                    await StockAlert.findByIdAndUpdate(alert._id, { isTriggered: true });
                    console.log(`Alert triggered for ${symbol}: ${alert.condition} ${alert.targetPrice} (Price: ${currentPrice})`);
                }
            }
        } catch (err) {
            console.error(`Failed to check alerts for ${symbol}`, err);
        }
    }
};

const updateAlert = async (alertId: string, userId: string, data: { targetPrice?: number; condition?: 'ABOVE' | 'BELOW' }) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await StockAlert.findOneAndUpdate(
        { _id: alertId, user: userObjectId },
        { $set: data },
        { new: true }
    );
};

export default {
    searchStocks,
    getStockQuote,
    getHistoricalData,
    createAlert,
    getUserAlerts,
    deleteAlert,
    checkAlerts,
    updateAlert
};

