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
import { useTownStore } from "../../stores/useTownStore";

const pageSizes = [10, 25, 50, 100];

const TownPage = () => {
  const { t } = useTranslation();
  const [isAddMode, setIsAddMode] = useState(false);

  const towns = useTownStore((state) => state.towns);
  const getAllTowns = useTownStore((state) => state.getAllTowns);
  const addTown = useTownStore((state) => state.addTown);
  const updateTown = useTownStore((state) => state.updateTown);
  const deleteTown = useTownStore((state) => state.deleteTown);

  useEffect(() => {
    getAllTowns();
  }, [getAllTowns]);

  const handleRowInserting = async (e) => {
    const result = await addTown(e.data);
    if (result.isOk) {
      notify("Town added successfully", "success", 2000);
      await getAllTowns();
    } else {
      notify("Failed to add town", "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedData = {
      id: e.oldData.id,
      name: e.newData.name ?? e.oldData.name ?? "",
      is_active: e.newData.is_active ?? e.oldData.is_active ?? true,
    };
    const result = await updateTown({ id: e.key, town: updatedData });
    if (result.isOk) {
      notify("Town updated successfully", "success", 2000);
      await getAllTowns();
    } else {
      notify("Failed to update town", "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteTown(e.key);
    if (result.isOk) {
      notify("Town deleted successfully", "success", 2000);
      await getAllTowns();
    } else {
      notify("Failed to delete town", "error", 2000);
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
    <div className={"town-page"}>
      <DataGrid
        dataSource={towns}
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
          <Popup title={"Add/Edit Town"} showTitle={true} width={500} height={300} />
          <Form colCount={1}>
            <Item itemType="group" colCount={1}>
              <Item
                itemType="group"
                colCountByScreen={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                caption=""
              >
                <Item
                  dataField="id"
                  editorOptions={{ readOnly: true }}
                  visible={!isAddMode}
                />
              </Item>
              <Item dataField="name" />
              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
          </Form>
        </Editing>

        <Column dataField="id" caption="ID" width={60} alignment="left" />
        <Column dataField="name" caption="Town Name" alignment="left">
          <RequiredRule message="Town name is required" />
        </Column>
        <Column dataField="is_active" caption="Active" dataType="boolean" alignment="center" width={120} />

        <Pager visible={true} allowedPageSizes={pageSizes} showPageSizeSelector={true} />
        <Paging defaultPageSize={10} />
      </DataGrid>
    </div>
  );
};

export default TownPage;