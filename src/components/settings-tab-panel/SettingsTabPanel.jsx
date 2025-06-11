import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ScrollView from "devextreme-react/scroll-view";
import { Button } from "devextreme-react/button";
import { useTranslation } from "react-i18next";

const tabs = [
  { id: "system_settings", path: "/system-settings" },
];

const SettingsTabPanel = () => {
  const { t, i18 } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ padding: "10px", overflow: "hidden" }}>
      <ScrollView
        direction="horizontal"
        showScrollbar="onHover"
        className={"custom-scroll"}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {tabs.map((tab) => (
            <Button
              key={`${tab.id}-${location.pathname}`}
              onClick={() => navigate(tab.path)}
              stylingMode="outlined"
              type={location.pathname === tab.path ? "default" : "normal"}
              style={{
                minWidth: "150px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "10px",
                border: "none",
                backgroundColor:
                  location.pathname === tab.path ? "#007BFF" : "#f0f0f0",
                color: location.pathname === tab.path ? "white" : "black",
                cursor: "pointer",
                borderRadius: "5px",
                transition: "background-color 0.2s ease-in-out",
              }}
            >
              {t(`settings.tabs.${tab.id}`)}
            </Button>
          ))}
        </div>
      </ScrollView>
    </div>
  );
};

export default SettingsTabPanel;
