import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';
import api from '../services/api';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const processed = useRef(false);

    useEffect(() => {
        // Prevent double-processing in React StrictMode
        if (processed.current) return;
        processed.current = true;

        const processAuth = async () => {
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');

            if (accessToken && refreshToken) {
                // Store tokens so the API interceptor can use them
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                try {
                    // Fetch the real user profile
                    const res = await api.get('/user/profile');
                    login(res.data, accessToken, refreshToken);
                } catch (err) {
                    console.error('Failed to fetch profile after OAuth:', err);
                    // Login with minimal data — the app will retry on next load
                    login({ _id: '', username: 'User', email: '' }, accessToken, refreshToken);
                }

                navigate('/', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        };

        processAuth();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3">Signing you in...</p>
            </div>
        </Container>
    );
};

export default AuthSuccess;
