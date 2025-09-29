import { useCallback, useEffect, useRef, useState } from "react";
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
import { Item, RangeRule } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { useTranslation } from "react-i18next";
import { useTownStore } from "../../stores/useTownStore";

const pageSizes = [10, 25, 50, 100];

const TownPage = () => {
  const { t } = useTranslation();
  const [isAddMode, setIsAddMode] = useState(false);

  // debounce timer for geocoding while editing the "name" field
  const geocodeTimerRef = useRef(null);

  // Store
  const towns = useTownStore((state) => state.towns);
  const getAllTowns = useTownStore((state) => state.getAllTowns);
  const addTown = useTownStore((state) => state.addTown);
  const updateTown = useTownStore((state) => state.updateTown);
  const deleteTown = useTownStore((state) => state.deleteTown);

  useEffect(() => {
    getAllTowns();
  }, [getAllTowns]);

  // --- Helpers to find the currently edited row index in the grid ---
  const getEditingRowIndex = (grid) => {
    if (!grid) return -1;
    const editKey = grid.option("editing.editRowKey");
    if (editKey !== undefined && editKey !== null) {
      const idx = grid.getRowIndexByKey(editKey);
      if (idx >= 0) return idx;
    }
    // "New Row" fallback
    const rows = grid.getVisibleRows();
    const newIdx = rows.findIndex((r) => r?.isNewRow);
    return newIdx >= 0 ? newIdx : -1;
  };

  // --- Geocoding (OpenStreetMap Nominatim, Sri Lanka) ---
  const geocodeTownLK = async (name) => {
    const q = encodeURIComponent(`${name}, Sri Lanka`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=lk&addressdetails=0`;
    const res = await fetch(url, {
      headers: {
        // Optional but polite; some Nominatim instances ask for a UA
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const best = data[0];
    if (!best?.lat || !best?.lon) return null;
    return { lat: parseFloat(best.lat), lng: parseFloat(best.lon) };
  };

  // Hook into the editor for the "name" field to auto-fill lat/lng
  const handleEditorPreparing = (e) => {
    if (e.parentType === "dataRow" || e.parentType === "form") {
      if (e.dataField === "name") {
        const originalOnValueChanged = e.editorOptions?.onValueChanged;

        e.editorOptions.onValueChanged = (args) => {
          // Keep DevExtreme behavior
          e.setValue(args.value);
          if (typeof originalOnValueChanged === "function") {
            originalOnValueChanged(args);
          }

          // Debounce geocoding
          if (geocodeTimerRef.current) {
            clearTimeout(geocodeTimerRef.current);
          }
          const value = String(args.value || "").trim();
          if (!value || value.length < 2) {
            return; // don't geocode super short strings
          }

          geocodeTimerRef.current = setTimeout(async () => {
            try {
              const grid = e.component;
              const rowIndex = getEditingRowIndex(grid);
              if (rowIndex < 0) return;

              const coords = await geocodeTownLK(value);
              if (coords) {
                grid.cellValue(rowIndex, "latitude", Number(coords.lat.toFixed(7)));
                grid.cellValue(rowIndex, "longitude", Number(coords.lng.toFixed(7)));
                grid.repaintRows([rowIndex]);
                notify("Location auto-filled from town name", "success", 1500);
              } else {
                // If you want to clear previous coords when not found, uncomment below:
                // grid.cellValue(rowIndex, "latitude", null);
                // grid.cellValue(rowIndex, "longitude", null);
                notify("Couldn’t find that town in Sri Lanka", "warning", 1800);
              }
            } catch (err) {
              notify("Geocoding failed — please try again", "error", 1800);
            }
          }, 600); // debounce ms
        };
      }
    }
  };

  // --- CRUD handlers ---
  const handleRowInserting = async (e) => {
    const payload = {
      name: e.data.name,
      is_active: e.data.is_active ?? true,
      latitude: e.data.latitude ?? null,
      longitude: e.data.longitude ?? null,
    };
    const result = await addTown(payload);
    if (result?.isOk) {
      notify("Town added successfully", "success", 2000);
      await getAllTowns();
    } else {
      notify(result?.message || "Failed to add town", "error", 2000);
    }
  };

  const handleRowUpdating = async (e) => {
    const updatedData = {
      id: e.oldData.id,
      name: e.newData.name ?? e.oldData.name ?? "",
      is_active: e.newData.is_active ?? e.oldData.is_active ?? true,
      latitude:
        e.newData.latitude ??
        (e.oldData.latitude !== undefined ? e.oldData.latitude : null),
      longitude:
        e.newData.longitude ??
        (e.oldData.longitude !== undefined ? e.oldData.longitude : null),
    };
    const result = await updateTown({ id: e.key, town: updatedData });
    if (result?.isOk) {
      notify("Town updated successfully", "success", 2000);
      await getAllTowns();
    } else {
      notify(result?.message || "Failed to update town", "error", 2000);
    }
  };

  const handleRowRemoving = async (e) => {
    const result = await deleteTown(e.key);
    if (result?.isOk) {
      notify("Town deleted successfully", "success", 2000);
      await getAllTowns();
    } else {
      notify(result?.message || "Failed to delete town", "error", 2000);
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
        showBorders
        showRowLines
        rowAlternationEnabled
        onToolbarPreparing={onToolbarPreparing}
        onRowInserting={handleRowInserting}
        onRowUpdating={handleRowUpdating}
        onRowRemoving={handleRowRemoving}
        onEditorPreparing={handleEditorPreparing}
        onInitNewRow={(e) => {
          setIsAddMode(true);
          e.data.is_active = true;
          e.data.latitude = null;
          e.data.longitude = null;
        }}
        onEditingStart={() => {
          setIsAddMode(false);
        }}
      >
        <FilterRow visible />
        <HeaderFilter visible />
        <SearchPanel visible highlightCaseSensitive />

        <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons>
          <Popup title={"Add/Edit Town"} showTitle width={520} height={360} />
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

              <Item dataField="name">
                <RequiredRule message="Town name is required" />
              </Item>

              {/* Auto-filled coords (read-only in popup to avoid accidental edits) */}
              <Item
                dataField="latitude"
                editorType="dxNumberBox"
                editorOptions={{ readOnly: true, format: "#.#######" }}
                label={{ text: "Latitude" }}
              >
                <RangeRule min={-90} max={90} message="Latitude must be between -90 and 90" />
              </Item>

              <Item
                dataField="longitude"
                editorType="dxNumberBox"
                editorOptions={{ readOnly: true, format: "#.#######" }}
                label={{ text: "Longitude" }}
              >
                <RangeRule min={-180} max={180} message="Longitude must be between -180 and 180" />
              </Item>

              <Item dataField="is_active" editorType="dxCheckBox" />
            </Item>
          </Form>
        </Editing>

        <Column dataField="id" caption="ID" width={60} alignment="left" />
        <Column dataField="name" caption="Town Name" alignment="left">
          <RequiredRule message="Town name is required" />
        </Column>

        {/* Show these, or set visible={false} to hide from the table */}
        <Column
          dataField="latitude"
          caption="Lat"
          dataType="number"
          alignment="left"
          width={140}
          format="#.#######"
        />
        <Column
          dataField="longitude"
          caption="Lng"
          dataType="number"
          alignment="left"
          width={140}
          format="#.#######"
        />

        <Column
          dataField="is_active"
          caption="Active"
          dataType="boolean"
          alignment="center"
          width={120}
        />

        <Pager visible allowedPageSizes={pageSizes} showPageSizeSelector />
        <Paging defaultPageSize={10} />
      </DataGrid>
    </div>
  );
};

export default TownPage;
