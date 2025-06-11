import "./WorkReportPage.scss";
import React, { useState, useEffect, memo, useCallback } from "react";
import Box from "devextreme-react/box";
import TextBox from "devextreme-react/text-box";
import SelectBox from "devextreme-react/select-box";
import DateBox from "devextreme-react/date-box";
import Button from "devextreme-react/button";
import { Toolbar as ToolbarTX } from "devextreme-react/toolbar";
import DataGrid, {
  Column,
  Grouping,
  GroupPanel,
  Selection,
  Paging,
  Pager,
  MasterDetail,
  HeaderFilter,
  FilterRow,
  Popup,
  Form,
  Lookup,
  SearchPanel,
  Editing,
  ColumnFixing,
} from "devextreme-react/data-grid";
import { Item, RequiredRule } from "devextreme-react/form";
import { useTranslation } from "react-i18next";
import notify from "devextreme/ui/notify";
import moment from "moment";

import { useUserStore } from "../../stores/useUserStore";
import { useWorkReportStore } from "../../stores/useWorkReportStore";
import { useCompanyStore } from "../../stores/useCompanyStore";

const LabeledField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ marginBottom: "4px", fontWeight: "500" }}>{label}</label>
    {children}
  </div>
);

const pageSizes = [10, 25, 50, 100];

const WorkReportPage = () => {
  const { t } = useTranslation();

  const workReports = useWorkReportStore((state) => state.workReports);
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

  const usersActive = useUserStore((state) => state.usersActive);
  const getActiveUsers = useUserStore((state) => state.getActiveUsers);

  const activeCompanies = useCompanyStore((state) => state.activeCompanies);
  const getActiveCompanies = useCompanyStore(
    (state) => state.getActiveCompanies
  );

  const [isAdding, setIsAdding] = useState(false);
  const [isWorkReportCollapsed, setIsorkReportCollapsed] = useState(false);
  const [filterWorkReportValue, setFilterWorkReportValue] = useState([]);
  const [filterWorkReport, setFilterWorkReport] = useState({
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

  const handleToggleCollapse = () => setIsorkReportCollapsed((prev) => !prev);

  const handleApplyWorkReportFilter = () => {
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

  const handleClearWorkReportFilter = () => {
    setFilterWorkReport({
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

  const handleRowInserting = async (e) => {
    e.data.report_date = moment(e.data.report_date).format("YYYY/MM/DD");
    e.data.report_time = moment(e.data.report_time).format("HH:mm:ss");
    const result = await addWorkReport(e.data);
    if (result.isOk) {
      notify(t("wrMessages.workReport_added_successfully"), "success", 2000);
      await getAllWorkReports();
    } else {
      notify(t("wrMessages.workReport_add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
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
    const company_id = e.newData.company_id ?? e.oldData.company_id ?? true;

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
      await getAllWorkReports();
    } else {
      notify(t("wrMessages.workReport_update_error"), "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteWorkReport(e.key);
    if (result.isOk) {
      notify(t("wrMessages.workReport_removed_successfully"), "success", 2000);
      await getAllWorkReports();
    } else {
      notify(t("wrMessages.workReport_remove_error"), "error", 2000);
    }
  };

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
    getAllWorkReports();
    getActiveUsers();
    getActiveCompanies();
  }, [getAllWorkReports, getActiveUsers, getActiveCompanies]);

  return (
    <div className={"work-report-page"}>
      <ToolbarTX className="toolbarPadding">
        <Item location="before" style={{ padding: "56px" }}>
          <Button
            text={isWorkReportCollapsed ? t("show") : t("hide")}
            icon={isWorkReportCollapsed ? "chevrondown" : "chevronup"}
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
                onClick={handleClearWorkReportFilter}
              />
              <Button
                icon="filter"
                text={t("filter")}
                type="default"
                stylingMode="contained"
                onClick={handleApplyWorkReportFilter}
              />
            </div>
          )}
        />
        <br />
      </ToolbarTX>

      {!isWorkReportCollapsed && (
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
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("company")}>
                <SelectBox
                  items={activeCompanies}
                  value={filterWorkReport.company_id}
                  searchEnabled
                  onValueChanged={(e) =>
                    setFilterWorkReport((prev) => ({
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
            </Item>

            <Item ratio={1}>
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
            </Item>

            <Item ratio={1}>
              <LabeledField label={t("start_date")}>
                <DateBox
                  placeholder={t("start_date")}
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
            </Item>

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
            </Item>

            <Item ratio={1}>
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
            </Item>

            <Item ratio={1}>
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
            </Item>
          </Box>
        </>
      )}

      <DataGrid
        dataSource={workReports}
        filterValue={filterWorkReportValue}
        keyExpr="id"
        showBorders={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
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
      >
        <SearchPanel visible={true} highlightCaseSensitive={true} />
        <Selection
          mode="multiple"
          selectAllMode="allPages"
          showCheckBoxesMode="always"
        />

        <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons>
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
                  visible={!isAdding}
                />
              </Item>
              <Item dataField="title" />

              <Item
                itemType="group"
                colCountByScreen={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                caption=""
              >
                <Item dataField="report_date" editorType="dxDateBox" />
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
                <Item dataField="company_id" editorType="dxSelectBox" />
                <Item dataField="incharge_id" editorType="dxSelectBox" />
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
        <Column dataField="id" caption={t("ID")} width={60} alignment="left" />
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
        <Column dataField="incharge_id" caption={t("person_in_charge")}>
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
        <Column dataField="content" caption={t("content")} visible={false} />
        <Column dataField="remark" caption={t("remark")} visible={false} />
        <Column dataField="company_id" caption={t("company")} visible={false}>
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
    </div>
  );
};
export default WorkReportPage;
