import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { Bell, Trash2, Edit2, TrendingUp, TrendingDown, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import {
    getAlerts, createAlert, deleteAlert, updateAlert, searchStocks, getStockQuote,
    type StockAlert, type StockQuote
} from '../services/stockService';
import { API_URL } from '../services/api';

const Alerts = () => {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [loading, setLoading] = useState(true);

    // Create / Edit alert modal
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState<StockAlert | null>(null);
    const [alertSymbol, setAlertSymbol] = useState('');
    const [alertPrice, setAlertPrice] = useState('');
    const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
    const [savingAlert, setSavingAlert] = useState(false);
    const [currentQuote, setCurrentQuote] = useState<StockQuote | null>(null);

    // Stock search within modal
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedStock, setSelectedStock] = useState<any>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAlerts();
            setAlerts(res.data);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const activeAlerts = alerts.filter(a => !a.isTriggered);
    const triggeredAlerts = alerts.filter(a => a.isTriggered);

    const openCreateModal = () => {
        setEditingAlert(null);
        setAlertSymbol('');
        setAlertPrice('');
        setAlertCondition('ABOVE');
        setCurrentQuote(null);
        setSelectedStock(null);
        setSearchQuery('');
        setSearchResults([]);
        setShowModal(true);
    };

    const openEditModal = (alert: StockAlert) => {
        setEditingAlert(alert);
        setAlertSymbol(alert.symbol);
        setAlertPrice(alert.targetPrice.toString());
        setAlertCondition(alert.condition);
        setSelectedStock({ symbol: alert.symbol });
        setSearchQuery('');
        setSearchResults([]);
        setShowModal(true);

        // Fetch current price
        getStockQuote(alert.symbol)
            .then(res => setCurrentQuote(res.data))
            .catch(() => { });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            setSearching(true);
            const res = await searchStocks(searchQuery);
            setSearchResults(res.data);
        } catch {
            // ignore
        } finally {
            setSearching(false);
        }
    };

    const selectStock = async (stock: any) => {
        setSelectedStock(stock);
        setAlertSymbol(stock.symbol);
        setSearchResults([]);
        setSearchQuery('');

        try {
            const res = await getStockQuote(stock.symbol);
            setCurrentQuote(res.data);
            setAlertPrice(res.data.regularMarketPrice.toString());
        } catch {
            // ignore
        }
    };

    const handleSaveAlert = async () => {
        if (!alertPrice || isNaN(Number(alertPrice)) || !alertSymbol) return;

        try {
            setSavingAlert(true);
            if (editingAlert) {
                await updateAlert(editingAlert._id, {
                    targetPrice: Number(alertPrice),
                    condition: alertCondition
                });
            } else {
                await createAlert(alertSymbol, Number(alertPrice), alertCondition);
            }
            setShowModal(false);
            fetchAlerts();
        } catch (err) {
            console.error('Failed to save alert', err);
        } finally {
            setSavingAlert(false);
        }
    };

    const handleTriggerCheck = async () => {
        try {
            setLoading(true);
            await fetch(`${API_URL}/stocks/check-alerts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            await fetchAlerts();
        } catch (err) {
            console.error('Failed to trigger check', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAlert = async (id: string) => {
        try {
            await deleteAlert(id);
            setAlerts(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            console.error('Failed to delete alert', err);
        }
    };

    return (
        <Container className="py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <Bell className="text-warning" size={28} />
                        Price Alerts
                    </h2>
                    <p className="text-muted mb-0">Get notified when stocks hit your target price</p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        className="d-flex align-items-center gap-2 rounded-pill px-3"
                        onClick={handleTriggerCheck}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
                        Refresh Status
                    </Button>
                    <Button
                        variant="primary"
                        className="d-flex align-items-center gap-2 rounded-pill px-4"
                        onClick={openCreateModal}
                    >
                        <Plus size={18} /> New Alert
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                    <Card className="border-0 shadow-sm rounded-4 text-center py-3">
                        <Card.Body className="py-2">
                            <div className="fs-2 fw-bold text-primary">{activeAlerts.length}</div>
                            <div className="small text-muted">Active Alerts</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3}>
                    <Card className="border-0 shadow-sm rounded-4 text-center py-3">
                        <Card.Body className="py-2">
                            <div className="fs-2 fw-bold text-secondary">{triggeredAlerts.length}</div>
                            <div className="small text-muted">Triggered</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Content */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3">Loading alerts...</p>
                </div>
            ) : alerts.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                    <Card.Body className="py-5">
                        <AlertCircle size={56} className="text-muted mb-3" />
                        <h4 className="fw-bold text-muted">No alerts set</h4>
                        <p className="text-muted mb-4">
                            Create a price alert to get notified when a stock reaches your target.
                        </p>
                        <Button
                            variant="primary"
                            className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                            onClick={openCreateModal}
                        >
                            <Plus size={18} /> Create First Alert
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {/* Active Alerts */}
                    {activeAlerts.length > 0 && (
                        <>
                            <h5 className="fw-bold text-muted mb-2">Active</h5>
                            {activeAlerts.map(alert => (
                                <Card key={alert._id} className="border-0 shadow-sm rounded-4 alert-card">
                                    <Card.Body className="d-flex align-items-center justify-content-between p-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`p-2 rounded-3 ${alert.condition === 'ABOVE' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                                                {alert.condition === 'ABOVE'
                                                    ? <TrendingUp size={20} className="text-success" />
                                                    : <TrendingDown size={20} className="text-danger" />
                                                }
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <Badge bg="dark" className="rounded-pill">{alert.symbol}</Badge>
                                                    <span className="small text-muted">
                                                        {alert.condition === 'ABOVE' ? 'Above' : 'Below'}
                                                    </span>
                                                </div>
                                                <div className="fw-bold fs-5">
                                                    ${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-3 d-flex align-items-center justify-content-center border-0 shadow-sm"
                                                style={{ width: '40px', height: '40px', backgroundColor: '#0d6efd' }}
                                                onClick={() => openEditModal(alert)}
                                                title="Edit alert"
                                            >
                                                <Edit2 size={20} color="white" strokeWidth={2.5} />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="rounded-3 d-flex align-items-center justify-content-center border-0 shadow-sm"
                                                style={{ width: '40px', height: '40px', backgroundColor: '#dc3545' }}
                                                onClick={() => handleDeleteAlert(alert._id)}
                                                title="Delete alert"
                                            >
                                                <Trash2 size={20} color="white" strokeWidth={2.5} />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </>
                    )}

                    {/* Triggered Alerts */}
                    {triggeredAlerts.length > 0 && (
                        <>
                            <h5 className="fw-bold text-muted mb-2 mt-3">Triggered</h5>
                            {triggeredAlerts.map(alert => (
                                <Card key={alert._id} className="border-0 shadow-sm rounded-4 opacity-75">
                                    <Card.Body className="d-flex align-items-center justify-content-between p-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-2 rounded-3 bg-light">
                                                <Bell size={20} className="text-muted" />
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <Badge bg="secondary" className="rounded-pill">{alert.symbol}</Badge>
                                                    <Badge bg="success" className="rounded-pill">Triggered</Badge>
                                                </div>
                                                <div className="fw-medium">
                                                    ${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="rounded-3 d-flex align-items-center justify-content-center border-0"
                                            style={{ width: '40px', height: '40px', opacity: 0.8 }}
                                            onClick={() => handleDeleteAlert(alert._id)}
                                        >
                                            <Trash2 size={20} color="white" strokeWidth={2.5} />
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Create / Edit Alert Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                        {editingAlert ? `Edit Alert — ${editingAlert.symbol}` : 'New Price Alert'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    {/* Stock search (only for new alerts) */}
                    {!editingAlert && !selectedStock && (
                        <div className="mb-4">
                            <Form.Label className="fw-medium">Search Stock</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    placeholder="AAPL, MSFT, ^DJI..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button variant="primary" onClick={handleSearch} disabled={searching}>
                                    {searching ? <Spinner size="sm" animation="border" /> : 'Search'}
                                </Button>
                            </div>
                            <small className="text-muted">For Israeli stocks: TASE:TEVA, TASE:PHOR</small>

                            {searchResults.length > 0 && (
                                <div className="mt-2 border rounded-3 overflow-hidden" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {searchResults.map((stock: any) => (
                                        <div
                                            key={stock.symbol}
                                            className="d-flex align-items-center justify-content-between p-3 border-bottom hover-bg"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => selectStock(stock)}
                                        >
                                            <div>
                                                <div className="fw-bold">{stock.symbol}</div>
                                                <div className="small text-muted">{stock.shortname || stock.longname}</div>
                                            </div>
                                            <Plus size={16} className="text-primary" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selected stock info */}
                    {(selectedStock || editingAlert) && (
                        <>
                            <div className="d-flex align-items-center gap-2 mb-3 p-3 bg-light rounded-3">
                                <Badge bg="dark" className="rounded-pill fs-6">{alertSymbol}</Badge>
                                {!editingAlert && (
                                    <Button variant="link" size="sm" className="ms-auto p-0" onClick={() => setSelectedStock(null)}>
                                        Change
                                    </Button>
                                )}
                            </div>

                            {currentQuote && (
                                <div className="mb-3 p-3 bg-light rounded-3">
                                    <small className="text-muted">Current Price</small>
                                    <div className="fw-bold fs-5">${currentQuote.regularMarketPrice}</div>
                                </div>
                            )}

                            {/* Condition */}
                            <Form.Label className="fw-medium">Condition</Form.Label>
                            <div className="d-flex gap-2 mb-3">
                                <Button
                                    variant={alertCondition === 'ABOVE' ? 'success' : 'outline-secondary'}
                                    onClick={() => setAlertCondition('ABOVE')}
                                    className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                >
                                    <TrendingUp size={18} /> Goes Above
                                </Button>
                                <Button
                                    variant={alertCondition === 'BELOW' ? 'danger' : 'outline-secondary'}
                                    onClick={() => setAlertCondition('BELOW')}
                                    className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                >
                                    <TrendingDown size={18} /> Goes Below
                                </Button>
                            </div>

                            {/* Target Price */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-medium">Target Price ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={alertPrice}
                                    onChange={(e) => setAlertPrice(e.target.value)}
                                    step="0.01"
                                    placeholder="Enter target price"
                                    size="lg"
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveAlert}
                        disabled={savingAlert || !alertSymbol || !alertPrice}
                        className="rounded-pill px-4"
                    >
                        {savingAlert ? <Spinner size="sm" animation="border" /> : (editingAlert ? 'Update Alert' : 'Create Alert')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Alerts;
