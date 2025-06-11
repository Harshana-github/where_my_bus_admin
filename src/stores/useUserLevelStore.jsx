import { create } from "zustand";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useUserLevelStore = create((set) => ({
  userLevels: [],
  userLevelById: {},
  error: null,

  getAllUserLevels: async () => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get("/user_level/select_all");
      set({ userLevels: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getUserLevelById: async (id) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get(`/user_level/select/${id}`);
      set({ userLevelById: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  addUserLevel: async (userLevel) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.post("/user_level/add", userLevel);
      return { isOk: true, data: resp.data.msg };
    } catch (error) {
      set({ error: error.message || "An error occurred" });
      return { isOk: false, error: error.message || "An error occurred" };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  updateUserLevel: async ({ id, userLevel }) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.put(`/user_level/update/${id}`, userLevel);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  deleteUserLevel: async (id) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.delete(`/user_level/delete/${id}`);
      return { isOk: true, data: resp.data.msg };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },
}));
