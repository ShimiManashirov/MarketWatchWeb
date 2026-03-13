import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';
import { API_URL } from '../services/api';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Where to redirect after login (default: home)
    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginApi({ username, password });
            const { accessToken, refreshToken, user } = response.data;

            login(user || { username, _id: 'temp' }, accessToken, refreshToken);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow-lg p-4 border-0 rounded-4">
                        <Card.Body>
                            <h2 className="text-center mb-4 text-primary fw-bold">MarketWatch</h2>
                            <h5 className="text-center mb-4 text-muted">Welcome Back</h5>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                        required
                                        className="p-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        required
                                        className="p-3"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 p-3 mb-3 fw-bold" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Sign In'}
                                </Button>
                            </Form>

                            <div className="text-center mb-3">
                                <span className="text-muted">OR</span>
                            </div>

                            <Button
                                variant="light"
                                className="w-100 p-2 mb-3 d-flex align-items-center justify-content-center gap-2 border shadow-sm rounded-pill"
                                style={{ backgroundColor: '#fff', color: '#757575', fontWeight: '500' }}
                                onClick={handleGoogleLogin}
                            >
                                <svg width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    <path fill="none" d="M0 0h48v48H0z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="text-center mt-3">
                                Don't have an account? <Link to="/register" className="text-decoration-none fw-bold">Sign up</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;

