import { useState, useEffect } from 'react';
import { Card, ButtonGroup, Button, Spinner, Form } from 'react-bootstrap';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getHistoricalData, getStockQuote, type StockQuote } from '../services/stockService';

const TIME_RANGES = [
    { label: '1W', value: '1w' },
    { label: '1M', value: '1m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' }
];

// Predefined popular stocks for the dropdown
const POPULAR_STOCKS = [
    { symbol: 'SPY', name: 'S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'Nvidia Corp.' },
];

const StockChart = () => {
    const [symbol, setSymbol] = useState('SPY');
    const [range, setRange] = useState('1m');
    const [data, setData] = useState<any[]>([]);
    const [quote, setQuote] = useState<StockQuote | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, range]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch quote and history in parallel
            const [historyRes, quoteRes] = await Promise.all([
                getHistoricalData(symbol, range),
                getStockQuote(symbol)
            ]);

            // Format data for Recharts
            const formattedData = historyRes.data.map((item: any) => ({
                date: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                fullDate: new Date(item.date).toLocaleDateString(),
                price: parseFloat(item.close.toFixed(2))
            }));

            setData(formattedData);
            setQuote(quoteRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate price change across the selected period
    const startPrice = data.length > 0 ? data[0].price : 0;
    const currentPrice = quote?.regularMarketPrice || (data.length > 0 ? data[data.length - 1].price : 0);
    const priceChange = currentPrice - startPrice;
    const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;
    const isPositive = priceChange >= 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="fw-bold mb-1">{payload[0].payload.fullDate}</p>
                    <p className="mb-0 fs-5" style={{ color: '#0d6efd' }}>
                        ${payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <Form.Select
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="w-auto fw-bold py-2 shadow-none bg-light border-0 rounded-pill px-4"
                            style={{ minWidth: '150px' }}
                        >
                            {POPULAR_STOCKS.map(s => (
                                <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
                            ))}
                        </Form.Select>

                        {quote && !loading && (
                            <div className="d-flex align-items-center gap-2">
                                <span className="fs-4 fw-bold">${currentPrice.toFixed(2)}</span>
                                <span className={`fw-medium d-flex align-items-center ${isPositive ? 'text-success' : 'text-danger'}`}>
                                    {isPositive ? <TrendingUp size={18} className="me-1" /> : <TrendingDown size={18} className="me-1" />}
                                    {Math.abs(percentChange).toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>

                    <ButtonGroup className="shadow-sm rounded-pill overflow-hidden">
                        {TIME_RANGES.map(t => (
                            <Button
                                key={t.value}
                                variant={range === t.value ? "primary" : "white"}
                                onClick={() => setRange(t.value)}
                                className={`px-3 py-1 border-0 ${range !== t.value ? 'text-muted' : ''}`}
                            >
                                {t.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : error ? (
                    <div className="d-flex justify-content-center align-items-center text-danger" style={{ height: '300px' }}>
                        {error}
                    </div>
                ) : (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#198754" : "#dc3545"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? "#198754" : "#dc3545"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#6c757d', fontSize: 12 }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                    tick={{ fill: '#6c757d', fontSize: 12 }}
                                    width={60}
                                    orientation="right"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isPositive ? "#198754" : "#dc3545"}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default StockChart;
