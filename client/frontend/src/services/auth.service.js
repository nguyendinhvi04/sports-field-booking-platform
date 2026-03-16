import api from '../api/axios';

export const authService = {
    login(email, password) {
        return api.post('/auth/login', { email, password });
    },

    register(userData) {
        // userData bao gồm: fullName, email, password, phone, role
        return api.post('/auth/register', userData);
    },

    forgotPassword(email) {
        return api.post('/auth/forgot-password', { email });
    },

    resetPassword(token, newPassword, confirmPassword) {
        return api.post('/auth/reset-password', { token, newPassword, confirmPassword });
    },

    loginWithFacebook(accessToken, role) {
        return api.post('/auth/facebook', { accessToken, role });
    },

    loginWithGoogle(idToken, role) {
        return api.post('/auth/google', { idToken, role });
    }
};
