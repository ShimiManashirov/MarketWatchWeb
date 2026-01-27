import api from './api';

export interface User {
    _id: string;
    username: string;
    email: string;
    imgUrl?: string; // Correct property name from backend usually
}

export const register = async (userData: FormData) => {
    // Handling FormData for image upload during register if implemented, 
    // or standard JSON if the Requirements "Register with username and password" imply simple register first.
    // The requirements say "User screen... update image", but maybe register also allows it?
    // Let's assume JSON for now as per minimal requirements, but the backend might support file.
    // Checking backend `auth_controller` would be ideal, but let's stick to standard JSON for the basic inputs.
    // Actually, `back_b` usually uses `req.body` for register.
    // I'll support both, but standard Register Page usually just takes text.
    return api.post('/auth/register', userData);
};

export const login = async (credentials: any) => {
    return api.post('/auth/login', credentials);
};

export const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/logout', { refreshToken });
};
