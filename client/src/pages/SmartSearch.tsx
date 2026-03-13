import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col, Spinner, Alert, Badge, Image } from 'react-bootstrap';
import { Search, Sparkles, TrendingUp, Cpu, User, MessageCircle } from 'lucide-react';
import { smartSearch, type AIAnalysisResponse, type SearchUser, type SearchComment } from '../services/aiService';
import { getImageUrl } from '../services/api';
import PostCard from '../components/PostCard';

const SmartSearch = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<AIAnalysisResponse | null>(null);
    const navigate = useNavigate();

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
            const status = err.response?.status || '';
            const msg = err.response?.data?.message || 'Search is currently unavailable';
            setError(`${msg}${status ? ` (${status})` : ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        // Auto-submit the search with the suggestion
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
        }, 100);
    };

    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                    <Sparkles size={32} className="text-primary" />
                </div>
                <h2 className="fw-bold mb-2">AI-Powered Search</h2>
                <p className="text-muted">Search across posts, users, and comments using natural language</p>
            </div>

            <div className="mx-auto mb-5" style={{ maxWidth: '700px' }}>
                <Card className="border-0 shadow-lg rounded-pill overflow-hidden">
                    <Card.Body className="p-2">
                        <Form onSubmit={handleSearch} className="d-flex w-100">
                            <Search className="my-auto ms-3 text-muted" size={20} />
                            <Form.Control
                                type="text"
                                placeholder="Try 'posts about crypto', 'find user shimi', 'comments on stocks'..."
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
                    {/* AI Analysis Section */}
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
                                            <Search size={14} /> Keywords
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
                                                <TrendingUp size={14} /> Try Also
                                            </div>
                                            <ul className="list-unstyled mb-0">
                                                {result.suggestions.map((suggestion, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="mb-2 text-primary small d-flex align-items-center gap-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                    >
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

                    {/* Results Summary */}
                    <div className="mb-4 d-flex align-items-center justify-content-between">
                        <h4 className="fw-bold mb-0">
                            Results <span className="text-muted fw-normal fs-6 ms-2">({result.resultCount} found)</span>
                        </h4>
                    </div>

                    {/* Posts Results */}
                    {result.results.posts && result.results.posts.length > 0 && (
                        <div className="mb-5">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <TrendingUp size={20} className="text-primary" /> Posts
                                <Badge bg="primary" className="rounded-pill">{result.results.posts.length}</Badge>
                            </h5>
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {result.results.posts.map(post => (
                                    <Col key={post._id}>
                                        <PostCard post={post} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {/* Users Results */}
                    {result.results.users && result.results.users.length > 0 && (
                        <div className="mb-5">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <User size={20} className="text-success" /> Users
                                <Badge bg="success" className="rounded-pill">{result.results.users.length}</Badge>
                            </h5>
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {result.results.users.map((user: SearchUser) => (
                                    <Col key={user._id}>
                                        <Card
                                            className="border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition-all h-100"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/profile/${user._id}`)}
                                        >
                                            <Card.Body className="d-flex align-items-center gap-3 p-3">
                                                {user.image ? (
                                                    <Image
                                                        src={getImageUrl(user.image)}
                                                        roundedCircle
                                                        width={50}
                                                        height={50}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                        <User size={24} className="text-muted" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h6 className="fw-bold mb-0">{user.username}</h6>
                                                    <small className="text-muted">Joined {new Date(user.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {/* Comments Results */}
                    {result.results.comments && result.results.comments.length > 0 && (
                        <div className="mb-5">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <MessageCircle size={20} className="text-info" /> Comments
                                <Badge bg="info" className="rounded-pill">{result.results.comments.length}</Badge>
                            </h5>
                            <div className="d-flex flex-column gap-3">
                                {result.results.comments.map((comment: SearchComment) => (
                                    <Card
                                        key={comment._id}
                                        className="border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition-all"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/post/${comment.post?._id}`)}
                                    >
                                        <Card.Body className="p-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                {comment.owner?.image ? (
                                                    <Image
                                                        src={getImageUrl(comment.owner.image)}
                                                        roundedCircle
                                                        width={30}
                                                        height={30}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                                                        <User size={14} className="text-muted" />
                                                    </div>
                                                )}
                                                <span className="fw-bold small">{comment.owner?.username || 'Unknown'}</span>
                                                <span className="text-muted small">on</span>
                                                <span className="text-primary small fw-medium">{comment.post?.title || 'a post'}</span>
                                            </div>
                                            <p className="mb-0 text-dark">{comment.content}</p>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {result.resultCount === 0 && (
                        <div className="text-center py-5">
                            <p className="text-muted">No results found. Try a different search query.</p>
                        </div>
                    )}
                </div>
            )}
        </Container>
    );
};

export default SmartSearch;
