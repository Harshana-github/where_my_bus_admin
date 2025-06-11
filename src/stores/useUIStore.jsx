import { create } from 'zustand';

export const useUIStore = create((set) => ({
    isLoading: false,
    modal: null,
    notification: null,
    pageTitle: '',
    language: localStorage.getItem('language') || 'ja',
    languages: [
        { id: 'en', name: 'English' },
        { id: 'ja', name: '日本語' },
    ],

    setLoading: (isLoading) => set({ isLoading }),
    setLanguage: (language) => {
        localStorage.setItem('language', language);
        set({ language });
    },
    openModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: null }),
    showNotification: (notification) => set({ notification }),
    clearNotification: () => set({ notification: null }),
    setPageTitle: (title) => set({ pageTitle: title }),
    resetUI: () => set({
        isLoading: false,
        modal: null,
        notification: null,
        pageTitle: '',
    }),
}));