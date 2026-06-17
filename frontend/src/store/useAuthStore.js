/* eslint-disable */
import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    setUser: (userData) => set({ user: userData }),

    initializeAuth: async () => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const { data } = await api.get('/user');
                set({ user: data });
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            localStorage.removeItem('token');
        } finally {
            set({ loading: false });
        }
    },

    login: async (email, password) => {
        const { data } = await api.post('/login', { email, password });
        localStorage.setItem('token', data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        set({ user: data.user });
        return data.user;
    },

    register: async (name, email, password, password_confirmation) => {
        const { data } = await api.post('/register', { name, email, password, password_confirmation });
        localStorage.setItem('token', data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        set({ user: data.user });
        return data.user;
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            set({ user: null });
        }
    },

    refreshUser: async () => {
        const { data } = await api.get('/user');
        set({ user: data });
        return data;
    },

    // --- Global State Game/Economy Helpers ---
    addCoins: (amount) => set((state) => ({
        user: state.user ? { ...state.user, coins: state.user.coins + amount } : null
    })),

    deductCoins: (amount) => set((state) => ({
        user: state.user ? { ...state.user, coins: state.user.coins - amount } : null
    })),

    addXp: (amount) => set((state) => ({
        user: state.user ? { ...state.user, xp: state.user.xp + amount } : null
    })),
}));

export default useAuthStore;
