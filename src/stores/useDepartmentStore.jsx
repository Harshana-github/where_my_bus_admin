import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useDepartmentStore = create(
  devtools(
    (set) => ({
      departments: [],
      activeDepartments: [],
      departmentById: {},
      error: null,

      addDepartment: async (department) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post("/department/add", department);
          set((state) => ({
            departments: [
              ...state.departments,
              resp.data.newDepartment || department,
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

      updateDepartment: async ({ id, department }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(
            `/department/update/${id}`,
            department
          );
          set((state) => ({
            departments: state.departments.map((d) =>
              d.id === id ? resp.data.updatedDepartment || department : d
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

      deleteDepartment: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(`/department/delete/${id}`);
          set((state) => ({
            departments: state.departments.filter((d) => d.id !== id),
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

      getAllDepartments: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/department/select_all");
          set({ departments: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveDepartments: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get("/department/select_all_active");
          set({ activeDepartments: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getDepartmentById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/department/select/${id}`);
          set({ departmentById: resp.data });
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
      resetDepartmentById: () => set({ departmentById: {} }),
    }),
    { name: "DepartmentStore" }
  )
);
