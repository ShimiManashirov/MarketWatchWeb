import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import stockService from '../services/stock_service';

const search = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const results = await stockService.searchStocks(query);
        res.status(200).json(results);
    } catch (err: any) {
        const status = err.message?.includes('unavailable') ? 503 : 500;
        res.status(status).json({ message: err.message || 'Stock search is temporarily unavailable', code: status });
    }
};

const getQuote = async (req: Request, res: Response) => {
    try {
        const symbol = req.params.symbol as string;
        const quote = await stockService.getStockQuote(symbol);
        res.status(200).json(quote);
    } catch (err: any) {
        res.status(500).json({ message: err.message || 'Unable to fetch stock quote', code: 500 });
    }
};

const getHistory = async (req: Request, res: Response) => {
    try {
        const symbol = req.params.symbol as string;
        const { range } = req.query; // e.g. '1w', '1m', '6m', '1y'

        let now = new Date();

        let period1 = new Date(now);
        let interval: '1d' | '1wk' | '1mo' = '1d';

        switch (range) {
            case '1w':
                period1.setDate(now.getDate() - 7);
                break;
            case '1m':
                period1.setMonth(now.getMonth() - 1);
                break;
            case '6m':
                period1.setMonth(now.getMonth() - 6);
                interval = '1wk'; // Use weekly intervals for 6+ months for performance
                break;
            case '1y':
                period1.setFullYear(now.getFullYear() - 1);
                interval = '1mo'; // Use monthly intervals for 1 year
                break;
            default:
                period1.setMonth(now.getMonth() - 1); // default 1 month
        }

        const history = await stockService.getHistoricalData(
            symbol,
            period1.toISOString().split('T')[0],
            now.toISOString().split('T')[0],
            interval
        );
        res.status(200).json(history);
    } catch (err: any) {
        res.status(500).json({ message: err.message || 'Unable to fetch historical data', code: 500 });
    }
};

const createAlert = async (req: Request, res: Response) => {
    try {
        const { symbol, targetPrice, condition } = req.body;
        const userId = (req as AuthRequest).user?._id;

        if (!symbol || targetPrice === undefined || !condition) {
            return res.status(400).json({ message: "Missing fields in alert creation" });
        }

        const alert = await stockService.createAlert(userId!, symbol, Number(targetPrice), condition);
        res.status(201).json(alert);
    } catch (err: any) {
        console.error('Error creating alert:', err);
        res.status(500).json({ message: err.message || 'Could not create alert. Please try again.', code: 500 });
    }
};

const getAlerts = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?._id;
        const alerts = await stockService.getUserAlerts(userId!);
        res.status(200).json(alerts);
    } catch (err) {
        res.status(500).json({ message: 'Could not load alerts. Please try again.', code: 500 });
    }
};

const deleteAlert = async (req: Request, res: Response) => {
    try {
        const alertId = req.params.id as string;
        const userId = (req as AuthRequest).user?._id;
        await stockService.deleteAlert(alertId, userId!);
        res.status(200).json({ message: "Alert deleted" });
    } catch (err) {
        res.status(500).json({ message: 'Could not delete alert. Please try again.', code: 500 });
    }
};

const updateAlert = async (req: Request, res: Response) => {
    try {
        const alertId = req.params.id as string;
        const userId = (req as AuthRequest).user?._id;
        const { targetPrice, condition } = req.body;

        const updated = await stockService.updateAlert(alertId, userId!, { targetPrice, condition });
        if (!updated) {
            return res.status(404).json({ message: "Alert not found" });
        }
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Could not update alert. Please try again.', code: 500 });
    }
};

const checkAlerts = async (req: Request, res: Response) => {
    try {
        console.log('Manual alert check triggered via API');
        await stockService.checkAlerts();
        res.status(200).json({ message: "Alert check completed" });
    } catch (err: any) {
        res.status(500).json({ message: err.message || 'Alert check failed', code: 500 });
    }
};

export default {
    search,
    getQuote,
    getHistory,
    createAlert,
    getAlerts,
    deleteAlert,
    updateAlert,
    checkAlerts
};
