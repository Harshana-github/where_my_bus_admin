import { memo, useCallback, useEffect, useState } from "react";
import DataGrid, {
  Column,
  Editing,
  Popup,
  Paging,
  Lookup,
  Form,
  Pager,
  SearchPanel,
  FilterRow,
  HeaderFilter,
} from "devextreme-react/data-grid";
import "./ViewUserPage.scss";
import { useUserStore } from "../../stores/useUserStore";
import { useUserLevelStore } from "../../stores/useUserLevelStore";
import { Item } from "devextreme-react/form";
import { useTranslation } from "react-i18next";
import notify from "devextreme/ui/notify";
import { Toolbar as ToolbarTX } from "devextreme-react/toolbar";
import Button from "devextreme-react/button";
import TextBox from "devextreme-react/text-box";
import SelectBox from "devextreme-react/select-box";

const LabeledField = memo(({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ marginBottom: 4, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
));

const ViewUserPage = () => {
  const { t } = useTranslation();

  const [isAddMode, setIsAddMode] = useState(false);
  const [isUserCollapsed, setIsUserCollapsed] = useState(false);
  const [filterUsersValue, setFilterUsersValue] = useState([]);
  const [filterUsers, setFilterUsers] = useState({
    id: null,
    user_level_id: null,
    first_name: "",
    last_name: "",
    email: "",
    is_active: null,
  });

  // Use selectors to avoid unnecessary re-renders
  const users = useUserStore((state) => state.users);
  const userLevels = useUserLevelStore((state) => state.userLevels);
  const getAllUserLevels = useUserLevelStore((state) => state.getAllUserLevels);
  const getAllUsers = useUserStore((state) => state.getAllUsers);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const pageSizes = [10, 25, 50, 100];

  useEffect(() => {
    getAllUsers();
    getAllUserLevels();
  }, []);

  const handleRowInserting = async (e) => {
    const result = await addUser(e.data);
    if (result.isOk) {
      notify(t("viewUser.messages.user_added_successfully"), "success", 2000);
      await getAllUsers();
    } else {
      notify(t("viewUser.messages.user_add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedUser = { ...e.oldData, ...e.newData };

    const result = await updateUser({ id: e.key, user: updatedUser });
    if (result.isOk) {
      notify(t("viewUser.messages.user_updated_successfully"), "success", 2000);
      await getAllUsers();
    } else {
      notify(t("viewUser.messages.user_update_error"), "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteUser(e.key);
    if (result.isOk) {
      notify(t("viewUser.messages.user_removed_successfully"), "success", 2000);
      await getAllUsers();
    } else {
      notify(t("viewUser.messages.user_remove_error"), "error", 2000);
    }
  };

  const handleApplyUserFilter = () => {
    const filterConditions = [];
    if (filterUsers.id) filterConditions.push(["id", "=", filterUsers.id]);
    if (filterUsers.user_level_id)
      filterConditions.push(["user_level_id", "=", filterUsers.user_level_id]);
    if (filterUsers.first_name)
      filterConditions.push(["first_name", "contains", filterUsers.first_name]);
    if (filterUsers.last_name)
      filterConditions.push(["last_name", "contains", filterUsers.last_name]);
    if (filterUsers.email)
      filterConditions.push(["email", "contains", filterUsers.email]);
    if (filterUsers.is_active === 1 || filterUsers.is_active === 0) {
      filterConditions.push(["is_active", "=", filterUsers.is_active]);
    }

    if (filterConditions.length > 1) {
      setFilterUsersValue(["and", ...filterConditions]);
    } else if (filterConditions.length === 1) {
      setFilterUsersValue(filterConditions[0]);
    } else {
      setFilterUsersValue([]);
    }
  };

  const handleClearUserFilter = () => {
    setFilterUsers({
      id: null,
      user_level_id: null,
      first_name: "",
      last_name: "",
      email: "",
      is_active: null,
    });
    setFilterUsersValue([]);
  };

  const handleToggleCollapse = () => setIsUserCollapsed((prev) => !prev);

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
        text: t("viewUser.common.add_user"),
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

  return (
    <div className={"view-user-page"}>
      <ToolbarTX className="toolbarPadding">
        <Item location="before" style={{ padding: "16px" }}>
          <Button
            text={isUserCollapsed ? t("show") : t("hide")}
            icon={isUserCollapsed ? "chevrondown" : "chevronup"}
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
                type="normal"
                onClick={handleClearUserFilter}
              />
              <Button
                icon="filter"
                text={t("filter")}
                type="default"
                onClick={handleApplyUserFilter}
              />
            </div>
          )}
        />
      </ToolbarTX>

      {!isUserCollapsed && (
        <>
          <div
            className="responsive-filter-container"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              padding: "16px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div className="filter-item">
              <LabeledField label={t("ID")}>
                <TextBox
                  placeholder={t("ID")}
                  value={filterUsers.id}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterUsers((prev) => ({
                      ...prev,
                      id: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("viewUser.fields.user_level")}>
                <SelectBox
                  items={userLevels}
                  placeholder={t("viewUser.fields.user_level")}
                  valueExpr="id"
                  displayExpr="name"
                  value={filterUsers.user_level_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterUsers((prev) => ({
                      ...prev,
                      user_level_id: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("viewUser.fields.first_name")}>
                <TextBox
                  placeholder={t("viewUser.fields.first_name")}
                  value={filterUsers.first_name}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterUsers((prev) => ({
                      ...prev,
                      first_name: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("viewUser.fields.last_name")}>
                <TextBox
                  placeholder={t("viewUser.fields.last_name")}
                  value={filterUsers.last_name}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterUsers((prev) => ({
                      ...prev,
                      last_name: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("email")}>
                <TextBox
                  placeholder={t("email")}
                  value={filterUsers.email}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterUsers((prev) => ({ ...prev, email: e.value }))
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
                  value={filterUsers.is_active}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterUsers((prev) => ({
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
        dataSource={users}
        keyExpr="id"
        showBorders={true}
        showRowLines
        rowAlternationEnabled
        width="100%"
        filterValue={filterUsersValue}
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
        <Paging enabled={false} />
        <Editing
          mode="popup"
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={true}
          useIcons
        >
          <Popup
            title={t("viewUser.common.user")}
            showTitle={true}
            width={500}
            height={500}
          />
          <Form colCount={1}>
            <Item
              dataField="id"
              editorOptions={{ readOnly: true }}
              visible={!isAddMode}
            />
            <Item
              dataField="first_name"
              caption={t("viewUser.fields.first_name")}
              isRequired={true}
              validationRules={[
                {
                  type: "required",
                  message: t("viewUser.messages.first_name_required"),
                },
                {
                  type: "stringLength",
                  max: 255,
                  message: t("viewUser.messages.stringLength"),
                },
              ]}
            />
            <Item
              dataField="last_name"
              caption={t("viewUser.fields.last_name")}
              validationRules={[
                {
                  type: "stringLength",
                  max: 255,
                  message: t("viewUser.messages.stringLength"),
                },
              ]}
            />
            <Item
              dataField="contact_number"
              caption={t("viewUser.fields.contact_number")}
              validationRules={[
                {
                  type: "stringLength",
                  max: 255,
                  message: t("viewUser.messages.stringLength"),
                },
              ]}
            />
            <Item
              dataField="email"
              caption={t("viewUser.fields.email")}
              isRequired={true}
              validationRules={[
                {
                  type: "required",
                  message: t("viewUser.messages.email_required"),
                },
                {
                  type: "email",
                  message: t("viewUser.messages.email"),
                },
                // Unique validation should be handled by backend, but you can show error on duplicate
              ]}
            />
            <Item
              dataField="password"
              caption={t("viewUser.fields.password")}
              isRequired={isAddMode ? true : false}
              editorOptions={{ mode: "password" }}
              // validationRules={[
              //   {
              //     type: "required",
              //     message: t("viewUser.messages.password_required"),
              //   },
              //   {
              //     type: "stringLength",
              //     min: 8,
              //     message: t("viewUser.messages.minLength"),
              //   },
              // ]}
              // validationRules={(options) => {
              //   // Add: required and min 8 chars
              //   if (options && options.data && options.data.__isNewRow) {
              //     return [
              //       {
              //         type: "required",
              //         message: t("viewUser.messages.password_required"),
              //       },
              //       {
              //         type: "stringLength",
              //         min: 8,
              //         message: t("viewUser.messages.minLength"),
              //       },
              //     ];
              //   }
              //   // Update: only validate if not empty
              //   return [
              //     {
              //       type: "custom",
              //       validationCallback: (e) => {
              //         return !e.value || e.value.length >= 8;
              //       },
              //       message: t("viewUser.messages.minLength"),
              //     },
              //   ];
              // }}
              validationRules={(options) => {
                if (options && options.data && options.data.__isNewRow) {
                  // Only validate for new rows
                  return [
                    {
                      type: "required",
                      message: t("viewUser.messages.password_required"),
                    },
                    {
                      type: "stringLength",
                      min: 8,
                      message: t("viewUser.messages.minLength"),
                    },
                  ];
                }
                // For updates, only check if the password is not empty and meet the min length requirement
                return [
                  {
                    type: "custom",
                    validationCallback: (e) => {
                      // If it's empty, the validation will pass, as it allows the user to update without changing the password
                      return !e.value || e.value.length >= 8;
                    },
                    message: t("viewUser.messages.minLength"),
                  },
                ];
              }}
            />
            <Item
              dataField="user_level_id"
              caption={t("viewUser.fields.user_level")}
              isRequired={true}
              validationRules={[
                {
                  type: "required",
                  message: t("viewUser.messages.user_level_required"),
                },
              ]}
            />
            <Item
              dataField="is_active"
              caption={t("viewUser.fields.is_active")}
              editorType="dxCheckBox"
              // editorType="dxSwitch"
              // editorOptions={{
              //   value: true,
              //   switchedOnText: t("viewUser.fields.on"),
              //   switchedOffText: t("viewUser.fields.off"),
              // }}
            />
          </Form>
        </Editing>
        <Column
          dataField="id"
          visible={true}
          caption={t("ID")}
          width={70}
          alignment="left"
        />
        <Column
          caption={t("viewUser.fields.name")}
          calculateCellValue={(rowData) =>
            `${rowData.first_name || ""} ${rowData.last_name || ""}`.trim()
          }
          allowEditing={false}
          width={200}
        />
        <Column
          dataField="first_name"
          visible={false}
          caption={t("viewUser.fields.first_name")}
        />
        <Column
          dataField="last_name"
          visible={false}
          caption={t("viewUser.fields.last_name")}
        />
        <Column
          dataField="contact_number"
          caption={t("viewUser.fields.contact_number")}
          width={200}
        />
        <Column
          dataField="email"
          caption={t("viewUser.fields.email")}
          minWidth={200}
        />
        <Column
          dataField="password"
          visible={false}
          caption={t("viewUser.fields.password")}
          validationRules={
            isAddMode
              ? [
                  {
                    type: "stringLength",
                    min: 8,
                    message: t("viewUser.messages.minLength"),
                  },
                ]
              : []
          }
        />

        {/* <Column
          dataField="password"
          visible={false}
          caption={t("viewUser.fields.password")}
        /> */}
        {/* <Column
          dataField="user_level_name"
          allowEditing={false}
          caption={t("viewUser.fields.user_level")}
        /> */}
        <Column
          dataField="user_level_id"
          caption={t("viewUser.fields.user_level")}
          width={125}
        >
          <Lookup dataSource={userLevels} valueExpr="id" displayExpr="name" />
        </Column>
        <Column
          dataField="is_active"
          dataType="boolean"
          caption={t("viewUser.fields.is_active")}
          width={100}
        />
        <Column
          dataField="created_date"
          dataType="date"
          caption={t("viewUser.fields.created_date")}
          allowEditing={false}
          width={100}
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

export default ViewUserPage;
