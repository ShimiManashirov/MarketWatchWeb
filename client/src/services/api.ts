import axios from 'axios';

// Use environment variable or fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    // Normalize Windows backslashes to forward slashes, then strip 'src/' prefix
    // Multer on Windows stores paths like 'src\uploads\file.png'
    const normalized = path.replace(/\\/g, '/').replace(/^src\//, '');
    return `${API_URL}/${normalized.startsWith('/') ? normalized.slice(1) : normalized}`;
};

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies/sessions if used
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        // Or from memory if we want to be stricter, but localStorage is common for persistence 
        // The requirements say "Application should remember connected user". 
        // Using localStorage for the accessToken is a simple way to achieve this, 
        // or we use a refresh token to get a new access token on load.

        // Let's stick to: Access Token in headers.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Convert 403 to 401 if backend sends 403 for expired tokens (common express issue), 
        // but usually it's 401. Let's check both or just 401.
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // No refresh token, logout
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                if (response.status === 200) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
