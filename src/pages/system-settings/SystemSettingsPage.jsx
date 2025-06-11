import { useState, useEffect, useCallback } from "react";
import DataGrid, {
  Column,
  Editing,
  Pager,
  Paging,
  RequiredRule,
  SearchPanel,
  Popup,
  Form,
  CustomRule,
  FilterRow,
  HeaderFilter,
  Button,
} from "devextreme-react/data-grid";
import { useTranslation } from "react-i18next";
import notify from "devextreme/ui/notify";
import { Item } from "devextreme-react/form";

import SettingsTabPanel from "../../components/settings-tab-panel/SettingsTabPanel";
import { useUserLevelStore } from "../../stores/useUserLevelStore";

import "./SystemSettingsPage.scss";
import { useUserStore } from "../../stores/useUserStore";
import { useTownStore } from "../../stores/useTownStore";
import { useBusStore } from "../../stores/useBusStore";

const pageSizes = [10, 25, 50, 100];

const SystemSettingsPage = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState();
  const [isAddMode, setIsAddMode] = useState(false);

  const userLevels = useUserLevelStore((state) => state.userLevels);
  const addUserLevel = useUserLevelStore((state) => state.addUserLevel);
  const getAllUserLevels = useUserLevelStore((state) => state.getAllUserLevels);
  const updateUserLevel = useUserLevelStore((state) => state.updateUserLevel);
  const deleteUserLevel = useUserLevelStore((state) => state.deleteUserLevel);
  const getUserModules = useUserStore((state) => state.getUserModules);
  const getAllBuses = useBusStore((state) => state.getAllBuses);
  const buses = useBusStore((state) => state.buses);

  useEffect(() => {
    if (!selectedTab) {
      setSelectedTab("defaultTab");
    }
  }, [selectedTab]);

  useEffect(() => {
    getAllUserLevels();
    getAllBuses();
  }, [getAllUserLevels, getUserModules, getAllBuses]);

  const handleRowInserting = async (e) => {
    const result = await addUserLevel(e.data);
    if (result.isOk) {
      notify(
        t("settings.userLevel.messages.user_level_added_successfully"),
        "success",
        2000
      );
      await getAllUserLevels();
    } else {
      notify(
        t("settings.userLevel.messages.user_level_add_error"),
        "error",
        2000
      );
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedData = { ...e.oldData, ...e.newData };

    const result = await updateUserLevel({ id: e.key, userLevel: updatedData });
    if (result.isOk) {
      notify(
        t("settings.userLevel.messages.user_level_updated_successfully"),
        "success",
        2000
      );
      await getAllUserLevels();
    } else {
      notify(
        t("settings.userLevel.messages.user_level_update_error"),
        "error",
        2000
      );
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteUserLevel(e.key);
    if (result.isOk) {
      notify(
        t("settings.userLevel.messages.user_level_removed_successfully"),
        "success",
        2000
      );
      await getAllUserLevels();
    } else {
      notify(
        t("settings.userLevel.messages.user_level_remove_error"),
        "error",
        2000
      );
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
    <div className={"system-settings-page"}>
      <SettingsTabPanel />
      <DataGrid
        dataSource={buses}
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
        <Editing
          mode="popup"
          allowUpdating={true}
          allowDeleting={true}
          allowAdding={true}
          useIcons
        >
          <Popup
            title={t("settings.userLevel.messages.add_edit_system_settings")}
            showTitle={true}
            width={500}
            height={300}
          />
          <Form colCount={1}>
            <Item itemType="group">
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

              <Item dataField="name" />
              <Item dataField="description" />
              <Item dataField="is_active" />
            </Item>
          </Form>
        </Editing>
        <Column dataField="id" caption={t("ID")} width={60} alignment="left" />
        <Column
          caption={t("Bus Number")}
          dataField="bus_number"
          dataType="string"
          alignment="left"
        >
        </Column>
        <Column
          caption={t("Registraion ID")}
          dataField="registration_id"
          dataType="string"
          alignment="left"
        />
        <Column
          caption={t("settings.common.fields.is_active")}
          dataField="is_active"
          dataType="boolean"
          alignment="center"
          width={120}
        />
        <Column type="buttons" width={120} alignment="center">
          <Button name="edit" />
          <Button name="delete" />
        </Column>

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

export default SystemSettingsPage;
