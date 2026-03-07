import api from './api';
import { type User } from './authService';

export const updateProfile = async (userData: FormData) => {
    return api.put<User>('/user/update', userData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
