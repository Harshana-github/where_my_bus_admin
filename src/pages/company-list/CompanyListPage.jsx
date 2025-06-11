import React, { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Item } from "devextreme-react/form";
import Box, { Item as ItemBox } from "devextreme-react/box";
import { Toolbar as ToolbarTX } from "devextreme-react/toolbar";
import TextBox from "devextreme-react/text-box";
import { EmailRule } from "devextreme-react/validator";
import DataGrid, {
  Column,
  ColumnFixing,
  Editing,
  Pager,
  Paging,
  RequiredRule,
  SearchPanel,
  Popup,
  Form,
  Lookup,
  Selection,
  FilterRow,
  HeaderFilter,
} from "devextreme-react/data-grid";
import Button from "devextreme-react/button";
import SelectBox from "devextreme-react/select-box";
import notify from "devextreme/ui/notify";
import { useTranslation } from "react-i18next";

import { useCompanyStore } from "../../stores/useCompanyStore";
import { useUserStore } from "../../stores/useUserStore";

import "./CompanyListPage.scss";
import { useHandlingCompanyStore } from "../../stores/useHandlingCompanyStore";
import { useDriverStore } from "../../stores/useDriverStore";

const LabeledField = memo(({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ marginBottom: 4, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
));

const pageSizes = [10, 25, 50, 100];

const CompanyListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const companies = useCompanyStore((state) => state.companies);
  const addCompany = useCompanyStore((state) => state.addCompany);
  const updateCompany = useCompanyStore((state) => state.updateCompany);
  const getAllCompanies = useCompanyStore((state) => state.getAllCompanies);
  const deleteCompany = useCompanyStore((state) => state.deleteCompany);
  const getAllDrivers = useDriverStore((state) => state.getAllDrivers);
  const drivers = useDriverStore((state) => state.drivers);

  const usersActive = useUserStore((state) => state.usersActive);
  const getActiveUsers = useUserStore((state) => state.getActiveUsers);

  const activeHandlingCompanies = useHandlingCompanyStore(
    (state) => state.activeHandlingCompanies
  );
  const getActiveHandlingCompanies = useHandlingCompanyStore(
    (state) => state.getActiveHandlingCompanies
  );

  const [isCompanyCollapsed, setIsCompanyCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [filterCompanyValue, setFilterCompanyValue] = useState([]);
  const [filterCompanies, setFilterCompanies] = useState({
    id: null,
    company_name: "",
    incharge_id: null,
    email: "",
    company_handling_id: null,
    is_active: null,
  });

  const [filterDriverValue, setFilterDriverValue] = useState([]);
  const [filterDrivers, setFilterDrivers] = useState({
    id: null,
    license_number: "",
    phone: "",
    name: "",
    email: "",
    is_profile_completed: null,
  });

  const handleToggleCollapse = () => setIsCompanyCollapsed((prev) => !prev);

  // const handleApplyCompanyFilter = () => {
  //   const filterConditions = [];
  //   if (filterCompanies.id)
  //     filterConditions.push(["id", "=", filterCompanies.id]);
  //   if (filterCompanies.company_name)
  //     filterConditions.push([
  //       "company_name",
  //       "contains",
  //       filterCompanies.company_name,
  //     ]);
  //   if (filterCompanies.incharge_id)
  //     filterConditions.push(["incharge_id", "=", filterCompanies.incharge_id]);
  //   if (filterCompanies.email)
  //     filterConditions.push(["email", "contains", filterCompanies.email]);
  //   if (filterCompanies.company_handling_id)
  //     filterConditions.push([
  //       "company_handling_id",
  //       "=",
  //       filterCompanies.company_handling_id,
  //     ]);
  //   if (filterCompanies.is_active === 1 || filterCompanies.is_active === 0) {
  //     filterConditions.push(["is_active", "=", filterCompanies.is_active]);
  //   }

  //   if (filterConditions.length > 1) {
  //     setFilterCompanyValue(["and", ...filterConditions]);
  //   } else if (filterConditions.length === 1) {
  //     setFilterCompanyValue(filterConditions[0]);
  //   } else {
  //     setFilterCompanyValue([]);
  //   }
  // };

  const handleApplyDriverFilter = () => {
    const conditions = [];

    if (filterDrivers.id) conditions.push(["id", "=", filterDrivers.id]);
    if (filterDrivers.license_number)
      conditions.push([
        "license_number",
        "contains",
        filterDrivers.license_number,
      ]);
    if (filterDrivers.phone)
      conditions.push(["phone", "contains", filterDrivers.phone]);
    if (filterDrivers.name)
      conditions.push(["user.name", "contains", filterDrivers.name]);
    if (filterDrivers.email)
      conditions.push(["user.email", "contains", filterDrivers.email]);
    if (
      filterDrivers.is_profile_completed === 0 ||
      filterDrivers.is_profile_completed === 1
    )
      conditions.push([
        "user.is_profile_completed",
        "=",
        filterDrivers.is_profile_completed,
      ]);

    if (conditions.length > 1) {
      setFilterDriverValue(["and", ...conditions]);
    } else if (conditions.length === 1) {
      setFilterDriverValue(conditions[0]);
    } else {
      setFilterDriverValue([]);
    }
  };

  const handleClearCompanyFilter = () => {
    setFilterCompanies({
      id: null,
      company_name: "",
      incharge_id: null,
      email: "",
      telephone: "",
      is_active: null,
    });
    setFilterCompanyValue([]);
  };

  const onRowClick = (e) => navigate(`/driver-details/${e.data.id}`);

  const handleRowInserting = async (e) => {
    const updatedData = {
      ...e.data,
      contact_persons: [e.data["contact_persons[0]"]],
    };
    delete updatedData["contact_persons[0]"];
    const result = await addCompany(updatedData);
    if (result.isOk) {
      notify(t("clMessages.company_added_successfully"), "success", 2000);
      await getAllCompanies();
    } else {
      notify(t("clMessages.company_add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedNewData = {
      ...e.newData,
      contact_persons: [e.newData["contact_persons[0]"]],
    };
    delete updatedNewData["contact_persons[0]"];
    const updatedOldData = {
      ...e.oldData,
    };
    delete updatedOldData["created_by"];
    delete updatedOldData["last_modified_by"];
    delete updatedOldData["incharge"];
    delete updatedOldData["company_handlings"];
    delete updatedOldData["tasks"];

    const company_name =
      updatedNewData.company_name ?? updatedOldData.company_name ?? "";
    const company_name_kana =
      updatedNewData.company_name_kana ??
      updatedOldData.company_name_kana ??
      "";
    const incharge_id =
      updatedNewData.incharge_id ?? updatedOldData.incharge_id ?? null;
    const company_handling_id =
      updatedNewData.company_handling_id ??
      updatedOldData.company_handling_id ??
      null;
    const email = updatedNewData.email ?? updatedOldData.email ?? "";
    const telephone =
      updatedNewData.telephone ?? updatedOldData.telephone ?? "";
    const mobile = updatedNewData.mobile ?? updatedOldData.mobile ?? "";
    const address01 =
      updatedNewData.address01 ?? updatedOldData.address01 ?? "";
    const address02 =
      updatedNewData.address02 ?? updatedOldData.address02 ?? "";
    const postal_code =
      updatedNewData.postal_code ?? updatedOldData.postal_code ?? "";
    const is_active =
      updatedNewData.is_active ?? updatedOldData.is_active ?? true;

    const contactPersonNew = updatedNewData.contact_persons?.[0] || {};
    const contactPersonOld = updatedOldData.contact_persons?.[0] || {};

    const contactPerson = {
      id: contactPersonNew.id ?? contactPersonOld.id ?? null,
      title: contactPersonNew.title ?? contactPersonOld.title ?? "",
      kana_name: contactPersonNew.kana_name ?? contactPersonOld.kana_name ?? "",
      name: contactPersonNew.name ?? contactPersonOld.name ?? "",
      email: contactPersonNew.email ?? contactPersonOld.email ?? "",
      mobile: contactPersonNew.mobile ?? contactPersonOld.mobile ?? "",
      telephone: contactPersonNew.telephone ?? contactPersonOld.telephone ?? "",
      is_active:
        contactPersonNew.is_active ?? contactPersonOld.is_active ?? true,
    };

    const updatedData = {
      id: e.key,
      company_name,
      company_name_kana,
      incharge_id,
      company_handling_id,
      email,
      telephone,
      mobile,
      address01,
      address02,
      postal_code,
      is_active,
      contact_persons: [contactPerson],
    };

    const result = await updateCompany({
      id: e.key,
      company: updatedData,
    });
    if (result.isOk) {
      notify(t("clMessages.company_updated_successfully"), "success", 2000);
      await getAllCompanies();
    } else {
      notify(t("clMessages.company_update_error"), "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteCompany(e.key);
    if (result.isOk) {
      notify(t("clMessages.company_removed_successfully"), "success", 2000);
      await getAllCompanies();
    } else {
      notify(t("clMessages.company_remove_error"), "error", 2000);
    }
  };

  useEffect(() => {
    getAllCompanies();
    getActiveUsers();
    getAllDrivers();
    getActiveHandlingCompanies();
  }, [
    getAllCompanies,
    getActiveUsers,
    getActiveHandlingCompanies,
    getAllDrivers,
  ]);

  const columns = [
    { caption: "Driver ID", dataField: "id", width: 60 },
    { caption: "User Name", dataField: "user.name", required: true },
    { caption: "License Number", dataField: "license_number", required: true },
    { caption: "Phone", dataField: "phone", required: true },

    { caption: "User Email", dataField: "user.email", required: true },
    {
      caption: "Profile Completed",
      dataField: "user.is_profile_completed",
      dataType: "boolean",
      width: 60,
    },
  ];

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
        text: t("Add Driver"),
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

  const handleClearDriverFilter = () => {
    setFilterDrivers({
      id: null,
      license_number: "",
      phone: "",
      name: "",
      email: "",
      is_profile_completed: null,
    });
    setFilterDriverValue([]);
  };

  return (
    <div className={"company-list-page"}>
      <ToolbarTX className="toolbarPadding">
        <Item location="before" style={{ padding: "16px" }}>
          <Button
            text={isCompanyCollapsed ? t("show") : t("hide")}
            icon={isCompanyCollapsed ? "chevrondown" : "chevronup"}
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
                onClick={handleClearDriverFilter}
              />
              <Button
                icon="filter"
                text={t("filter")}
                type="default"
                onClick={handleApplyDriverFilter}
              />
            </div>
          )}
        />
      </ToolbarTX>

      {!isCompanyCollapsed && (
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
            <LabeledField label={"ID"}>
              <TextBox
                value={filterDrivers.id}
                showClearButton
                onValueChanged={(e) =>
                  setFilterDrivers((prev) => ({ ...prev, id: e.value }))
                }
              />
            </LabeledField>

            <LabeledField label={"License Number"}>
              <TextBox
                value={filterDrivers.license_number}
                showClearButton
                onValueChanged={(e) =>
                  setFilterDrivers((prev) => ({
                    ...prev,
                    license_number: e.value,
                  }))
                }
              />
            </LabeledField>

            <LabeledField label={"Phone"}>
              <TextBox
                value={filterDrivers.phone}
                showClearButton
                onValueChanged={(e) =>
                  setFilterDrivers((prev) => ({ ...prev, phone: e.value }))
                }
              />
            </LabeledField>

            <LabeledField label={"User Name"}>
              <TextBox
                value={filterDrivers.name}
                showClearButton
                onValueChanged={(e) =>
                  setFilterDrivers((prev) => ({ ...prev, name: e.value }))
                }
              />
            </LabeledField>

            <LabeledField label={"User Email"}>
              <TextBox
                value={filterDrivers.email}
                showClearButton
                onValueChanged={(e) =>
                  setFilterDrivers((prev) => ({ ...prev, email: e.value }))
                }
              />
            </LabeledField>

            <LabeledField label={"Profile Completed"}>
              <SelectBox
                items={[
                  { id: null, text: "All" },
                  { id: 1, text: "Completed" },
                  { id: 0, text: "Not Completed" },
                ]}
                displayExpr="text"
                valueExpr="id"
                value={filterDrivers.is_profile_completed}
                onValueChanged={(e) =>
                  setFilterDrivers((prev) => ({
                    ...prev,
                    is_profile_completed: e.value,
                  }))
                }
              />
            </LabeledField>
          </div>
        </>
      )}

      <DataGrid
        dataSource={drivers}
        filterValue={filterDriverValue}
        onToolbarPreparing={onToolbarPreparing}
        keyExpr="id"
        onRowClick={onRowClick}
        showBorders={true}
        showRowLines
        width="100%"
        rowAlternationEnabled
        onRowInserting={handleRowInserting}
        onRowUpdating={handleRowUpdating}
        onRowRemoving={handleRowRemoving}
        onInitNewRow={(e) => {
          setIsAdding(true);
          e.data.is_active = true;
          e.data.contact_is_active = true;
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
          if (e.rowType === "data") {
            e.rowElement.style.cursor = "pointer";
            // e.rowElement.title = t("clMessages.row_click_tooltip");
            e.rowElement.classList.add("custom-hover-row");
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
        ></Editing>

        {columns.map(
          ({
            dataField,
            caption,
            visible = true,
            dataType = "string",
            width = 200,
            alignment = "left",
            required = false,
            isEmail = false,
            lookup,
          }) => (
            <Column
              key={dataField}
              dataField={dataField}
              caption={caption}
              visible={visible}
              dataType={dataType}
              width={width}
              alignment={alignment}
            >
              {required && <RequiredRule message={t(`required`)} />}
              {isEmail && <EmailRule message="Email is invalid" />}
              {lookup && <Lookup {...lookup} />}
            </Column>
          )
        )}

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

export default CompanyListPage;
