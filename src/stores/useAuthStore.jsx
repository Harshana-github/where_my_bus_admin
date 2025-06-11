import { create } from 'zustand';
import customFetch from "../utils/axios";
import {
    addUserToLocalStorage,
    getUserFromLocalStorage,
    removeUserFromLocalStorage,
} from "../utils/local-storage";
import { useUIStore } from './useUIStore';

export const useAuthStore = create((set) => ({
    user: getUserFromLocalStorage(),
    error: null,

    loginUser: async (user) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
            const resp = await customFetch.post("/auth/login", user);
            if (!resp.data || resp.data.id === 0) throw new Error("Custom Error Message");
            set({ user: resp.data.user });
            addUserToLocalStorage({ ...resp.data.user, token: resp.data.token.original.access_token });
            return { isOk: true, data: resp.data };
        } catch (error) {
            set({ error: error.response?.data?.msg || "An error occurred" });
            return { isOk: false, error: error.response?.data?.msg || "An error occurred" };
        } finally {
            useUIStore.getState().setLoading(false);
        }
    },

    getAuthUser: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
            const resp = await customFetch.get("/me");
            if (!resp.data || resp.data.id === 0) throw new Error("Custom Error Message");
            set({ user: resp.data });
            return { isOk: true, data: resp.data };
        } catch (error) {
            set({ error: error.response?.data?.msg || "An error occurred" });
            return { isOk: false, error: error.response?.data?.msg || "An error occurred" };
        } finally {
            useUIStore.getState().setLoading(false);
        }
    },

    logoutUser: () => {
        set({ user: null, error: null });
        removeUserFromLocalStorage();
    },
}));