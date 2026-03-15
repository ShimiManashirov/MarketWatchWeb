import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { login, refreshProfile } = useAuth();
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
                // Store tokens first so the API interceptor can use them
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Fetch the real user profile and update auth state
                await refreshProfile();

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
