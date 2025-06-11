import { useState, useEffect, memo, useCallback } from "react";
import Box from "devextreme-react/box";
import { Item, RequiredRule } from "devextreme-react/form";
import TextBox from "devextreme-react/text-box";
import SelectBox from "devextreme-react/select-box";
import DateBox from "devextreme-react/date-box";
import Button from "devextreme-react/button";
import { Toolbar as ToolbarTX } from "devextreme-react/toolbar";
import {
  DataGrid,
  Column,
  Editing,
  ColumnFixing,
  Pager,
  Paging,
  Popup,
  Form,
  Lookup,
  Selection,
  FilterRow,
  SearchPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import { useTranslation } from "react-i18next";
import { useDepartmentStore } from "../../stores/useDepartmentStore";
import { useTaskPriorityStore } from "../../stores/useTaskPriorityStore";
import { useTaskStatusStore } from "../../stores/useTaskStatusStore";
import { useUserStore } from "../../stores/useUserStore";
import { useTaskStore } from "../../stores/useTaskStore";
import { useCompanyStore } from "../../stores/useCompanyStore";
import notify from "devextreme/ui/notify";
import moment from "moment";

import "./TodoListPage.scss";

const LabeledField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ marginBottom: "4px", fontWeight: "500" }}>{label}</label>
    {children}
  </div>
);

const pageSizes = [10, 25, 50, 100];

