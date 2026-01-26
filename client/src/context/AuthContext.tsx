import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../services/authService';
import api from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedAccessToken = localStorage.getItem('accessToken');

        if (storedAccessToken) {
            // We could fetch the user profile here using the token
            // Let's assume there is a /user/profile endpoint (The user routes showed /user/profile)
            api.get('/user/profile')
                .then(res => {
                    setUser(res.data);
                })
                .catch(() => {
                    // Token invalid?
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (userData: User, accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
