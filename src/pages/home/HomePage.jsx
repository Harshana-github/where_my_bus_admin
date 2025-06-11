import React from "react";
import { useTranslation } from "react-i18next";

import "./HomePage.scss";
import { useUIStore } from "../../stores/useUIStore";

export default function HomePage() {
  const { t } = useTranslation();
  useUIStore.getState().setPageTitle(t("title"));

  return (
    <React.Fragment>
      <h2 className={"content-block"}>{t("title")}</h2>
    </React.Fragment>
  );
}
