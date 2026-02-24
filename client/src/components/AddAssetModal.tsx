import { useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { Search, Plus } from 'lucide-react';
import { searchStocks } from '../services/stockService';
import { addToWatchlist } from '../services/watchlistService';

interface AddAssetModalProps {
    show: boolean;
    onHide: () => void;
    onAssetAdded: () => void;
}

const AddAssetModal = ({ show, onHide, onAssetAdded }: AddAssetModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        try {
            setSearching(true);
            setError('');
            const res = await searchStocks(query);
            setResults(res.data);
            if (res.data.length === 0) setError('No stocks found');
        } catch (err: any) {
            const status = err.response?.status || '';
            const msg = err.response?.data?.message || 'Search is currently unavailable';
            setError(`${msg}${status ? ` (${status})` : ''}`);
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = async (stock: any) => {
        try {
            setAdding(stock.symbol);
            await addToWatchlist(stock.symbol, stock.shortname || stock.longname || stock.symbol);
            onAssetAdded();
            handleClose();
        } catch (err: any) {
            const status = err.response?.status || '';
            const msg = err.response?.data?.message || 'Could not add asset';
            setError(`${msg}${status ? ` (${status})` : ''}`);
        } finally {
            setAdding(null);
        }
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Add Asset to Watchlist</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSearch}>
                    <div className="d-flex gap-2 mb-2">
                        <Form.Control
                            type="text"
                            placeholder="Search by symbol: AAPL, MSFT, ^DJI..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <Button variant="primary" type="submit" disabled={searching} className="d-flex align-items-center">
                            {searching ? <Spinner size="sm" animation="border" /> : <Search size={18} />}
                        </Button>
                    </div>
                    <small className="text-muted">For Israeli stocks: TASE:TEVA, TASE:PHOR</small>
                </Form>

                {error && <div className="text-danger small mt-2">{error}</div>}

                {results.length > 0 && (
                    <div className="mt-3 border rounded-3 overflow-hidden" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {results.map((stock: any) => (
                            <div
                                key={stock.symbol}
                                className="d-flex align-items-center justify-content-between p-3 border-bottom"
                            >
                                <div>
                                    <div className="fw-bold">{stock.symbol}</div>
                                    <div className="small text-muted">{stock.shortname || stock.longname || '—'}</div>
                                    {stock.exchDisp && (
                                        <div className="small text-muted">{stock.exchDisp}</div>
                                    )}
                                </div>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-pill d-flex align-items-center gap-1"
                                    onClick={() => handleAdd(stock)}
                                    disabled={adding === stock.symbol}
                                >
                                    {adding === stock.symbol ? (
                                        <Spinner size="sm" animation="border" />
                                    ) : (
                                        <>
                                            <Plus size={14} /> Add
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="light" onClick={handleClose} className="rounded-pill px-4">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddAssetModal;
