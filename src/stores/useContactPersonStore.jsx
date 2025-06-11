import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useContactPersonStore = create(
  devtools(
    (set) => ({
      contactPersons: [],
      activeContactPersons: [],
      contactPersonById: {},
      error: null,

      getContactPersonsByCompanyId: async (companyId) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(
            `/company_contact_person/select/${companyId}`
          );
          set({ contactPersons: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getAllContactPersons: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get(
            "/company_contact_person/select_all"
          );
          set({ contactPersons: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getActiveContactPersons: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get(
            "/company_contact_person/select_all_active"
          );
          set({ activeContactPersons: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getContactPersonById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(
            `/company_contact_person/select/${id}`
          );
          set({ contactPersonById: resp.data });
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
      resetContactPersonById: () => set({ contactPersonById: {} }),
    }),
    { name: "ContactPersonStore" }
  )
);
