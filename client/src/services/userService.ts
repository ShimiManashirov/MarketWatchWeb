import api from './api';
import { type User } from './authService';

export const updateProfile = async (userData: FormData) => {
    return api.put<User>('/user/profile', userData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
