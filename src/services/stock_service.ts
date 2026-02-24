import YahooFinance from 'yahoo-finance2';
import StockAlert, { IStockAlert } from '../models/stock_alert_model';
import User from '../models/user_model';

const yahooFinance = new YahooFinance();

const searchStocks = async (query: string) => {
    try {
        const results = await yahooFinance.search(query) as any;
        return (results.quotes || []).filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'INDEX' || q.quoteType === 'ETF');
    } catch (error) {
        console.error('Yahoo Finance Search Error:', error);
        throw new Error('Stock search is temporarily unavailable. Please try again later.');
    }
};

const getStockQuote = async (symbol: string) => {
    try {
        const quote = await yahooFinance.quote(symbol) as any;
        return quote;
    } catch (error) {
        console.error('Yahoo Finance Quote Error:', error);
        throw new Error(`Unable to fetch quote for ${symbol}. Please check the symbol and try again.`);
    }
};

const createAlert = async (userId: string, symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const alert = new StockAlert({
        user: userId,
        symbol,
        targetPrice,
        condition
    });
    return await alert.save();
};

const getUserAlerts = async (userId: string) => {
    return await StockAlert.find({ user: userId, isTriggered: false }).sort({ createdAt: -1 });
};

const deleteAlert = async (alertId: string, userId: string) => {
    return await StockAlert.findOneAndDelete({ _id: alertId, user: userId });
};

// Check alerts logic (to be called by worker)
const checkAlerts = async () => {
    const activeAlerts = await StockAlert.find({ isTriggered: false });
    const symbols = [...new Set(activeAlerts.map(a => a.symbol))]; // Unique symbols

    for (const symbol of symbols) {
        try {
            const quote = await yahooFinance.quote(symbol) as any;
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
                    alert.isTriggered = true;
                    await alert.save();
                    // In a real app, send email/push notification here
                    console.log(`ALERT TRIGGERED: ${symbol} is ${alert.condition} ${alert.targetPrice} (Current: ${currentPrice})`);
                }
            }
        } catch (err) {
            console.error(`Failed to check alerts for ${symbol}`, err);
        }
    }
};

const updateAlert = async (alertId: string, userId: string, data: { targetPrice?: number; condition?: 'ABOVE' | 'BELOW' }) => {
    return await StockAlert.findOneAndUpdate(
        { _id: alertId, user: userId },
        { $set: data },
        { new: true }
    );
};

export default {
    searchStocks,
    getStockQuote,
    createAlert,
    getUserAlerts,
    deleteAlert,
    checkAlerts,
    updateAlert
};

