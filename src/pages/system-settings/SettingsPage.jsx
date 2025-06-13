import React from "react";
import { Route, Routes } from "react-router-dom";
import SettingsTabPanel from "../../components/settings-tab-panel/SettingsTabPanel";
import SystemSettingsPage from "../../pages/system-settings/SystemSettingsPage";
import DepartmentPage from "../../pages/system-settings/DepartmentPage";
import TaskPriorityPage from "../../pages/system-settings/TaskPriorityPage";
import TaskStatusPage from "../../pages/system-settings/TaskStatusPage";
import HandlingCompanyPage from "../../pages/system-settings/HandlingCompanyPage";
import TownPage from "../../pages/system-settings/TownPage";

const SettingsPage = () => {
  return (
    <div>
      <SettingsTabPanel />
      <Routes>
        <Route path="/" element={<SystemSettingsPage />} />
        <Route path="/department" element={<DepartmentPage />} />
        <Route path="/town" element={<TownPage />} />
        <Route path="/task-priority" element={<TaskPriorityPage />} />
        <Route path="/task-status" element={<TaskStatusPage />} />
        <Route path="/handling-company" element={<HandlingCompanyPage />} />
      </Routes>
    </div>
  );
};

export default SettingsPage;
