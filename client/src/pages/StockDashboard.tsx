import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { Search, Bell, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { searchStocks, getAlerts, createAlert, deleteAlert, getStockQuote, type StockQuote, type StockAlert } from '../services/stockService';

const StockDashboard = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Watchlist is basically just alerts in our simplified version, but we can call it "Watched Stocks"
    // For now, let's focus on Alerts as the primary feature.
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(false);

    // Selected Stock for Alert Modal
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [alertPrice, setAlertPrice] = useState('');
    const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
    const [settingAlert, setSettingAlert] = useState(false);
    const [currentQuote, setCurrentQuote] = useState<StockQuote | null>(null);

    const [error, setError] = useState('');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoadingAlerts(true);
            const res = await getAlerts();
            setAlerts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            setSearching(true);
            setError('');
            const res = await searchStocks(query);
            setSearchResults(res.data);
            if (res.data.length === 0) setError('No stocks found');
        } catch (err) {
            setError('Failed to search stocks');
        } finally {
            setSearching(false);
        }
    };

    const openAlertModal = async (stock: any) => {
        setSelectedStock(stock);
        setShowModal(true);
        setCurrentQuote(null); // Reset
        setAlertPrice('');

        // Fetch current price to help user
        try {
            const res = await getStockQuote(stock.symbol);
            setCurrentQuote(res.data);
            setAlertPrice(res.data.regularMarketPrice.toString());
        } catch (err) {
            // Ignore if fails
        }
    };

    const handleCreateAlert = async () => {
        if (!alertPrice || isNaN(Number(alertPrice))) return;

        try {
            setSettingAlert(true);
            await createAlert(selectedStock.symbol, Number(alertPrice), alertCondition);
            setShowModal(false);
            setQuery(''); // Clear search
            setSearchResults([]);
            fetchAlerts(); // Refresh list
        } catch (err) {
            setError('Failed to create alert');
        } finally {
            setSettingAlert(false);
        }
    };

    const handleDeleteAlert = async (id: string) => {
        try {
            await deleteAlert(id);
            setAlerts(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4 d-flex align-items-center gap-2">
                <TrendingUp className="text-primary" /> Stock Dashboard
            </h2>

            <Row>
                <Col md={7} className="mb-4">
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body>
                            <Card.Title className="mb-3">Find Stocks</Card.Title>
                            <Form onSubmit={handleSearch} className="mb-3">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by symbol (e.g. AAPL, TSLA)..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="rounded-start-pill"
                                    />
                                    <Button variant="primary" type="submit" className="rounded-end-pill px-4">
                                        <Search size={20} />
                                    </Button>
                                </InputGroup>
                            </Form>

                            {searching && <Spinner animation="border" size="sm" className="mb-3" />}
                            {error && <Alert variant="danger">{error}</Alert>}

                            <ListGroup variant="flush">
                                {searchResults.map((stock) => (
                                    <ListGroup.Item key={stock.symbol} className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="fw-bold">{stock.symbol}</div>
                                            <div className="small text-muted">{stock.shortname || stock.longname}</div>
                                        </div>
                                        <Button variant="outline-primary" size="sm" onClick={() => openAlertModal(stock)} className="rounded-pill">
                                            <Bell size={16} className="me-1" /> Set Alert
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body>
                            <Card.Title className="mb-3 d-flex align-items-center gap-2">
                                <Bell className="text-warning" /> Your Alerts
                            </Card.Title>

                            {loadingAlerts ? (
                                <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                            ) : alerts.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <p>No active alerts.</p>
                                    <small>Search for a stock to set a price alert.</small>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {alerts.map(alert => (
                                        <ListGroup.Item key={alert._id} className="d-flex align-items-center justify-content-between p-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Badge bg="dark">{alert.symbol}</Badge>
                                                    <span className="small text-muted">{new Date().toLocaleDateString()}</span>
                                                </div>
                                                <div className="mt-1 fw-medium">
                                                    Target: {alert.condition === 'ABOVE' ? '≥' : '≤'} ${alert.targetPrice}
                                                </div>
                                            </div>
                                            <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteAlert(alert._id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Alert Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>Set Alert for {selectedStock?.symbol}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentQuote && (
                        <Alert variant="info" className="mb-3">
                            Current Price: <strong>${currentQuote.regularMarketPrice}</strong>
                        </Alert>
                    )}
                    <Form.Label>Condition</Form.Label>
                    <div className="d-flex gap-2 mb-3">
                        <Button
                            variant={alertCondition === 'ABOVE' ? 'primary' : 'outline-secondary'}
                            onClick={() => setAlertCondition('ABOVE')}
                            className="flex-grow-1"
                        >
                            <TrendingUp size={18} className="me-2" />
                            Goes Above
                        </Button>
                        <Button
                            variant={alertCondition === 'BELOW' ? 'danger' : 'outline-secondary'}
                            onClick={() => setAlertCondition('BELOW')}
                            className="flex-grow-1"
                        >
                            <TrendingDown size={18} className="me-2" />
                            Goes Below
                        </Button>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Target Price ($)</Form.Label>
                        <Form.Control
                            type="number"
                            value={alertPrice}
                            onChange={(e) => setAlertPrice(e.target.value)}
                            step="0.01"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateAlert} disabled={settingAlert}>
                        {settingAlert ? 'Saving...' : 'Set Alert'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StockDashboard;
