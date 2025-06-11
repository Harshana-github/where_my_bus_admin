import { create } from "zustand";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useBusStore = create((set) => ({
  buses: [],
  busById: {},
  error: null,

  getAllBuses: async () => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get("/buses");
      set({ buses: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getBusById: async (busId) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get(`/buses/${busId}`);
      set({ busById: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  addBus: async (bus) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.post("/buses", bus);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  updateBus: async ({ id, bus }) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.put(`/buses/${id}`, bus);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  deleteBus: async (id) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.delete(`/buses/${id}`);
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