const TodoListPage = () => {
  const { t } = useTranslation();

  const tasks = useTaskStore((state) => state.tasks);
  const getAllTasks = useTaskStore((state) => state.getAllTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const activeDepartments = useDepartmentStore(
    (state) => state.activeDepartments
  );
  const getActiveDepartments = useDepartmentStore(
    (state) => state.getActiveDepartments
  );

  const activeCompanies = useCompanyStore((state) => state.activeCompanies);
  const getActiveCompanies = useCompanyStore(
    (state) => state.getActiveCompanies
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

  const handleToggleCollapse = () => setIsTodoListCollapsed((prev) => !prev);
  const [isAdding, setIsAdding] = useState(false);
  const [isTodoListCollapsed, setIsTodoListCollapsed] = useState(false);
  const [filterTodoListValue, setFilterTodoListValue] = useState([]);
  const [filterTodoList, setFilterTodoList] = useState({
    id: null,
    task_name: "",
    department_id: null,
    incharge_id: null,
    content: "",
    start_date: "",
    due_date: "",
    task_status_id: null,
    description: "",
    task_priority_id: null,
    is_active: null,
    is_expired: null,
  });

  const handleApplyTodoListFilter = () => {
    const filterConditions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterTodoList.is_expired === 0) {
      filterConditions.push([
        ["due_date", "<", moment(today).format("YYYY/MM/DD")],
      ]);
    } else if (filterTodoList.is_expired === 1) {
      filterConditions.push([
        ["due_date", ">=", moment(today).format("YYYY/MM/DD")],
      ]);
    }

    if (filterTodoList.id)
      filterConditions.push(["id", "=", filterTodoList.id]);
    if (filterTodoList.task_name)
      filterConditions.push([
        "task_name",
        "contains",
        filterTodoList.task_name,
      ]);
    if (filterTodoList.company_id)
      filterConditions.push(["company_id", "=", filterTodoList.company_id]);
    if (filterTodoList.department_id)
      filterConditions.push([
        "department_id",
        "=",
        filterTodoList.department_id,
      ]);
    if (filterTodoList.incharge_id)
      filterConditions.push(["incharge_id", "=", filterTodoList.incharge_id]);
    if (filterTodoList.start_date)
      filterConditions.push([
        "start_date",
        "contains",
        filterTodoList.start_date,
      ]);
    if (filterTodoList.content)
      filterConditions.push(["content", "contains", filterTodoList.content]);
    if (filterTodoList.due_date)
      filterConditions.push(["due_date", "contains", filterTodoList.due_date]);
    if (filterTodoList.task_status_id)
      filterConditions.push([
        "task_status_id",
        "=",
        filterTodoList.task_status_id,
      ]);
    if (filterTodoList.description)
      filterConditions.push([
        "description",
        "contains",
        filterTodoList.description,
      ]);
    if (filterTodoList.task_priority_id)
      filterConditions.push([
        "task_priority_id",
        "contains",
        filterTodoList.task_priority_id,
      ]);
    if (filterTodoList.is_active === 1 || filterTodoList.is_active === 0) {
      filterConditions.push(["is_active", "=", filterTodoList.is_active]);
    }

    if (filterConditions.length > 1) {
      setFilterTodoListValue(["and", ...filterConditions]);
    } else if (filterConditions.length === 1) {
      setFilterTodoListValue(filterConditions[0]);
    } else {
      setFilterTodoListValue([]);
    }
  };

  const handleClearTodoListFilter = () => {
    setFilterTodoList({
      id: null,
      task_name: "",
      department_id: null,
      incharge_id: null,
      content: "",
      start_date: "",
      due_date: "",
      task_status_id: null,
      description: "",
      task_priority_id: null,
      company_id: null,
      is_active: null,
      is_expired: null,
    });
    setFilterTodoListValue([]);
  };

  const handleRowInserting = async (e) => {
    e.data.start_date = moment(e.data.start_date).format("YYYY/MM/DD");
    e.data.due_date = moment(e.data.due_date).format("YYYY/MM/DD");
    const result = await addTask(e.data);
    if (result.isOk) {
      notify(t("cdMessages.task_added_successfully"), "success", 2000);
      await getAllTasks();
    } else {
      notify(t("cdMessages.task_add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
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
    const company_id = e.newData.company_id ?? e.oldData.company_id ?? true;

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
      await getAllTasks();
    } else {
      notify(t("cdMessages.task_update_error"), "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteTask(e.key);
    if (result.isOk) {
      notify(t("cdMessages.task_removed_successfully"), "success", 2000);
      await getAllTasks();
    } else {
      notify(t("cdMessages.task_remove_error"), "error", 2000);
    }
  };

  useEffect(() => {
    getAllTasks();
    getActiveDepartments();
    getActiveTaskPriorities();
    getActiveTaskStatuses();
    getActiveUsers();
    getActiveCompanies();
  }, [
    getAllTasks,
    getActiveDepartments,
    getActiveTaskPriorities,
    getActiveTaskStatuses,
    getActiveUsers,
    getActiveCompanies,
  ]);

  const onToolbarPreparing = useCallback((e) => {
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

  return (
    <div className={"todo-list-page"}>
      <ToolbarTX className="toolbarPadding">
        <Item location="before" style={{ padding: "56px" }}>
          <Button
            text={isTodoListCollapsed ? t("show") : t("hide")}
            icon={isTodoListCollapsed ? "chevrondown" : "chevronup"}
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
                onClick={handleClearTodoListFilter}
              />
              <Button
                icon="filter"
                text={t("filter")}
                type="default"
                stylingMode="contained"
                onClick={handleApplyTodoListFilter}
              />
            </div>
          )}
        />
        <br />
      </ToolbarTX>

      {!isTodoListCollapsed && (
        <>
          <Box
            direction="row"
            width="100%"
            gap={10}
            marginTop={10}
            style={{ padding: "16px" }}
            className="boxBackround"
          >
            <Item ratio={0.5}>
              <LabeledField label={t("ID")}>
                <TextBox
                  placeholder={t("ID")}
                  value={filterTodoList.id}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      id: e.value,
                    }))
                  }
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("company")}>
                <SelectBox
                  items={activeCompanies}
                  value={filterTodoList.company_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      company_id: e.value,
                    }))
                  }
                  placeholder={t("company")}
                  valueExpr="id"
                  displayExpr="company_name"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("task_name")}>
                <TextBox
                  placeholder={t("task_name")}
                  value={filterTodoList.task_name}
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      task_name: e.value,
                    }))
                  }
                  showClearButton
                  required="true"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("person_in_charge")}>
                <SelectBox
                  items={usersActive}
                  value={filterTodoList.incharge_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      incharge_id: e.value,
                    }))
                  }
                  placeholder={t("person_in_charge")}
                  valueExpr="id"
                  displayExpr="first_name"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("start_date")}>
                <DateBox
                  placeholder={t("start_date")}
                  value={filterTodoList.start_date}
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      start_date: e.value,
                    }))
                  }
                  displayFormat="yyyy/MM/dd"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("due_date")}>
                <DateBox
                  placeholder={t("due_date")}
                  value={filterTodoList.due_date}
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      due_date: e.value,
                    }))
                  }
                  displayFormat="yyyy/MM/dd"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
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
                  value={filterTodoList.is_expired}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      is_expired: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </Item>
          </Box>

          <Box
            direction="row"
            width="100%"
            gap={16}
            marginTop={20}
            style={{ padding: "16px" }}
            className="boxBackround"
          >
            <Item ratio={1}>
              <LabeledField label={t("department")}>
                <SelectBox
                  items={activeDepartments}
                  value={filterTodoList.department_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      department_id: e.value,
                    }))
                  }
                  placeholder={t("department")}
                  valueExpr="id"
                  displayExpr="departments_name"
                />
              </LabeledField>
            </Item>
            <Item ratio={1}>
              <LabeledField label={t("status")}>
                <SelectBox
                  items={activeTaskStatuses}
                  placeholder={t("status")}
                  value={filterTodoList.task_status_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      task_status_id: e.value,
                    }))
                  }
                  valueExpr="id"
                  displayExpr="task_status_name"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("task_priority")}>
                <SelectBox
                  items={activeTaskPriorities}
                  placeholder={t("task_priority")}
                  value={filterTodoList.task_priority_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      task_priority_id: e.value,
                    }))
                  }
                  valueExpr="id"
                  displayExpr="task_priority_name"
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("content")}>
                <TextBox
                  value={filterTodoList.content}
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      content: e.value,
                    }))
                  }
                  placeholder={t("content")}
                  showClearButton
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("details")}>
                <TextBox
                  placeholder={t("details")}
                  value={filterTodoList.description}
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      description: e.value,
                    }))
                  }
                  showClearButton
                />
              </LabeledField>
            </Item>

            <Item ratio={1}>
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
                  value={filterTodoList.is_active}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterTodoList((prev) => ({
                      ...prev,
                      is_active: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </Item>
          </Box>
        </>
      )}

      <DataGrid
        dataSource={tasks}
        filterValue={filterTodoListValue}
        keyExpr="id"
        showBorders={true}
        showRowLines
        rowAlternationEnabled={true}
        width="100%"
        onToolbarPreparing={onToolbarPreparing}
        onRowInserting={handleRowInserting}
        onRowUpdating={handleRowUpdating}
        onRowRemoving={handleRowRemoving}
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

        <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons>
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
              <Item
                itemType="group"
                colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                caption=""
              >
                <Item dataField="task_name" />
                <Item dataField="company_id" editorType="dxSelectBox" />
              </Item>

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
                <Item dataField="department_id" editorType="dxSelectBox" />
                <Item dataField="incharge_id" editorType="dxSelectBox" />
              </Item>

              <Item
                itemType="group"
                colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                caption=""
              >
                <Item dataField="task_priority_id" editorType="dxSelectBox" />
                <Item dataField="task_status_id" editorType="dxSelectBox" />
              </Item>

              <Item dataField="description" />
              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
          </Form>
        </Editing>
        <Column dataField="id" caption={t("ID")} width={60} alignment="left" />
        <Column dataField="company_id" caption={t("company")} width={200}>
          <Lookup
            dataSource={activeCompanies}
            valueExpr="id"
            displayExpr="company_name"
          />
        </Column>
        <Column dataField="task_name" caption={t("task_name")} width={200}>
          <RequiredRule message={t("required")} />
        </Column>
        <Column
          dataField="task_priority_id"
          caption={t("task_priority")}
          width={120}
          cellRender={({ data }) => {
            const priority = activeTaskPriorities.find(
              (p) => p.id === data.task_priority_id
            );

            if (!priority) {
              return (
                <div style={{ color: "#999" }}>
                  {t("settings.taskStatus.messages.not_choose")}
                </div>
              );
            }

            const color = priority.color_code || "#ccc";
            const name = priority.task_priority_name || "";

            try {
              const hex = color.replace("#", "");
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              const textColor = brightness > 128 ? "#000" : "#fff";

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
                  }}
                  title={name}
                >
                  {name}
                </div>
              );
            } catch {
              return <div>{name}</div>;
            }
          }}
        >
          <Lookup
            dataSource={activeTaskPriorities}
            valueExpr="id"
            displayExpr="task_priority_name"
          />
        </Column>
        <Column dataField="department_id" caption={t("department")} width={150}>
          <Lookup
            dataSource={activeDepartments}
            valueExpr="id"
            displayExpr="departments_name"
          />
        </Column>
        <Column
          dataField="incharge_id"
          caption={t("person_in_charge")}
          width={150}
        >
          <Lookup
            dataSource={usersActive}
            valueExpr="id"
            displayExpr="first_name"
          />
        </Column>
        <Column
          dataField="start_date"
          caption={t("start_date")}
          dataType="date"
          width={90}
        />
        <Column
          dataField="due_date"
          caption={t("due_date")}
          dataType="date"
          width={90}
        />
        <Column
          caption={t("settings.common.fields.is_active")}
          dataField="is_active"
          dataType="boolean"
          alignment="center"
          width={90}
        />
        <Column
          dataField="task_status_id"
          caption={t("status")}
          width={150}
          cellRender={({ data }) => {
            const status = activeTaskStatuses.find(
              (s) => s.id === data.task_status_id
            );

            if (!status) {
              return (
                <div style={{ color: "#999" }}>
                  {t("settings.taskStatus.messages.not_choose")}
                </div>
              );
            }

            const color = status.color_code || "#ccc";
            const name = status.task_status_name || "";

            try {
              const hex = color.replace("#", "");
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              const textColor = brightness > 128 ? "#000" : "#fff";

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
                  }}
                  title={name}
                >
                  {name}
                </div>
              );
            } catch {
              return <div>{name}</div>;
            }
          }}
        >
          <Lookup
            dataSource={activeTaskStatuses}
            valueExpr="id"
            displayExpr="task_status_name"
          />
        </Column>

        <Column dataField="content" caption={t("content")} width={150} />
        <Column dataField="description" caption={t("details")} width={200} />

        <ColumnFixing enabled />
        <Pager
          visible={true}
          allowedPageSizes={pageSizes}
          showPageSizeSelector={true}
        />
        <Paging defaultPageSize={20} />
      </DataGrid>
    </div>
  );
};
export default TodoListPage;
