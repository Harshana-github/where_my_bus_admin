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
import { useHandlingCompanyStore } from "../../stores/useHandlingCompanyStore";
import { useTranslation } from "react-i18next";

const pageSizes = [10, 25, 50, 100];

const HandlingCompanyPage = () => {
  const { t } = useTranslation();
  const [isAddMode, setIsAddMode] = useState(false);

  const handlingCompanies = useHandlingCompanyStore(
    (state) => state.handlingCompanies
  );
  const getAllHandlingCompanies = useHandlingCompanyStore(
    (state) => state.getAllHandlingCompanies
  );
  const addHandlingCompany = useHandlingCompanyStore(
    (state) => state.addHandlingCompany
  );
  const updateHandlingCompany = useHandlingCompanyStore(
    (state) => state.updateHandlingCompany
  );
  const deleteHandlingCompany = useHandlingCompanyStore(
    (state) => state.deleteHandlingCompany
  );

  useEffect(() => {
    getAllHandlingCompanies();
  }, [getAllHandlingCompanies]);

  const handleRowInserting = async (e) => {
    const result = await addHandlingCompany(e.data);
    if (result.isOk) {
      notify(
        t("settings.handlingCompany.messages.add_success"),
        "success",
        2000
      );
      await getAllHandlingCompanies();
    } else {
      notify(t("settings.handlingCompany.messages.add_error"), "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedData = {
      id: e.oldData.id,
      name: e.newData.name ?? e.oldData.name ?? "",
      description: e.newData.description ?? e.oldData.description ?? "",
      is_active: e.newData.is_active ?? e.oldData.is_active ?? true,
    };
    const result = await updateHandlingCompany({
      id: e.key,
      handlingCompany: updatedData,
    });
    if (result.isOk) {
      notify(
        t("settings.handlingCompany.messages.update_success"),
        "success",
        2000
      );
      await getAllHandlingCompanies();
    } else {
      notify(
        t("settings.handlingCompany.messages.update_error"),
        "error",
        2000
      );
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteHandlingCompany(e.key);
    if (result.isOk) {
      notify(
        t("settings.handlingCompany.messages.delete_success"),
        "success",
        2000
      );
      await getAllHandlingCompanies();
    } else {
      notify(
        t("settings.handlingCompany.messages.delete_error"),
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
    <div className={"handling-company-page"}>
      <DataGrid
        dataSource={handlingCompanies}
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
            title={t(
              "settings.handlingCompany.messages.add_edit_handling_company"
            )}
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
              <Item dataField="name" />
              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
          </Form>
        </Editing>
        <Column dataField="id" caption={t("ID")} width={60} alignment="left" />
        <Column
          caption={t("settings.handlingCompany.fields.handling_company_name")}
          dataField="name"
          dataType="string"
          alignment="left"
        >
          <RequiredRule
            message={t(
              "settings.handlingCompany.messages.handling_company_name_required"
            )}
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

export default HandlingCompanyPage;
