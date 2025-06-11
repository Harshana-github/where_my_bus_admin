import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useTaskPriorityStore = create(
  devtools(
    (set) => ({
      taskPriorities: [],
      activeTaskPriorities: [],
      taskPriorityById: {},
      error: null,

      addTaskPriority: async (taskPriority) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post("/task_priority/add", taskPriority);
          set((state) => ({
            taskPriorities: [
              ...state.taskPriorities,
              resp.data.newTaskPriority || taskPriority,
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

      updateTaskPriority: async ({ id, taskPriority }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(
            `/task_priority/update/${id}`,
            taskPriority
          );
          set((state) => ({
            taskPriorities: state.taskPriorities.map((tp) =>
              tp.id === id ? resp.data.updatedTaskPriority || taskPriority : tp
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

      deleteTaskPriority: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(`/task_priority/delete/${id}`);
          set((state) => ({
            taskPriorities: state.taskPriorities.filter((tp) => tp.id !== id),
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

      getAllTaskPriorities: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/task_priority/select_all");
          set({ taskPriorities: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveTaskPriorities: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get("/task_priority/select_all_active");
          set({ activeTaskPriorities: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getTaskPriorityById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/task_priority/select/${id}`);
          set({ taskPriorityById: resp.data });
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
      resetTaskPriorityById: () => set({ taskPriorityById: {} }),
    }),
    { name: "TaskPriorityStore" } // optional store name shown in Redux DevTools
  )
);
