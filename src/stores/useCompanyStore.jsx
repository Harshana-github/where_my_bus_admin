import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useCompanyStore = create(
  devtools(
    (set) => ({
      companies: [],
      activeCompanies: [],
      companyById: {},
      error: null,

      addCompany: async (company) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post("/company/add", company);
          set((state) => ({
            companies: [...state.companies, resp.data.newCompany || company],
          }));
          return { isOk: true, data: resp.data.msg };
        } catch (error) {
          set({ error: error.message || "An error occurred" });
          return { isOk: false, error: error.message || "An error occurred" };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      updateCompany: async ({ id, company }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(`/company/update/${id}`, company);
          set((state) => ({
            companies: state.companies.map((c) =>
              c.id === id ? resp.data.updatedCompany || company : c
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

      deleteCompany: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(`/company/delete/${id}`);
          set((state) => ({
            companies: state.companies.filter((c) => c.id !== id),
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

      getAllCompanies: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/company/select_all");
          set({ companies: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveCompanies: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get("/company/select_all_active");
          set({ activeCompanies: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getCompanyById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/company/select/${id}`);
          set({ companyById: resp.data });
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
      resetCompanyById: () => set({ companyById: {} }),
    }),
    { name: "CompanyStore" }
  )
);
