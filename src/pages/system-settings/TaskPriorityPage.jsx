import { useCallback, useEffect, useState } from "react";
import {
  DataGrid,
  Column,
  Editing,
  Popup,
  Form,
  RequiredRule,
  SearchPanel,
  Pager,
  Paging,
  FilterRow,
  HeaderFilter,
} from "devextreme-react/data-grid";
import { Item } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { useTaskPriorityStore } from "../../stores/useTaskPriorityStore";
import { useTranslation } from "react-i18next";

const pageSizes = [10, 25, 50, 100];

const TaskPriorityPage = () => {
  const { t } = useTranslation();
  const [isAddMode, setIsAddMode] = useState(false);

  const taskPriorities = useTaskPriorityStore((state) => state.taskPriorities);
  const getAllTaskPriorities = useTaskPriorityStore(
    (state) => state.getAllTaskPriorities
  );
  const addTaskPriority = useTaskPriorityStore(
    (state) => state.addTaskPriority
  );
  const updateTaskPriority = useTaskPriorityStore(
    (state) => state.updateTaskPriority
  );
  const deleteTaskPriority = useTaskPriorityStore(
    (state) => state.deleteTaskPriority
  );

  useEffect(() => {
    getAllTaskPriorities();
  }, [getAllTaskPriorities]);

  const handleRowInserting = async (e) => {
    const result = await addTaskPriority(e.data);
    if (result.isOk) {
      notify(t("settings.taskPriority.messages.add_success"), "success", 2000);
      await getAllTaskPriorities();
    } else {
      notify(t("settings.taskPriority.messages.add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedData = {
      id: e.oldData.id,
      task_priority_name:
        e.newData.task_priority_name ?? e.oldData.task_priority_name ?? "",
      color_code: e.newData.color_code ?? e.oldData.color_code ?? "",
      description: e.newData.description ?? e.oldData.description ?? "",
      is_active: e.newData.is_active ?? e.oldData.is_active ?? true,
    };
    const result = await updateTaskPriority({
      id: e.key,
      taskPriority: updatedData,
    });
    if (result.isOk) {
      notify(
        t("settings.taskPriority.messages.update_success"),
        "success",
        2000
      );
      await getAllTaskPriorities();
    } else {
      notify(t("settings.taskPriority.messages.update_error"), "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteTaskPriority(e.key);
    if (result.isOk) {
      notify(
        t("settings.taskPriority.messages.delete_success"),
        "success",
        2000
      );
      await getAllTaskPriorities();
    } else {
      notify(t("settings.taskPriority.messages.delete_error"), "error", 2000);
    }
  };

  const onToolbarPreparing = useCallback((e) => {
    const toolbarItems = e.toolbarOptions.items;
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
    <div className="task-priority-page">
      <DataGrid
        dataSource={taskPriorities}
        keyExpr="id"
        showBorders={true}
        showRowLines
        rowAlternationEnabled
        onToolbarPreparing={onToolbarPreparing}
        onRowInserting={handleRowInserting}
        onRowUpdating={handleRowUpdating}
        onRowRemoving={handleRowRemoving}
        onInitNewRow={(e) => {
          setIsAddMode(true);
          e.data.is_active = true;
        }}
        onEditingStart={(e) => {
          setIsAddMode(false);
        }}
      >
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} highlightCaseSensitive={true} />
        <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons>
          <Popup
            title={t("settings.taskPriority.messages.add_edit_task_priority")}
            showTitle={true}
            width={500}
            height={300}
          />
          <Form colCount={1}>
            <Item itemType="group" colCount={1}>
              <Item
                itemType="group"
                colCountByScreen={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                caption=""
              >
                <Item
                  dataField="id"
                  editorOptions={{
                    readOnly: true,
                  }}
                  visible={!isAddMode}
                />
              </Item>
              <Item dataField="task_priority_name" />
              <Item dataField="color_code" editorType="dxColorBox" />
              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
          </Form>
        </Editing>
        <Column dataField="id" caption={t("ID")} width={60} alignment="left" />
        <Column
          caption={t("settings.taskPriority.fields.priority_name")}
          dataField="task_priority_name"
          dataType="string"
          alignment="left"
        >
          <RequiredRule
            message={t("settings.taskPriority.messages.priority_name_required")}
          />
        </Column>
        <Column
          dataField="color_code"
          caption={t("settings.taskStatus.fields.color_code")}
          alignment="left"
          width={150}
          cellRender={({ data }) => {
            const color = data.color_code;

            if (!color) {
              return (
                <div style={{ color: "#999" }}>
                  {t("settings.taskStatus.messages.not_choose")}
                </div>
              );
            }

            try {
              const hex = color.replace("#", "");

              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);

              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              const textColor = brightness > 128 ? "#000" : "#fff";

              const handleCopy = () => {
                navigator.clipboard.writeText(color).then(() => {
                  notify(
                    `${color} ${t("settings.taskStatus.messages.copied")}`,
                    "success",
                    2000
                  );
                });
              };

              return (
                <div
                  onClick={handleCopy}
                  style={{
                    backgroundColor: color,
                    color: textColor,
                    width: "80px",
                    height: "25px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  title={`${color} - Click to copy`}
                >
                  {color}
                </div>
              );
            } catch (e) {
              return (
                <div style={{ color: "#999" }}>
                  {t("settings.taskStatus.messages.invalid")}
                </div>
              );
            }
          }}
        >
          <RequiredRule
            message={t("settings.taskStatus.messages.color_code_required")}
          />
        </Column>

        <Column
          caption={t("settings.common.fields.is_active")}
          dataField="is_active"
          dataType="boolean"
          alignment="center"
          width={120}
        />

        <Pager
          visible={true}
          allowedPageSizes={pageSizes}
          showPageSizeSelector={true}
        />
        <Paging defaultPageSize={10} />
      </DataGrid>
    </div>
  );
};

export default TaskPriorityPage;
