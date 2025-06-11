import { create } from "zustand";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useTownStore = create((set) => ({
  towns: [],
  townById: {},
  error: null,

  getAllTowns: async () => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get("/towns");
      set({ towns: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getTownById: async (townId) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get(`/towns/${townId}`);
      set({ townById: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  addTown: async (town) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.post("/towns", town);
      return { isOk: true, data: resp.data };
    } catch (error) {
      set({ error: error.message || "An error occurred" });
      return { isOk: false, error: error.message || "An error occurred" };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  updateTown: async ({ id, town }) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.put(`/towns/${id}`, town);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  deleteTown: async (id) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.delete(`/towns/${id}`);
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
