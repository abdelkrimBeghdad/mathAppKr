/* eslint-disable */
import { create } from 'zustand';
import api, { primeCsrfCookie } from '../api/axios';

// Cookie-session auth: there is no client-readable token anymore, so
// "is the user logged in" can only be answered by asking the server
// (GET /user succeeds if the session cookie is valid, 401s otherwise).
const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    setUser: (userData) => set({ user: userData }),

    initializeAuth: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/user');
            set({ user: data });
        } catch (error) {
            // No valid session — this is the normal "not logged in" case,
            // not necessarily an error worth logging.
            set({ user: null });
        } finally {
            set({ loading: false });
        }
    },

    login: async (email, password) => {
        await primeCsrfCookie();
        const { data } = await api.post('/login', { email, password });
        set({ user: data.user });
        return data.user;
    },

    register: async (name, email, password, password_confirmation) => {
        await primeCsrfCookie();
        const { data } = await api.post('/register', { name, email, password, password_confirmation });
        set({ user: data.user });
        return data.user;
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } finally {
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
