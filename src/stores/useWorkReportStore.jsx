import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customFetch, { checkForUnauthorizedResponse } from "../utils/axios";
import { useUIStore } from "./useUIStore";

export const useWorkReportStore = create(
  devtools(
    (set) => ({
      workReports: [],
      activeWorkReports: [],
      workReportById: {},
      workReportsByCompanyId: [],
      error: null,

      addWorkReport: async (workReport) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.post("/work_report/add", workReport);
          set((state) => ({
            workReports: [
              ...state.workReports,
              resp.data.newWorkReport || workReport,
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

      updateWorkReport: async ({ id, workReport }) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.put(
            `/work_report/update/${id}`,
            workReport
          );
          set((state) => ({
            workReports: state.workReports.map((t) =>
              t.id === id ? resp.data.updatedWorkReports || workReport : t
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

      deleteWorkReport: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.delete(`/work_report/delete/${id}`);
          set((state) => ({
            workReports: state.workReports.filter((t) => t.id !== id),
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

      getAllWorkReports: async () => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get("/work_report/select_all");
          set({ workReports: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getActiveWorkReports: async () => {
        set({ error: null });
        try {
          const resp = await customFetch.get("/work_report/select_all_active");
          set({ activeWorkReports: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        }
      },

      getWorkReportById: async (id) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(`/work_report/select/${id}`);
          set({ workReportById: resp.data });
          return { isOk: true, data: resp.data };
        } catch (error) {
          const err = checkForUnauthorizedResponse(error);
          set({ error: err });
          return { isOk: false, error: err };
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      getAllWorkReportByCompanyId: async (companyId) => {
        useUIStore.getState().setLoading(true);
        set({ error: null });
        try {
          const resp = await customFetch.get(
            `/work_report/get_all_work_report_by_company_id/${companyId}`
          );
          set({ workReportsByCompanyId: resp.data });
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
      resetTaskById: () => set({ workReportById: {} }),
      resetTasksByCompanyId: () => set({ workReportsByCompanyId: [] }),
    }),
    { name: "WorkReportStore" }
  )
);
