import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../services/authService';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            // Create FormData if we were sending file, but here we just send JSON usually for basic registration
            // If backend expects JSON:
            await registerApi(formData as any);
            // If backend expects FormData (for image), we'd need to change this.
            // Assuming successful register -> redirect to login
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5}>
                    <Card className="shadow-lg p-4 border-0 rounded-4">
                        <Card.Body>
                            <h2 className="text-center mb-4 text-primary fw-bold">Create Account</h2>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Choose a username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        className="p-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="name@example.com"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="p-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Create a strong password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="p-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Repeat password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="p-3"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 p-3 mb-3 fw-bold" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                Already have an account? <Link to="/login" className="text-decoration-none fw-bold">Log in</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
