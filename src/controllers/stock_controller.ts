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

const createAlert = async (req: Request, res: Response) => {
    try {
        const { symbol, targetPrice, condition } = req.body;
        const userId = (req as AuthRequest).user?._id;

        if (!symbol || !targetPrice || !condition) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const alert = await stockService.createAlert(userId!, symbol, targetPrice, condition);
        res.status(201).json(alert);
    } catch (err) {
        res.status(500).json({ message: 'Could not create alert. Please try again.', code: 500 });
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

export default {
    search,
    getQuote,
    createAlert,
    getAlerts,
    deleteAlert,
    updateAlert
};
