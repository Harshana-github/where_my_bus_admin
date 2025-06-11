import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useTaskStore = create(
  devtools(
    (set) => ({
      tasks: [],
      activeTasks: [],
      taskById: {},
      tasksByCompanyId: [],
      error: null,

      addTask: async (task) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post("/tasks/add", task);
          set((state) => ({
            tasks: [...state.tasks, resp.data.newTask || task],
          }));
          return { isOk: true, data: resp.data.msg };
        } catch (error) {
          set({ error: error.message || "An error occurred" });
          return { isOk: false, error: error.message || "An error occurred" };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      updateTask: async ({ id, task }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(`/tasks/update/${id}`, task);
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? resp.data.updatedTask || task : t
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

      deleteTask: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(`/tasks/delete/${id}`);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
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

      getAllTasks: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/tasks/select_all");
          set({ tasks: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveTasks: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get("/tasks/select_all_active");
          set({ activeTasks: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getTaskById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/tasks/select/${id}`);
          set({ taskById: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getAllTasksByCompanyId: async (companyId) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(
            `/tasks/get_all_tasks_by_company_id/${companyId}`
          );
          set({ tasksByCompanyId: resp.data });
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
      resetTaskById: () => set({ taskById: {} }),
      resetTasksByCompanyId: () => set({ tasksByCompanyId: [] }),
    }),
    { name: "TaskStore" }
  )
);
