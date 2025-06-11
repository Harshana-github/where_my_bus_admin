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
import { useTranslation } from "react-i18next";
import { useDepartmentStore } from "../../stores/useDepartmentStore";

const pageSizes = [10, 25, 50, 100];

const DepartmentPage = () => {
  const { t } = useTranslation();
  const [isAddMode, setIsAddMode] = useState(false);

  const departments = useDepartmentStore((state) => state.departments);
  const getAllDepartments = useDepartmentStore(
    (state) => state.getAllDepartments
  );
  const addDepartment = useDepartmentStore((state) => state.addDepartment);
  const updateDepartment = useDepartmentStore(
    (state) => state.updateDepartment
  );
  const deleteDepartment = useDepartmentStore(
    (state) => state.deleteDepartment
  );

  useEffect(() => {
    getAllDepartments();
  }, [getAllDepartments]);

  const handleRowInserting = async (e) => {
    const result = await addDepartment(e.data);
    if (result.isOk) {
      notify(t("settings.department.messages.add_success"), "success", 2000);
      await getAllDepartments();
    } else {
      notify(t("settings.department.messages.add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedData = {
      id: e.oldData.id,
      departments_name:
        e.newData.departments_name ?? e.oldData.departments_name ?? "",
      description: e.newData.description ?? e.oldData.description ?? "",
      is_active: e.newData.is_active ?? e.oldData.is_active ?? true,
    };
    const result = await updateDepartment({
      id: e.key,
      department: updatedData,
    });
    if (result.isOk) {
      notify(t("settings.department.messages.update_success"), "success", 2000);
      await getAllDepartments();
    } else {
      notify(t("settings.department.messages.update_error"), "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteDepartment(e.key);
    if (result.isOk) {
      notify(t("settings.department.messages.delete_success"), "success", 2000);
      await getAllDepartments();
    } else {
      notify(t("settings.department.messages.delete_error"), "error", 2000);
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
    <div className={"department-page"}>
      <DataGrid
        dataSource={departments}
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
            title={t("settings.department.messages.add_edit_department")}
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
              <Item dataField="departments_name" />
              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
          </Form>
        </Editing>
        <Column dataField="id" caption={t("ID")} width={60} alignment="left" />
        <Column
          caption={t("settings.department.fields.department_name")}
          dataField="departments_name"
          dataType="string"
          alignment="left"
        >
          <RequiredRule
            message={t("settings.department.messages.department_name_required")}
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

export default DepartmentPage;
