import { create } from "zustand";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useDriverStore = create((set) => ({
  drivers: [],
  driverById: {},
  error: null,

  getAllDrivers: async () => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get("/drivers");
      set({ drivers: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  getDriverById: async (driverId) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.get(`/driver-profile/${driverId}`);
      set({ driverById: resp.data });
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  addDriver: async (driver) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.post("/drivers", driver);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  updateDriver: async ({ id, driver }) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.put(`/drivers/${id}`, driver);
      return { isOk: true, data: resp.data };
    } catch (error) {
      const err = checkForUnauthorizedResponse(error);
      set({ error: err });
      return { isOk: false, error: err };
    } finally {
      useUIStore.getState().setLoading(false);
    }
  },

  deleteDriver: async (id) => {
    useUIStore.getState().setLoading(true);
    set({ error: null });
    try {
      const resp = await customFetch.delete(`/drivers/${id}`);
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
