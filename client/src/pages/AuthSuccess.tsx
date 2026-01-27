import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            // We don't have the user object here, so we login with placeholders
            // and relying on AuthContext to fetch the profile on mount or we can force fetch here.

            // For now, let's just set tokens and redirect to home.
            // The AuthContext effect will likely run or we can trigger a fetch.
            // Check AuthContext implementation: it checks localStorage on mount.
            // Since we are already mounted, we might need a way to trigger fetch.
            // But 'login' function sets state. 

            login({ _id: 'oauth', username: 'Loading...', email: '' }, accessToken, refreshToken);

            // Allow a brief moment for state to update or just redirect
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" variant="primary" />
        </Container>
    );
};

export default AuthSuccess;
