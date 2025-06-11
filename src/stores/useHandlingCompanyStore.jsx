import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useHandlingCompanyStore = create(
  devtools(
    (set) => ({
      handlingCompanies: [],
      activeHandlingCompanies: [],
      handlingCompanyById: {},
      error: null,

      addHandlingCompany: async (handlingCompany) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post(
            "/company_handling/add",
            handlingCompany
          );
          set((state) => ({
            handlingCompanies: [
              ...state.handlingCompanies,
              resp.data.newHandlingCompany || handlingCompany,
            ],
          }));
          return { isOk: true, data: resp.data.msg };
        } catch (error) {
          set({ error: error.message || "An error occurred" });
          return { isOk: false, error: error.message || "An error occurred" };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      updateHandlingCompany: async ({ id, handlingCompany }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(
            `/company_handling/update/${id}`,
            handlingCompany
          );
          set((state) => ({
            handlingCompanies: state.handlingCompanies.map((h) =>
              h.id === id
                ? resp.data.updatedHandlingCompany || handlingCompany
                : h
            ),
          }));
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      deleteHandlingCompany: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(
            `/company_handling/delete/${id}`
          );
          set((state) => ({
            handlingCompanies: state.handlingCompanies.filter(
              (h) => h.id !== id
            ),
          }));
          return { isOk: true, data: resp.data.msg };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getAllHandlingCompanies: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/company_handling/select_all");
          set({ handlingCompanies: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveHandlingCompanies: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get(
            "/company_handling/select_all_active"
          );
          set({ activeHandlingCompanies: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getHandlingCompanyById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/company_handling/select/${id}`);
          set({ handlingCompanyById: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      resetError: () => set({ error: null }),

      resetHandlingCompanyById: () => set({ handlingCompanyById: {} }),
    }),
    { name: "HandlingCompanyStore" }
  )
);
