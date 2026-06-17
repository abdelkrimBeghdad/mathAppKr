import { createContext, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

// We keep the AuthContext for backwards compatibility during migration, 
// but it just proxies the Zustand store.
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const initializeAuth = useAuthStore(state => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

// Any component using `useAuth()` will transparently use the new 
// Zustand store, saving us from rewriting dozens of files instantly.
export const useAuth = () => {
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);
    const login = useAuthStore(state => state.login);
    const register = useAuthStore(state => state.register);
    const logout = useAuthStore(state => state.logout);
    const refreshUser = useAuthStore(state => state.refreshUser);
    const setUser = useAuthStore(state => state.setUser);

    return { user, loading, login, register, logout, refreshUser, setUser };
};
