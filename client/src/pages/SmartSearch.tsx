import { useState, type FormEvent } from 'react';
import { Container, Form, Button, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { Search, Sparkles, TrendingUp, Cpu } from 'lucide-react';
import { smartSearch, type AIAnalysisResponse } from '../services/aiService';
import PostCard from '../components/PostCard';

const SmartSearch = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<AIAnalysisResponse | null>(null);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await smartSearch(query);
            setResult(response.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to perform smart search');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                    <Sparkles size={32} className="text-primary" />
                </div>
                <h2 className="fw-bold mb-2">AI-Powered Market Insights</h2>
                <p className="text-muted">Ask complex financial questions and get analyzed results</p>
            </div>

            <div className="mx-auto mb-5" style={{ maxWidth: '700px' }}>
                <Card className="border-0 shadow-lg rounded-pill overflow-hidden">
                    <Card.Body className="p-2">
                        <Form onSubmit={handleSearch} className="d-flex w-100">
                            <Search className="my-auto ms-3 text-muted" size={20} />
                            <Form.Control
                                type="text"
                                placeholder="E.g., 'What is the sentiment on tech stocks?'"
                                className="border-0 shadow-none bg-transparent py-2"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{ fontSize: '1.1rem' }}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="rounded-pill px-4 fw-medium my-1 me-1 hover-zoom"
                                disabled={loading || !query.trim()}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>

            {error && (
                <Alert variant="danger" className="mx-auto text-center" style={{ maxWidth: '600px' }}>
                    {error}
                </Alert>
            )}

            {result && (
                <div className="animate-fade-in">
                    {/* Insights Section */}
                    <Card className="border-0 shadow-sm rounded-4 mb-5 overflow-hidden bg-gradient-brand-subtle">
                        <div className="bg-primary p-1" style={{ opacity: 0.05, height: '5px' }}></div>
                        <Card.Body className="p-4 p-md-5">
                            <Row className="align-items-start g-4">
                                <Col md={8}>
                                    <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                                        <Cpu size={20} />
                                        <h5 className="fw-bold mb-0">AI Analysis</h5>
                                    </div>
                                    <p className="fs-5 lead text-dark mb-0" style={{ whiteSpace: 'pre-line' }}>
                                        {result.analysis}
                                    </p>
                                </Col>
                                <Col md={4} className="border-start-md border-light ps-md-4">
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-muted small uppercase fw-bold tracking-wide">
                                            <Search size={14} /> Keywords Identified
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {result.keywords.map((keyword, idx) => (
                                                <Badge key={idx} bg="light" text="dark" className="border fw-normal px-3 py-2 rounded-pill">
                                                    #{keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {result.suggestions && result.suggestions.length > 0 && (
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-muted small uppercase fw-bold tracking-wide">
                                                <TrendingUp size={14} /> Related Topics
                                            </div>
                                            <ul className="list-unstyled mb-0">
                                                {result.suggestions.map((suggestion, idx) => (
                                                    <li key={idx} className="mb-2 text-primary small d-flex align-items-center gap-2 cursor-pointer text-decoration-underline-hover">
                                                        • {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Results Grid */}
                    <div className="mb-4 d-flex align-items-center justify-content-between">
                        <h4 className="fw-bold mb-0">Relevant Posts <span className="text-muted fw-normal fs-6 ms-2">({result.resultCount})</span></h4>
                    </div>

                    {result.results.length > 0 ? (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {result.results.map(post => (
                                <Col key={post._id}>
                                    <PostCard post={post} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted">No posts found matching the analysis context.</p>
                        </div>
                    )}
                </div>
            )}
        </Container>
    );
};

export default SmartSearch;
