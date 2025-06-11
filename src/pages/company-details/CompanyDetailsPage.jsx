import { useEffect, useState, memo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "devextreme-react/form";
import Box, { Item as ItemBox } from "devextreme-react/box";
import Button from "devextreme-react/button";
import { Toolbar as ToolbarTX } from "devextreme-react/toolbar";
import { useTranslation } from "react-i18next";
import TabPanel from "devextreme-react/tab-panel";
import moment from "moment";
import notify from "devextreme/ui/notify";
import TextBox from "devextreme-react/text-box";
import SelectBox from "devextreme-react/select-box";
import DateBox from "devextreme-react/date-box";
import {
  DataGrid,
  Column,
  ColumnFixing,
  RequiredRule,
  Pager,
  Paging,
  Editing,
  Popup,
  Form,
  Lookup,
  Selection,
  Grouping,
  GroupPanel,
  FilterRow,
  SearchPanel,
  MasterDetail,
  HeaderFilter,
} from "devextreme-react/data-grid";

import { useDepartmentStore } from "../../stores/useDepartmentStore";
import { useTaskPriorityStore } from "../../stores/useTaskPriorityStore";
import { useTaskStatusStore } from "../../stores/useTaskStatusStore";
import { useUserStore } from "../../stores/useUserStore";
import { useTaskStore } from "../../stores/useTaskStore";
import { useCompanyStore } from "../../stores/useCompanyStore";

import "./CompanyDetailsPage.scss";
import { useWorkReportStore } from "../../stores/useWorkReportStore";

const LabeledField = memo(({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ marginBottom: 4, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
));

const LabelRow = memo(({ labels, whiteBackground = false, ratios }) => {
  return (
    <Box
      direction="row"
      width="100%"
      gap={whiteBackground ? 1 : 16}
      className="label-row-container"
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {labels.map((labelKey, index) => (
        <ItemBox key={labelKey} ratio={ratios?.[index] ?? 1}>
          <div className={whiteBackground ? "label-box-white" : "label-box"}>
            <LabeledField label={labelKey} />
          </div>
        </ItemBox>
      ))}
    </Box>
  );
});

const pageSizes = [10, 25, 50, 100];

export default function CompanyDetailsPage() {
  const isPC = window.innerWidth > 750;
  const isMobile = window.innerWidth < 750;
  const { t } = useTranslation();
  const { id: companyId } = useParams();
  const navigate = useNavigate();

  const companyIdInt = parseInt(companyId, 10);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTaskCollapsed, setIsTaskCollapsed] = useState(false);
  const [isWRCollapsed, setIsWRCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const getAllTasks = useTaskStore((state) => state.getAllTasks);
  const tasksByCompanyId = useTaskStore((state) => state.tasksByCompanyId);
  const getAllTasksByCompanyId = useTaskStore(
    (state) => state.getAllTasksByCompanyId
  );
  const addTask = useTaskStore((state) => state.addTask);

  const updateTask = useTaskStore((state) => state.updateTask);

  const deleteTask = useTaskStore((state) => state.deleteTask);

  const activeDepartments = useDepartmentStore(
    (state) => state.activeDepartments
  );
  const getActiveDepartments = useDepartmentStore(
    (state) => state.getActiveDepartments
  );

  const activeTaskPriorities = useTaskPriorityStore(
    (state) => state.activeTaskPriorities
  );
  const getActiveTaskPriorities = useTaskPriorityStore(
    (state) => state.getActiveTaskPriorities
  );

  const activeTaskStatuses = useTaskStatusStore(
    (state) => state.activeTaskStatuses
  );
  const getActiveTaskStatuses = useTaskStatusStore(
    (state) => state.getActiveTaskStatuses
  );
  const usersActive = useUserStore((state) => state.usersActive);
  const getActiveUsers = useUserStore((state) => state.getActiveUsers);
  const companyById = useCompanyStore((state) => state.companyById);
  const getCompanyById = useCompanyStore((state) => state.getCompanyById);

  const activeCompanies = useCompanyStore((state) => state.activeCompanies);
  const getActiveCompanies = useCompanyStore(
    (state) => state.getActiveCompanies
  );

  // --------------- Company Details Section ---------------

  const labelsTop = [
    t("company_name"),
    t("company_name_kana"),
    t("email"),
    t("telephone"),
    t("handling_company"),
  ];

  const labelsTopValuesData = [
    companyById.company_name ?? "-",
    companyById.company_name_kana ?? "-",
    companyById.email ?? "-",
    companyById.telephone ?? "-",
    companyById.company_handlings?.name ?? "-",
  ];

  const labelsBottom = [
    t("postal_code"),
    t("address01_address02"),
    t("incharge"),
    t("responsible_person"),
  ];

  const addressFull =
    (companyById.address01 ?? "") + " , " + (companyById.address02 ?? "");

  const inchargeFullName =
    (companyById.incharge?.first_name ?? "") +
    " " +
    (companyById.incharge?.last_name ?? "");

  const contactPersonFullName =
    (companyById.contact_persons?.[0]?.title ?? "") +
    " " +
    (companyById.contact_persons?.[0]?.name ?? "");

  const labelsBottomValuesData = [
    companyById.postal_code ?? "-",
    addressFull ?? "-",
    inchargeFullName ?? "-",
    contactPersonFullName.trim() || "-",
  ];

  // --------------- Task Section ---------------

  const [filterTasks, setFilterTasks] = useState({
    id: null,
    task_name: "",
    department_id: null,
    incharge_id: null,
    start_date: null,
    due_date: null,
    task_status_id: null,
    description: "",
    task_priority_id: null,
    is_active: null,
    is_expired: null,
  });

  const [filterTaskValue, setTaskFilterValue] = useState([]);

  const handleRowInsertingTask = async (e) => {
    e.data.company_id = companyIdInt;
    e.data.start_date = moment(e.data.start_date).format("YYYY/MM/DD");
    e.data.due_date = moment(e.data.due_date).format("YYYY/MM/DD");
    const result = await addTask(e.data);
    if (result.isOk) {
      notify(t("cdMessages.task_added_successfully"), "success", 2000);
      await getAllTasksByCompanyId(companyId);
    } else {
      notify(t("cdMessages.task_add_error"), "error", 2000);
    }
  };

  const handleRowUpdatingTask = async (e) => {
    e.newData.start_date = moment(e.newData.start_date).format("YYYY/MM/DD");
    e.newData.due_date = moment(e.newData.due_date).format("YYYY/MM/DD");
    const task_name = e.newData.task_name ?? e.oldData.task_name ?? "";
    const department_id =
      e.newData.department_id ?? e.oldData.department_id ?? null;
    const incharge_id = e.newData.incharge_id ?? e.oldData.incharge_id ?? null;
    const content = e.newData.content ?? e.oldData.content ?? "";
    const start_date = e.newData.start_date ?? e.oldData.start_date ?? null;
    const due_date = e.newData.due_date ?? e.oldData.due_date ?? null;
    const task_priority_id =
      e.newData.task_priority_id ?? e.oldData.task_priority_id ?? null;
    const task_status_id =
      e.newData.task_status_id ?? e.oldData.task_status_id ?? null;
    const description = e.newData.description ?? e.oldData.description ?? "";
    const is_active = e.newData.is_active ?? e.oldData.is_active ?? true;
    const company_id =
      e.newData.company_id ?? e.oldData.company_id ?? companyIdInt;

    const updatedData = {
      id: e.key,
      task_name,
      department_id,
      incharge_id,
      content,
      start_date,
      due_date,
      task_priority_id,
      task_status_id,
      description,
      is_active,
      company_id,
    };
    const result = await updateTask({
      id: e.key,
      task: updatedData,
    });
    if (result.isOk) {
      notify(t("cdMessages.task_updated_successfully"), "success", 2000);
      await getAllTasksByCompanyId(companyId);
    } else {
      notify(t("cdMessages.task_update_error"), "error", 2000);
    }
  };

  const handleRowRemovingTask = async (e) => {
    const result = await deleteTask(e.key);
    if (result.isOk) {
      notify(t("cdMessages.task_removed_successfully"), "success", 2000);
      await getAllTasksByCompanyId(companyId);
    } else {
      notify(t("cdMessages.task_remove_error"), "error", 2000);
    }
  };

  const handleApplyTaskFilter = () => {
    const filterConditions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterTasks.is_expired === 0) {
      filterConditions.push([
        ["due_date", "<", moment(today).format("YYYY/MM/DD")],
      ]);
    } else if (filterTasks.is_expired === 1) {
      filterConditions.push([
        ["due_date", ">=", moment(today).format("YYYY/MM/DD")],
      ]);
    }
    if (filterTasks.id) filterConditions.push(["id", "=", filterTasks.id]);

    if (filterTasks.task_name)
      filterConditions.push(["task_name", "contains", filterTasks.task_name]);

    if (filterTasks.department_id)
      filterConditions.push(["department_id", "=", filterTasks.department_id]);

    if (filterTasks.incharge_id)
      filterConditions.push(["incharge_id", "=", filterTasks.incharge_id]);

    if (filterTasks.is_active === 1 || filterTasks.is_active === 0) {
      filterConditions.push(["is_active", "=", filterTasks.is_active]);
    }
    if (filterTasks.start_date)
      filterConditions.push(["start_date", ">=", filterTasks.start_date]);

    if (filterTasks.due_date)
      filterConditions.push(["due_date", "<=", filterTasks.due_date]);

    if (filterTasks.task_status_id)
      filterConditions.push([
        "task_status_id",
        "=",
        filterTasks.task_status_id,
      ]);

    if (filterTasks.description)
      filterConditions.push([
        "description",
        "contains",
        filterTasks.description,
      ]);

    if (filterTasks.task_priority_id)
      filterConditions.push([
        "task_priority_id",
        "=",
        filterTasks.task_priority_id,
      ]);

    if (filterConditions.length > 1) {
      setTaskFilterValue(["and", ...filterConditions]);
    } else if (filterConditions.length === 1) {
      setTaskFilterValue(filterConditions[0]);
    } else {
      setTaskFilterValue([]);
    }
  };

  const handleClearTaskFilter = () => {
    setFilterTasks({
      task_name: "",
      department_id: null,
      incharge_id: null,
      content: "",
      start_date: null,
      due_date: null,
      task_status_id: null,
      description: "",
      task_priority_id: null,
      is_expired: null,
      is_active: null,
    });
    setTaskFilterValue([]);
  };

  const handleToggleCollapse = () => {
    setIsTaskCollapsed(!isTaskCollapsed);
  };

  const taskColumns = [
    { caption: t("ID"), dataField: "id", width: 60 },
    { caption: t("task_name"), dataField: "task_name", required: true },
    {
      caption: t("department"),
      dataField: "department_id",
      lookup: {
        dataSource: activeDepartments,
        valueExpr: "id",
        displayExpr: "departments_name",
      },
      width: 150,
    },
    {
      caption: t("task_priority"),
      dataField: "task_priority_id",
      lookup: {
        dataSource: activeTaskPriorities,
        valueExpr: "id",
        displayExpr: "task_priority_name",
      },
      width: 100,
    },
    {
      caption: t("person_in_charge"),
      dataField: "incharge_id",
      lookup: {
        dataSource: usersActive,
        valueExpr: "id",
        displayExpr: "first_name",
      },
      width: 200,
    },
    {
      caption: t("start_date"),
      dataField: "start_date",
      dataType: "date",
      width: 100,
    },
    {
      caption: t("due_date"),
      dataField: "due_date",
      dataType: "date",
      width: 100,
    },
    {
      caption: t("settings.common.fields.is_active"),
      dataField: "is_active",
      dataType: "boolean",
      alignment: "center",
      width: 80,
    },
    {
      caption: t("status"),
      dataField: "task_status_id",
      lookup: {
        dataSource: activeTaskStatuses,
        valueExpr: "id",
        displayExpr: "task_status_name",
      },
      width: 100,
    },
    { caption: t("content"), dataField: "content" },
    { caption: t("details"), dataField: "description" },
  ];
  const onToolbarPreparingTask = useCallback((e) => {
    const toolbarItems = e.toolbarOptions.items;
    const addButtonIndex = toolbarItems.findIndex(
      (item) => item.name === "addRowButton"
    );
    if (addButtonIndex !== -1) toolbarItems.splice(addButtonIndex, 1);

    toolbarItems.push({
      widget: "dxButton",
      options: {
        icon: "plus",
        text: t("add_task"),
        onClick: () => e.component.addRow(),
        stylingMode: "contained",
        showText: "always",
      },
      location: "after",
    });

    toolbarItems.push({
      widget: "dxButton",
      options: {
        icon: "refresh",
        onClick: () => {
          e.component.clearFilter();
        },
        stylingMode: "outlined",
        showText: "always",
        type: "normal",
      },
      location: "after",
    });
  }, []);

  // --------------- Work Report Section ---------------

  const workReports = useWorkReportStore((state) => state.workReports);
  const workReportsByCompanyId = useWorkReportStore(
    (state) => state.workReportsByCompanyId
  );
  const getAllWorkReportByCompanyId = useWorkReportStore(
    (state) => state.getAllWorkReportByCompanyId
  );
  const getAllWorkReports = useWorkReportStore(
    (state) => state.getAllWorkReports
  );
  const addWorkReport = useWorkReportStore((state) => state.addWorkReport);
  const updateWorkReport = useWorkReportStore(
    (state) => state.updateWorkReport
  );
  const deleteWorkReport = useWorkReportStore(
    (state) => state.deleteWorkReport
  );

  const [isAddingWR, setIsAddingWR] = useState(false);
  const [filterWorkReportValue, setFilterWorkReportValue] = useState([]);
  const [filterWorkReport, setFilterWorkReport] = useState({
    id: null,
    title: "",
    location: "",
    incharge_id: null,
    company_id: null,
    report_date: "",
    report_time: "",
    content: "",
    remark: "",
    is_active: null,
  });

  const handleRowInsertingWR = async (e) => {
    e.data.company_id = companyIdInt;
    e.data.report_date = moment(e.data.report_date).format("YYYY/MM/DD");
    e.data.report_time = moment(e.data.report_time).format("HH:mm:ss");
    const result = await addWorkReport(e.data);
    if (result.isOk) {
      notify(t("wrMessages.workReport_added_successfully"), "success", 2000);
      await getAllWorkReportByCompanyId(companyId);
    } else {
      notify(t("wrMessages.workReport_add_error"), "error", 2000);
    }
  };

  const handleRowUpdatingWR = async (e) => {
    e.newData.report_date = moment(e.newData.report_date).format("YYYY/MM/DD");
    e.newData.report_time = moment(e.newData.report_time).format("HH:mm:ss");

    const title = e.newData.title ?? e.oldData.title ?? "";
    const report_date = e.newData.report_date ?? e.oldData.report_date ?? null;
    const report_time = e.newData.report_time ?? e.oldData.report_time ?? null;
    const location = e.newData.location ?? e.oldData.location ?? "";
    const incharge_id = e.newData.incharge_id ?? e.oldData.incharge_id ?? null;
    const content = e.newData.content ?? e.oldData.content ?? "";
    const remark = e.newData.remark ?? e.oldData.remark ?? "";
    const is_printed = e.newData.is_printed ?? e.oldData.is_printed ?? true;
    const is_active = e.newData.is_active ?? e.oldData.is_active ?? true;
    const contact_person_id =
      e.newData.contact_person_id ?? e.oldData.contact_person_id ?? null;
    const company_id =
      e.newData.company_id ?? e.oldData.company_id ?? companyIdInt;

    const updatedData = {
      id: e.key,
      title,
      report_date,
      report_time,
      location,
      incharge_id,
      content,
      remark,
      is_printed,
      is_active,
      contact_person_id,
      company_id,
    };
    const result = await updateWorkReport({
      id: e.key,
      workReport: updatedData,
    });
    if (result.isOk) {
      notify(t("wrMessages.workReport_updated_successfully"), "success", 2000);
      await getAllWorkReportByCompanyId(companyId);
    } else {
      notify(t("wrMessages.workReport_update_error"), "error", 2000);
    }
  };

  const handleRowRemovingWR = async (e) => {
    const result = await deleteWorkReport(e.key);
    if (result.isOk) {
      notify(t("wrMessages.workReport_removed_successfully"), "success", 2000);
      await getAllWorkReportByCompanyId(companyId);
    } else {
      notify(t("wrMessages.workReport_remove_error"), "error", 2000);
    }
  };

  const handleApplyWRFilter = () => {
    const filterConditions = [];
    if (filterWorkReport.id)
      filterConditions.push(["id", "=", filterWorkReport.id]);
    if (filterWorkReport.company_id)
      filterConditions.push(["company_id", "=", filterWorkReport.company_id]);
    if (filterWorkReport.title)
      filterConditions.push(["title", "contains", filterWorkReport.title]);
    if (filterWorkReport.location)
      filterConditions.push([
        "location",
        "contains",
        filterWorkReport.location,
      ]);
    if (filterWorkReport.incharge_id)
      filterConditions.push(["incharge_id", "=", filterWorkReport.incharge_id]);
    if (filterWorkReport.report_date)
      filterConditions.push([
        "report_date",
        "contains",
        filterWorkReport.report_date,
      ]);
    if (filterWorkReport.report_time)
      filterConditions.push([
        "report_time",
        "contains",
        filterWorkReport.report_time,
      ]);
    if (filterWorkReport.content)
      filterConditions.push(["content", "contains", filterWorkReport.content]);
    if (filterWorkReport.remark)
      filterConditions.push(["remark", "contains", filterWorkReport.remark]);
    if (filterWorkReport.is_active === 1 || filterWorkReport.is_active === 0) {
      filterConditions.push(["is_active", "=", filterWorkReport.is_active]);
    }
    if (filterConditions.length > 1) {
      setFilterWorkReportValue(["and", ...filterConditions]);
    } else if (filterConditions.length === 1) {
      setFilterWorkReportValue(filterConditions[0]);
    } else {
      setFilterWorkReportValue([]);
    }
  };

  const handleClearWRFilter = () => {
    setFilterWorkReport({
      id: null,
      title: "",
      location: "",
      company_id: null,
      incharge_id: null,
      report_date: "",
      report_time: "",
      content: "",
      remark: "",
      is_active: null,
    });
    setFilterWorkReportValue([]);
  };

  const handleToggleWRCollapse = () => {
    setIsWRCollapsed(!isWRCollapsed);
  };

  const onToolbarPreparingWR = useCallback((e) => {
    const toolbarItems = e.toolbarOptions.items;
    const addButtonIndex = toolbarItems.findIndex(
      (item) => item.name === "addRowButton"
    );
    if (addButtonIndex !== -1) toolbarItems.splice(addButtonIndex, 1);

    toolbarItems.push({
      widget: "dxButton",
      options: {
        icon: "plus",
        text: t("add_work_report"),
        onClick: () => e.component.addRow(),
        stylingMode: "contained",
        showText: "always",
      },
      location: "after",
    });

    toolbarItems.push({
      widget: "dxButton",
      options: {
        icon: "refresh",
        onClick: () => {
          e.component.clearFilter();
        },
        stylingMode: "outlined",
        showText: "always",
        type: "normal",
      },
      location: "after",
    });
  }, []);

  useEffect(() => {
    getAllTasks();
    getActiveDepartments();
    getActiveTaskPriorities();
    getActiveTaskStatuses();
    getActiveUsers();
    getCompanyById(companyId);
    getAllTasksByCompanyId(companyId);
    getAllWorkReportByCompanyId(companyId);
    getActiveCompanies();
  }, [
    getAllTasks,
    getActiveDepartments,
    getActiveTaskPriorities,
    getActiveTaskStatuses,
    getActiveUsers,
    companyId,
    getActiveCompanies,
    getAllWorkReports,
    getAllWorkReportByCompanyId,
  ]);

  return (
    <div className={"company-details-page"}>
      <ToolbarTX className="toolbarPadding">
        <ItemBox location="before" style={{ padding: "56px" }}>
          <Button
            text={isCollapsed ? t("show") : t("hide")}
            icon={isCollapsed ? "chevrondown" : "chevronup"}
            onClick={() => setIsCollapsed(!isCollapsed)}
            width="100%"
          />
        </ItemBox>
        <Item
          location="after"
          style={{ padding: "16px" }}
          render={() => (
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                icon="back"
                text={t("back")}
                type="varriant"
                stylingMode="varriant"
                width={100}
                onClick={() => navigate(-1)}
              />
            </div>
          )}
        />
      </ToolbarTX>

      {!isCollapsed && (
        <>
          {isPC && (
            <>
              <LabelRow labels={labelsTop} whiteBackground={false} />
              <LabelRow labels={labelsTopValuesData} whiteBackground={true} />
              <LabelRow
                labels={labelsBottom}
                whiteBackground={false}
                ratios={[1, 2, 1, 1]}
              />
              <LabelRow
                labels={labelsBottomValuesData}
                whiteBackground={true}
                ratios={[1, 2, 1, 1]}
              />
            </>
          )}
          {isMobile && (
            <>
              <LabelRow labels={[t("company_name")]} whiteBackground={false} />
              <LabelRow
                labels={[companyById.company_name ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow
                labels={[t("company_name_kana")]}
                whiteBackground={false}
              />
              <LabelRow
                labels={[companyById.company_name_kana ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow labels={[t("email")]} whiteBackground={false} />
              <LabelRow
                labels={[companyById.email ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow labels={[t("telephone")]} whiteBackground={false} />
              <LabelRow
                labels={[companyById.telephone ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow
                labels={[t("handling_company")]}
                whiteBackground={false}
              />
              <LabelRow
                labels={[companyById.company_handlings?.name ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow labels={[t("postal_code")]} whiteBackground={false} />
              <LabelRow
                labels={[companyById.postal_code ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow
                labels={[t("address01_address02")]}
                whiteBackground={false}
              />
              <LabelRow labels={[addressFull ?? "-"]} whiteBackground={true} />
              <LabelRow labels={[t("incharge")]} whiteBackground={false} />
              <LabelRow
                labels={[inchargeFullName ?? "-"]}
                whiteBackground={true}
              />
              <LabelRow
                labels={[t("responsible_person")]}
                whiteBackground={false}
              />
              <LabelRow
                labels={[contactPersonFullName.trim() || "-"]}
                whiteBackground={true}
              />
            </>
          )}
          <br />
        </>
      )}

      <TabPanel
        key={isTaskCollapsed ? "collapsed" : "expanded"}
        dataSource={[
          {
            title: t("todo"),
            icon: "menu",
            content: (
              <>
                <ToolbarTX className="toolbarPadding">
                  <Item location="before" style={{ padding: "56px" }}>
                    <Button
                      text={isTaskCollapsed ? t("show") : t("hide")}
                      icon={isTaskCollapsed ? "chevrondown" : "chevronup"}
                      onClick={handleToggleCollapse}
                      width="100%"
                    />
                  </Item>
                  <Item
                    location="after"
                    style={{ padding: "16px" }}
                    render={() => (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          icon="clear"
                          text={t("clear")}
                          type="varriant"
                          stylingMode="varriant"
                          onClick={handleClearTaskFilter}
                        />
                        <Button
                          icon="filter"
                          text={t("filter")}
                          type="default"
                          stylingMode="contained"
                          onClick={handleApplyTaskFilter}
                        />
                      </div>
                    )}
                  />
                  <br />
                </ToolbarTX>

                {!isTaskCollapsed && (
                  <>
                    <div
                      className="responsive-filter-container"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "16px",
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div className="filter-item">
                        <LabeledField label={t("ID")}>
                          <TextBox
                            placeholder={t("id")}
                            value={filterTasks.id}
                            showClearButton
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                id: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>
                      <div className="filter-item">
                        <LabeledField label={t("task_name")}>
                          <TextBox
                            placeholder={t("task_name")}
                            value={filterTasks.task_name}
                            showClearButton
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                task_name: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("department")}>
                          <SelectBox
                            items={activeDepartments}
                            placeholder={t("department")}
                            valueExpr="id"
                            displayExpr="departments_name"
                            value={filterTasks.department_id}
                            searchEnabled
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                department_id: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("person_in_charge")}>
                          <SelectBox
                            items={usersActive}
                            placeholder={t("person_in_charge")}
                            valueExpr="id"
                            displayExpr="first_name"
                            value={filterTasks.incharge_id}
                            searchEnabled
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                incharge_id: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("task_priority")}>
                          <SelectBox
                            items={activeTaskPriorities}
                            placeholder={t("task_priority")}
                            value={filterTasks.task_priority_id}
                            searchEnabled
                            valueExpr="id"
                            displayExpr="task_priority_name"
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                task_priority_id: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("is_expired")}>
                          <SelectBox
                            items={[
                              { id: null, text: t("All") },
                              { id: 1, text: t("available") },
                              { id: 0, text: t("expired") },
                            ]}
                            placeholder={t("is_expired")}
                            valueExpr="id"
                            displayExpr="text"
                            value={filterTasks.is_expired}
                            searchEnabled
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                is_expired: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>
                    </div>

                    <div
                      className="responsive-filter-container"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "16px",
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div className="filter-item">
                        <LabeledField label={t("start_date")}>
                          <DateBox
                            placeholder={t("start_date")}
                            value={filterTasks.start_date}
                            displayFormat="yyyy/MM/dd"
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                start_date: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("due_date")}>
                          <DateBox
                            placeholder={t("due_date")}
                            value={filterTasks.due_date}
                            displayFormat="yyyy/MM/dd"
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                due_date: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("status")}>
                          <SelectBox
                            items={activeTaskStatuses}
                            placeholder={t("status")}
                            value={filterTasks.task_status_id}
                            searchEnabled
                            valueExpr="id"
                            displayExpr="task_status_name"
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                task_status_id: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("details")}>
                          <TextBox
                            placeholder={t("details")}
                            value={filterTasks.description}
                            showClearButton
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                description: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("is_active")}>
                          <SelectBox
                            items={[
                              { id: null, text: t("All") },
                              { id: 1, text: t("Active") },
                              { id: 0, text: t("Inactive") },
                            ]}
                            placeholder={t("is_active")}
                            valueExpr="id"
                            displayExpr="text"
                            value={filterTasks.is_active}
                            searchEnabled
                            onValueChanged={(e) =>
                              setFilterTasks((prev) => ({
                                ...prev,
                                is_active: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>
                    </div>
                  </>
                )}

                <DataGrid
                  dataSource={tasksByCompanyId}
                  filterValue={filterTaskValue}
                  keyExpr="id"
                  showBorders={true}
                  showRowLines
                  rowAlternationEnabled
                  width="100%"
                  onToolbarPreparing={onToolbarPreparingTask}
                  onRowInserting={handleRowInsertingTask}
                  onRowUpdating={handleRowUpdatingTask}
                  onRowRemoving={handleRowRemovingTask}
                  onInitNewRow={(e) => {
                    setIsAdding(true);
                    e.data.is_active = true;
                  }}
                  onEditingStart={(e) => {
                    setIsAdding(false);
                  }}
                  onEditorPreparing={(e) => {
                    if (e.dataField === "id") {
                      if (e.row && e.row.isNewRow) {
                        e.editorOptions.visible = false;
                      } else {
                        e.editorOptions.visible = true;
                      }
                    }
                  }}
                  onRowPrepared={(e) => {
                    if (e.rowType === "data" && e.data?.due_date) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const dueDate = new Date(e.data.due_date);
                      dueDate.setHours(0, 0, 0, 0);

                      if (dueDate < today) {
                        e.rowElement.classList.add("expired-task-row");
                        e.rowElement.title = t("expired_task_message");
                        e.rowElement.style.cursor = "not-allowed";
                      }
                    }
                  }}
                >
                  <FilterRow visible={true} />
                  <HeaderFilter visible={true} />
                  <SearchPanel visible={true} highlightCaseSensitive={true} />
                  <Selection
                    mode="multiple"
                    selectAllMode="allPages"
                    showCheckBoxesMode="always"
                  />
                  <Editing
                    mode="popup"
                    allowUpdating
                    allowDeleting
                    allowAdding
                    useIcons
                  >
                    <Popup
                      title={t("cdMessages.add_edit_task")}
                      showTitle
                      maxWidth={window.innerWidth < 500 ? "90%" : 1000}
                      maxHeight={700}
                      dragEnabled={false}
                      closeOnOutsideClick
                      showCloseButton
                      resizeEnabled={false}
                      position="center"
                    />
                    <Form labelLocation="top" colCount={1}>
                      <Item itemType="group" colCount={1}>
                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 2, sm: 2, md: 5, lg: 5 }}
                          caption=""
                        >
                          <Item
                            dataField="id"
                            editorOptions={{
                              readOnly: true,
                            }}
                            visible={!isAdding}
                          />
                        </Item>
                        <Item dataField="task_name" />

                        <Item dataField="content" />

                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                          caption=""
                        >
                          <Item dataField="start_date" editorType="dxDateBox" />
                          <Item dataField="due_date" editorType="dxDateBox" />
                        </Item>

                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                          caption=""
                        >
                          <Item
                            dataField="department_id"
                            editorType="dxSelectBox"
                          />
                          <Item
                            dataField="incharge_id"
                            editorType="dxSelectBox"
                          />
                        </Item>

                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                          caption=""
                        >
                          <Item
                            dataField="task_priority_id"
                            editorType="dxSelectBox"
                          />
                          <Item
                            dataField="task_status_id"
                            editorType="dxSelectBox"
                          />
                        </Item>

                        <Item dataField="description" />
                        <Item dataField="is_active" editorType="dxCheckBox" />
                      </Item>
                    </Form>
                  </Editing>

                  {taskColumns.map(
                    ({
                      dataField,
                      caption,
                      visible = true,
                      dataType = "string",
                      width = 200,
                      alignment = "left",
                      required = false,
                      lookup,
                    }) => {
                      let cellRender;
                      if (
                        ["task_status_id", "task_priority_id"].includes(
                          dataField
                        )
                      ) {
                        const source =
                          dataField === "task_status_id"
                            ? activeTaskStatuses
                            : activeTaskPriorities;

                        cellRender = ({ data }) => {
                          const item = source.find(
                            (x) => x.id === data[dataField]
                          );

                          if (!item) {
                            return (
                              <div style={{ color: "#999" }}>
                                {t("settings.taskStatus.messages.not_choose")}
                              </div>
                            );
                          }

                          const color = item.color_code || "#ccc";
                          const name =
                            dataField === "task_status_id"
                              ? item.task_status_name
                              : item.task_priority_name;

                          try {
                            const hex = color.replace("#", "");
                            const r = parseInt(hex.substring(0, 2), 16);
                            const g = parseInt(hex.substring(2, 4), 16);
                            const b = parseInt(hex.substring(4, 6), 16);
                            const brightness =
                              (r * 299 + g * 587 + b * 114) / 1000;
                            const textColor =
                              brightness > 128 ? "#000" : "#fff";

                            return (
                              <div
                                style={{
                                  backgroundColor: color,
                                  color: textColor,
                                  width: "100%",
                                  height: "25px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  padding: "0 8px",
                                }}
                                title={name}
                              >
                                {name}
                              </div>
                            );
                          } catch {
                            return <div>{name}</div>;
                          }
                        };
                      }

                      return (
                        <Column
                          key={dataField}
                          dataField={dataField}
                          caption={caption}
                          visible={visible}
                          dataType={dataType}
                          width={width}
                          alignment={alignment}
                          cellRender={cellRender}
                        >
                          {required && <RequiredRule message={t("required")} />}
                          {lookup && <Lookup {...lookup} />}
                        </Column>
                      );
                    }
                  )}

                  <ColumnFixing enabled />
                  <Pager
                    visible={true}
                    allowedPageSizes={pageSizes}
                    showPageSizeSelector={true}
                  />
                  <Paging defaultPageSize={10} />
                </DataGrid>
              </>
            ),
          },
          // {
          //   title: t("analysis"),
          //   icon: "chart",
          //   content: "Analysis Content",
          // },
          {
            title: t("work_report"),
            icon: "plus",
            content: (
              <>
                <ToolbarTX className="toolbarPadding">
                  <Item location="before" style={{ padding: "56px" }}>
                    <Button
                      text={isWRCollapsed ? t("show") : t("hide")}
                      icon={isWRCollapsed ? "chevrondown" : "chevronup"}
                      onClick={handleToggleWRCollapse}
                      width="100%"
                    />
                  </Item>
                  <Item
                    location="after"
                    style={{ padding: "16px" }}
                    render={() => (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          icon="clear"
                          text={t("clear")}
                          type="varriant"
                          stylingMode="varriant"
                          onClick={handleClearWRFilter}
                        />
                        <Button
                          icon="filter"
                          text={t("filter")}
                          type="default"
                          stylingMode="contained"
                          onClick={handleApplyWRFilter}
                        />
                      </div>
                    )}
                  />
                  <br />
                </ToolbarTX>

                {!isWRCollapsed && (
                  <>
                    <div
                      className="responsive-filter-container"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "16px",
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div className="filter-item">
                        <LabeledField label={t("ID")}>
                          <TextBox
                            placeholder={t("ID")}
                            value={filterWorkReport.id}
                            showClearButton
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                id: e.value,
                              }))
                            }
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("wr_title")}>
                          <TextBox
                            placeholder={t("wr_title")}
                            value={filterWorkReport.title}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                title: e.value,
                              }))
                            }
                            showClearButton
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("person_in_charge")}>
                          <SelectBox
                            dataSource={usersActive}
                            valueExpr="id"
                            value={filterWorkReport.incharge_id}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                incharge_id: e.value,
                              }))
                            }
                            displayExpr="first_name"
                            placeholder={t("person_in_charge")}
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("date")}>
                          <DateBox
                            placeholder={t("date")}
                            value={filterWorkReport.report_date}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                report_date: e.value,
                              }))
                            }
                            dis
                            displayFormat="yyyy/MM/dd"
                          />
                        </LabeledField>
                      </div>

                      {/* <Item ratio={1}>
                        <LabeledField label={t("report_time")}>
                          <DateBox
                            placeholder={t("report_time")}
                            value={filterWorkReport.report_time}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                report_time: e.value,
                              }))
                            }
                            displayFormat="HH:mm:ss"
                            type="time"
                            useMaskBehavior={true}
                          />
                        </LabeledField>
                      </Item> */}
                    </div>

                    <div
                      className="responsive-filter-container"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "16px",
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div className="filter-item">
                        <LabeledField label={t("location")}>
                          <TextBox
                            placeholder={t("location")}
                            value={filterWorkReport.location}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                location: e.value,
                              }))
                            }
                            showClearButton
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("content")}>
                          <TextBox
                            placeholder={t("content")}
                            value={filterWorkReport.content}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                content: e.value,
                              }))
                            }
                            showClearButton
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("remark")}>
                          <TextBox
                            placeholder={t("remark")}
                            value={filterWorkReport.remark}
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                remark: e.value,
                              }))
                            }
                            showClearButton
                          />
                        </LabeledField>
                      </div>

                      <div className="filter-item">
                        <LabeledField label={t("is_active")}>
                          <SelectBox
                            items={[
                              { id: null, text: t("All") },
                              { id: 1, text: t("Active") },
                              { id: 0, text: t("Inactive") },
                            ]}
                            placeholder={t("is_active")}
                            valueExpr="id"
                            displayExpr="text"
                            value={filterWorkReport.is_active}
                            searchEnabled
                            onValueChanged={(e) =>
                              setFilterWorkReport((prev) => ({
                                ...prev,
                                is_active: e.value,
                              }))
                            }
                            width="100%"
                          />
                        </LabeledField>
                      </div>
                    </div>
                  </>
                )}

                <DataGrid
                  dataSource={workReportsByCompanyId}
                  filterValue={filterWorkReportValue}
                  keyExpr="id"
                  showBorders={true}
                  columnAutoWidth={true}
                  wordWrapEnabled={true}
                  rowAlternationEnabled={true}
                  width="100%"
                  onToolbarPreparing={onToolbarPreparingWR}
                  onRowInserting={handleRowInsertingWR}
                  onRowUpdating={handleRowUpdatingWR}
                  onRowRemoving={handleRowRemovingWR}
                  onInitNewRow={(e) => {
                    setIsAddingWR(true);
                    e.data.is_active = true;
                  }}
                  onEditingStart={(e) => {
                    setIsAddingWR(false);
                  }}
                >
                  <SearchPanel visible={true} highlightCaseSensitive={true} />
                  <Selection
                    mode="multiple"
                    selectAllMode="allPages"
                    showCheckBoxesMode="always"
                  />

                  <Editing
                    mode="popup"
                    allowUpdating
                    allowDeleting
                    allowAdding
                    useIcons
                  >
                    <Popup
                      title={t("wrMessages.add_edit_workReport")}
                      showTitle
                      maxWidth={window.innerWidth < 500 ? "90%" : 1000}
                      maxHeight={700}
                      dragEnabled={false}
                      closeOnOutsideClick
                      showCloseButton
                      resizeEnabled={false}
                      position="center"
                    />
                    <Form
                      labelLocation="top"
                      colCountByScreen={{ xs: 1, sm: 1, md: 1, lg: 1 }}
                    >
                      <Item itemType="group" colCount={1}>
                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 2, sm: 2, md: 5, lg: 5 }}
                          caption=""
                        >
                          <Item
                            dataField="id"
                            editorOptions={{
                              readOnly: true,
                            }}
                            visible={!isAddingWR}
                          />
                        </Item>
                        <Item dataField="title" />

                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                          caption=""
                        >
                          <Item
                            dataField="report_date"
                            editorType="dxDateBox"
                          />
                          <Item
                            dataField="report_time"
                            editorType="dxDateBox"
                            editorOptions={{
                              type: "time",
                              displayFormat: "HH:mm:ss",
                              interval: 30,
                              showClearButton: true,
                            }}
                          />
                        </Item>

                        <Item
                          itemType="group"
                          colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                          caption=""
                        >
                          <Item
                            dataField="company_id"
                            editorType="dxSelectBox"
                          />
                          <Item
                            dataField="incharge_id"
                            editorType="dxSelectBox"
                          />
                        </Item>

                        <Item dataField="location" />

                        <Item dataField="content" />
                        <Item dataField="remark" />
                        <Item dataField="is_printed" editorType="dxCheckBox" />
                        <Item dataField="is_active" editorType="dxCheckBox" />
                      </Item>
                    </Form>
                  </Editing>
                  <GroupPanel visible={false} />
                  <Grouping autoExpandAll={true} />
                  <FilterRow visible={true} />
                  <HeaderFilter visible={true} />
                  <Paging defaultPageSize={20} />
                  <Column
                    dataField="id"
                    caption={t("ID")}
                    width={60}
                    alignment="left"
                  />
                  <Column dataField="title" visible={false} groupIndex={0}>
                    <RequiredRule message={t("required")} />
                  </Column>
                  {/* Visible columns */}
                  <Column
                    dataField="report_date"
                    caption={t("date")}
                    dataType="date"
                    width={100}
                  />
                  <Column
                    dataField="report_time"
                    caption={t("time")}
                    dataType="time"
                    width={100}
                  />
                  <Column dataField="location" caption={t("location")} />
                  <Column dataField="company_id" caption={t("company")}>
                    <Lookup
                      dataSource={activeCompanies}
                      valueExpr="id"
                      displayExpr="company_name"
                    />
                  </Column>
                  <Column
                    dataField="incharge_id"
                    caption={t("person_in_charge")}
                  >
                    <Lookup
                      dataSource={usersActive}
                      valueExpr="id"
                      displayExpr="first_name"
                    />
                  </Column>
                  <Column
                    caption={t("is_printed")}
                    dataField="is_printed"
                    dataType="boolean"
                    alignment="center"
                    width={110}
                  />
                  <Column
                    caption={t("settings.common.fields.is_active")}
                    dataField="is_active"
                    dataType="boolean"
                    alignment="center"
                    width={100}
                  />
                  <Column
                    dataField="content"
                    caption={t("content")}
                    visible={false}
                  />
                  <Column
                    dataField="remark"
                    caption={t("remark")}
                    visible={false}
                  />
                  <Column
                    dataField="company_id"
                    caption={t("company")}
                    visible={false}
                  >
                    <Lookup
                      dataSource={activeCompanies}
                      valueExpr="id"
                      displayExpr="company_name"
                    />
                  </Column>

                  {/* Master Detail */}
                  <MasterDetail
                    enabled={true}
                    render={({ data }) => (
                      <div style={{ padding: "12px 16px", background: "#fff" }}>
                        <div style={{ marginBottom: "8px" }}>
                          <strong>{t("content")}</strong>
                          <br />
                          {data.content}
                        </div>
                        <div>
                          <strong>{t("remark")}</strong>
                          <br />
                          {data.remark}
                        </div>
                      </div>
                    )}
                  />
                  <ColumnFixing enabled />
                  <Pager
                    visible={true}
                    allowedPageSizes={pageSizes}
                    showPageSizeSelector={true}
                  />
                  <Paging defaultPageSize={20} />
                </DataGrid>
              </>
            ),
          },
          // { title: t("chat"), icon: "message", content: "Chat Content" },
        ]}
        swipeEnabled={false}
        showNavButtons={true}
        itemTitleRender={({ title, icon }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className={`dx-icon dx-icon-${icon}`} />
            <span>{title}</span>
          </div>
        )}
        itemComponent={({ data }) => (
          <div style={{ padding: "12px" }}>{data.content}</div>
        )}
      />
    </div>
  );
}
