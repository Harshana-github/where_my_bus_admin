import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import HomeEN from "./locales/en/home.json";
import ManageCompanyEN from "./locales/en/manage-company.json";
import systemSettingsEN from "./locales/en/system-settings.json";
import viewUserEN from "./locales/en/view-user.json";
import todoListEN from "./locales/en/todo-list.json";
import workReportEN from "./locales/en/work-report.json";
import companyDetailsEN from "./locales/en/company-details.json";
import sideNavigationMenuEN from "./locales/en/nav-bar.json";

import HomeJP from "./locales/ja/home.json";
import ManageCompanyJP from "./locales/ja/manage-company.json";
import systemSettingsJP from "./locales/ja/system-settings.json";
import viewUserJP from "./locales/ja/view-user.json";
import todoListJP from "./locales/ja/todo-list.json";
import workReportJP from "./locales/ja/work-report.json";
import companyDetailsJP from "./locales/ja/company-details.json";
import sideNavigationMenuJP from "./locales/ja/nav-bar.json";

const resources = {
  en: {
    translation: {
      ...HomeEN,
      ...ManageCompanyEN,
      ...systemSettingsEN,
      ...viewUserEN,
      ...todoListEN,
      ...workReportEN,
      ...companyDetailsEN,
      ...sideNavigationMenuEN,
    },
  },
  ja: {
    translation: {
      ...HomeJP,
      ...ManageCompanyJP,
      ...systemSettingsJP,
      ...viewUserJP,
      ...todoListJP,
      ...workReportJP,
      ...companyDetailsJP,
      ...sideNavigationMenuJP,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ja",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
