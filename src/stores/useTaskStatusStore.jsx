import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useTaskStatusStore = create(
  devtools(
    (set) => ({
      taskStatuses: [],
      activeTaskStatuses: [],
      taskStatusById: {},
      error: null,

      addTaskStatus: async (taskStatus) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post("/task_status/add", taskStatus);
          set((state) => ({
            taskStatuses: [
              ...state.taskStatuses,
              resp.data.newTaskStatus || taskStatus,
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

      updateTaskStatus: async ({ id, taskStatus }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(
            `/task_status/update/${id}`,
            taskStatus
          );
          set((state) => ({
            taskStatuses: state.taskStatuses.map((ts) =>
              ts.id === id ? resp.data.updatedTaskStatus || taskStatus : ts
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

      deleteTaskStatus: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(`/task_status/delete/${id}`);
          set((state) => ({
            taskStatuses: state.taskStatuses.filter((ts) => ts.id !== id),
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

      getAllTaskStatuses: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/task_status/select_all");
          set({ taskStatuses: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveTaskStatuses: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get("/task_status/select_all_active");
          set({ activeTaskStatuses: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getTaskStatusById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/task_status/select/${id}`);
          set({ taskStatusById: resp.data });
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
      resetTaskStatusById: () => set({ taskStatusById: {} }),
    }),
    { name: "TaskStatusStore" }
  )
);
