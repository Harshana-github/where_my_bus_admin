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

  const usersActive = useUserStore((state) => state.usersActive);
  const getActiveUsers = useUserStore((state) => state.getActiveUsers);

  const activeHandlingCompanies = useHandlingCompanyStore(
    (state) => state.activeHandlingCompanies
  );
  const getActiveHandlingCompanies = useHandlingCompanyStore(
    (state) => state.getActiveHandlingCompanies
  );

  const [filterCompanyValue, setFilterCompanyValue] = useState([]);
  const [isCompanyCollapsed, setIsCompanyCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [filterCompanies, setFilterCompanies] = useState({
    id: null,
    company_name: "",
    incharge_id: null,
    email: "",
    company_handling_id: null,
    is_active: null,
  });

  const handleToggleCollapse = () => setIsCompanyCollapsed((prev) => !prev);

  const handleApplyCompanyFilter = () => {
    const filterConditions = [];
    if (filterCompanies.id)
      filterConditions.push(["id", "=", filterCompanies.id]);
    if (filterCompanies.company_name)
      filterConditions.push([
        "company_name",
        "contains",
        filterCompanies.company_name,
      ]);
    if (filterCompanies.incharge_id)
      filterConditions.push(["incharge_id", "=", filterCompanies.incharge_id]);
    if (filterCompanies.email)
      filterConditions.push(["email", "contains", filterCompanies.email]);
    if (filterCompanies.company_handling_id)
      filterConditions.push([
        "company_handling_id",
        "=",
        filterCompanies.company_handling_id,
      ]);
    if (filterCompanies.is_active === 1 || filterCompanies.is_active === 0) {
      filterConditions.push(["is_active", "=", filterCompanies.is_active]);
    }

    if (filterConditions.length > 1) {
      setFilterCompanyValue(["and", ...filterConditions]);
    } else if (filterConditions.length === 1) {
      setFilterCompanyValue(filterConditions[0]);
    } else {
      setFilterCompanyValue([]);
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

  const onRowClick = (e) => navigate(`/company-details/${e.data.id}`);

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
    getActiveHandlingCompanies();
  }, [getAllCompanies, getActiveUsers, getActiveHandlingCompanies]);

  const columns = [
    // Company columns
    { caption: t("ID"), dataField: "id", width: 60 },
    { caption: t("company_name"), dataField: "company_name", required: true },
    {
      caption: t("company_name_kana"),
      dataField: "company_name_kana",
      visible: false,
    },
    {
      caption: t("company_incharge"),
      dataField: "incharge_id",
      cellRender: null,
      lookup: {
        dataSource: usersActive,
        valueExpr: "id",
        displayExpr: "first_name",
      },
      required: true,
    },
    {
      caption: t("handling_company"),
      dataField: "company_handling_id",
      cellRender: null,
      lookup: {
        dataSource: activeHandlingCompanies,
        valueExpr: "id",
        displayExpr: "name",
      },
      required: true,
    },
    { caption: t("email"), dataField: "email", required: true, isEmail: true },
    { caption: t("tel"), dataField: "telephone", dataType: "number" },
    {
      caption: t("mobile_tel"),
      dataField: "mobile",
      visible: false,
      dataType: "number",
    },
    { caption: t("address_01"), dataField: "address01", visible: false },
    { caption: t("address_02"), dataField: "address02", visible: false },
    {
      caption: t("postal_code"),
      dataField: "postal_code",
      visible: false,
      dataType: "number",
    },
    {
      caption: t("is_active"),
      dataField: "is_active",
      dataType: "boolean",
      width: 80,
      alignment: "center",
    },

    // Contact person hidden columns
    { caption: t("ID"), dataField: "contact_id", visible: false },
    {
      caption: t("contact_title"),
      dataField: "contact_persons[0].title",
      visible: false,
    },
    {
      caption: t("contact_name"),
      dataField: "contact_persons[0].name",
      visible: true,
      required: true,
    },
    {
      caption: t("contact_kana_name"),
      dataField: "contact_persons[0].kana_name",
      visible: false,
    },
    {
      caption: t("contact_email"),
      dataField: "contact_persons[0].email",
      visible: false,
      isEmail: true,
    },
    {
      caption: t("contact_mobile"),
      dataField: "contact_persons[0].mobile",
      visible: false,
      dataType: "number",
    },
    {
      caption: t("contact_telephone"),
      dataField: "contact_persons[0].telephone",
      visible: false,
      dataType: "number",
    },
    {
      caption: t("contact_is_active"),
      dataField: "contact_persons[0].is_active",
      dataType: "boolean",
      visible: false,
      width: 80,
      alignment: "center",
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
        text: t("add_company"),
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
                onClick={handleClearCompanyFilter}
              />
              <Button
                icon="filter"
                text={t("filter")}
                type="default"
                onClick={handleApplyCompanyFilter}
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
            <div className="filter-item">
              <LabeledField label={t("ID")}>
                <TextBox
                  placeholder={t("ID")}
                  value={filterCompanies.id}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterCompanies((prev) => ({
                      ...prev,
                      id: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("company_name")}>
                <TextBox
                  placeholder={t("company_name")}
                  value={filterCompanies.company_name}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterCompanies((prev) => ({
                      ...prev,
                      company_name: e.value,
                    }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("company_incharge")}>
                <SelectBox
                  items={usersActive}
                  placeholder={t("company_incharge")}
                  valueExpr="id"
                  displayExpr="first_name"
                  value={filterCompanies.incharge_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterCompanies((prev) => ({
                      ...prev,
                      incharge_id: e.value,
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
                  value={filterCompanies.email}
                  showClearButton
                  onValueChanged={(e) =>
                    setFilterCompanies((prev) => ({ ...prev, email: e.value }))
                  }
                  width="100%"
                />
              </LabeledField>
            </div>

            <div className="filter-item">
              <LabeledField label={t("handling_company")}>
                <SelectBox
                  items={activeHandlingCompanies}
                  placeholder={t("handling_company")}
                  valueExpr="id"
                  displayExpr="name"
                  value={filterCompanies.company_handling_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterCompanies((prev) => ({
                      ...prev,
                      company_handling_id: e.value,
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
                  value={filterCompanies.is_active}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterCompanies((prev) => ({
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
        dataSource={companies}
        filterValue={filterCompanyValue}
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
            e.rowElement.title = t("clMessages.row_click_tooltip");
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
        <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons>
          <Popup
            title={t("add_edit_company")}
            showTitle
            maxWidth={window.innerWidth < 500 ? "90%" : 1000}
            maxHeight={700}
            dragEnabled={false}
            closeOnOutsideClick
            showCloseButton
            resizeEnabled
            position="center"
          />
          <Form labelLocation="top" colCount={2}>
            <Item itemType="group" caption={t("company_details")}>
              <Item
                dataField="id"
                editorOptions={{ readOnly: true }}
                visible={!isAdding}
              />
              <Item dataField="company_name" />
              <Item dataField="company_name_kana" />
              <Item dataField="incharge_id" editorType="dxSelectBox" />
              <Item dataField="company_handling_id" editorType="dxSelectBox" />
              <Item dataField="email" />
              <Item dataField="telephone" />
              <Item dataField="mobile" />
              <Item dataField="postal_code" />
              <Item dataField="address01" />
              <Item dataField="address02" />
              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
            <Item itemType="group" caption={t("contact_person_details")}>
              <Item dataField="contact_persons[0].id" visible={false} />
              <Item dataField="contact_persons[0].title" />
              <Item dataField="contact_persons[0].name" />
              <Item dataField="contact_persons[0].kana_name" />
              <Item dataField="contact_persons[0].email" />
              <Item dataField="contact_persons[0].mobile" />
              <Item dataField="contact_persons[0].telephone" />
              <Item
                dataField="contact_persons[0].is_active"
                editorType="dxCheckBox"
              />
            </Item>
          </Form>
        </Editing>

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
