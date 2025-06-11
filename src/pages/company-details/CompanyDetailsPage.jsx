import React, { useState, useEffect, memo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

import { useDriverStore } from "../../stores/useDriverStore";
import { useUIStore } from "../../stores/useUIStore";

import "./CompanyDetailsPage.scss";

const CompanyDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: driverID } = useParams();
  const driverIdInt = parseInt(driverID, 10);
  const driverById = useDriverStore((state) => state.driverById);
  const getDriverById = useDriverStore((state) => state.getDriverById);
  const isLoading = useUIStore((state) => state.isLoading);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (driverIdInt) {
      getDriverById(driverIdInt);
    }
  }, [getDriverById, driverIdInt]);

  // 💡 New: Guard rendering until data is safe
  if (isLoading || !driverById || !driverById.data) {
    return <div>Loading driver details...</div>;
  }

  const {
    id,
    license_number,
    phone,
    is_active,
    user,
    buses = [],
  } = driverById.data;

  return (
    <div className="company-details-page">
      <ToolbarTX className="toolbarPadding">
        <ItemBox location="before" style={{ padding: "56px" }}>
          <Button
            text={isCollapsed ? t("show") : t("hide")}
            icon={isCollapsed ? "chevrondown" : "chevronup"}
            onClick={() => setIsCollapsed(!isCollapsed)}
            width="100%"
          />
        </ItemBox>
        <Item
          location="after"
          style={{ padding: "16px" }}
          render={() => (
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                icon="back"
                text={t("back")}
                type="varriant"
                stylingMode="varriant"
                width={100}
                onClick={() => navigate(-1)}
              />
            </div>
          )}
        />
      </ToolbarTX>
      <div className="driver-info">
        <div>
          <strong>Driver ID</strong> {id}
        </div>
        <div>
          <strong>Name</strong> {user?.name}
        </div>
        <div>
          <strong>Email</strong> {user?.email}
        </div>
        <div>
          <strong>User Type</strong> {user?.user_type}
        </div>
        <div>
          <strong>License Number</strong> {license_number}
        </div>
        <div>
          <strong>Phone</strong> {phone}
        </div>
        <div>
          <strong>Active</strong> {is_active ? "Yes" : "No"}
        </div>
        <div>
          <strong>Profile Completed</strong>{" "}
          {user?.is_profile_completed ? "Yes" : "No"}
        </div>
      </div>

      <h3>Buses</h3>
      {buses.length === 0 && <div>No buses assigned.</div>}
      {buses.map((bus) => (
        <div className="bus-card" key={bus.id}>
          <div>
            <strong>Bus Number:</strong> {bus.bus_number}
          </div>
          <div>
            <strong>Registration ID:</strong> {bus.registration_id}
          </div>
          <div>
            <strong>Route:</strong> {bus.route?.route_name}
          </div>
          <div>
            <strong>Start:</strong> {bus.route?.start_location}
          </div>
          <div>
            <strong>End:</strong> {bus.route?.end_location}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanyDetailsPage;
