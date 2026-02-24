import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { TrendingUp, TrendingDown, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from '../services/watchlistService';
import AddAssetModal from '../components/AddAssetModal';

const Watchlist = () => {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchWatchlist = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getWatchlist();
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch watchlist', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const handleRemove = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol);
            setItems(prev => prev.filter(i => i.symbol !== symbol));
        } catch (err) {
            console.error('Failed to remove', err);
        }
    };

    const handleAssetAdded = () => {
        setShowAddModal(false);
        fetchWatchlist();
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return '—';
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const formatChange = (change: number | null, percent: number | null) => {
        if (change === null || percent === null) return '—';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <Container className="py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <TrendingUp className="text-primary" size={28} />
                        Watchlist
                    </h2>
                    <p className="text-muted mb-0">Track your favorite stocks and indices</p>
                </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 mb-4">
                <Button
                    variant="primary"
                    className="d-flex align-items-center gap-2 rounded-pill px-4"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={18} /> Add Asset
                </Button>
                {items.length > 0 && (
                    <Button
                        variant="outline-secondary"
                        className="d-flex align-items-center gap-2 rounded-pill px-3"
                        onClick={() => fetchWatchlist(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh All'}
                    </Button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3">Loading watchlist...</p>
                </div>
            ) : items.length === 0 ? (
                /* Empty State */
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                    <Card.Body className="py-5">
                        <TrendingUp size={56} className="text-muted mb-3" />
                        <h4 className="fw-bold text-muted">Your watchlist is empty</h4>
                        <p className="text-muted mb-4">
                            Add stocks or indices to start tracking the market.
                        </p>
                        <Button
                            variant="primary"
                            className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={18} /> Add Your First Asset
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                /* Asset Cards */
                <Row xs={1} md={2} lg={3} className="g-3">
                    {items.map(item => {
                        const isUp = (item.change ?? 0) >= 0;
                        return (
                            <Col key={item._id}>
                                <Card className="border-0 shadow-sm rounded-4 h-100 stock-card">
                                    <Card.Body className="p-4">
                                        <div className="d-flex align-items-start justify-content-between mb-3">
                                            <div>
                                                <h5 className="fw-bold mb-1">{item.symbol}</h5>
                                                <span className="text-muted small">{item.name}</span>
                                            </div>
                                            <Button
                                                variant="link"
                                                className="text-muted p-0"
                                                onClick={() => handleRemove(item.symbol)}
                                                title="Remove from watchlist"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>

                                        <div className="mb-2">
                                            <span className="fs-4 fw-bold">
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        <div className={`d-flex align-items-center gap-1 ${isUp ? 'trend-up' : 'trend-down'}`}>
                                            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            <span className="fw-medium small">
                                                {formatChange(item.change, item.changePercent)}
                                            </span>
                                        </div>

                                        {item.lastUpdate && (
                                            <div className="text-muted mt-3" style={{ fontSize: '0.75rem' }}>
                                                Last Update: {formatTime(item.lastUpdate)}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Add Asset Modal */}
            <AddAssetModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onAssetAdded={handleAssetAdded}
            />
        </Container>
    );
};

export default Watchlist;
