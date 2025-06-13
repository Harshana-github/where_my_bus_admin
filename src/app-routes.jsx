import {
  HomePage,
  ManageUserPage,
  SystemSettingsPage,
  ViewUserPage,
  TodoListPage,
  WorkReportPage,
  CompanyDetailsPage,
} from "./pages";
import { withNavigationWatcher } from "./contexts/navigation";
import CompanyListPage from "./pages/company-list/CompanyListPage";
import DepartmentPage from "./pages/system-settings/DepartmentPage";
import TaskPriorityPage from "./pages/system-settings/TaskPriorityPage";
import TaskStatusPage from "./pages/system-settings/TaskStatusPage";
import SettingsPage from "./pages/system-settings/SettingsPage";
import HandlingCompanyPage from "./pages/system-settings/HandlingCompanyPage";
import TownPage from "./pages/system-settings/TownPage";

const routes = [
  { path: "/home", element: HomePage },
   { path: "/driver-list", element: CompanyListPage },
   { path: "/driver-details/:id", element: CompanyDetailsPage },
  { path: "/todo-list", element: TodoListPage },
  { path: "/work-report", element: WorkReportPage },
  { path: "/system-settings/*", element: SettingsPage },
  {
    path: "/system-settings",
    element: SystemSettingsPage,
    children: [
      { path: "department", element: DepartmentPage },
      { path: "town", element: TownPage },
      { path: "task-priority", element: TaskPriorityPage },
      { path: "task-status", element: TaskStatusPage },
      { path: "handling-company", element: HandlingCompanyPage },
    ],
  },
  { path: "/view-user", element: ViewUserPage }
];

export default routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
