import { create } from "zustand";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useUserStore = create((set) => ({
  users: [],
  usersActive: [],
  userById: {},
  userModules: [],
  error: null,

  addUser: async (user) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.post("/user/add", user);
      return { isOk: true, data: resp.data.msg };
    } catch (error) {
      set({ error: error.message || "An error occurred" });
      return { isOk: false, error: error.message || "An error occurred" };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  updateUser: async ({ id, user }) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.put(`/user/update/${id}`, user);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  deleteUser: async (userId) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.delete(`/user/delete/${userId}`);
      return { isOk: true, data: resp.data.msg };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getAllUsers: async () => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get("/user/select_all");
      set({ users: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getActiveUsers: async () => {
    set({ error: null });
    try {
      const resp = await customFetch.get("/user/select_all_active");
      set({ usersActive: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
    }
  },

  getUserById: async (userId) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get(`/user/select/${userId}`);
      set({ userById: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getUserModules: async () => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get("/user_module/select_all");
      set({ userModules: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },
}));
