import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './localization/i18n';
import enMessages from "devextreme/localization/messages/en.json";
import jaMessages from "devextreme/localization/messages/ja.json";
import { locale, loadMessages } from "devextreme/localization";

// Load all needed messages only once, before rendering
loadMessages(jaMessages);
loadMessages(enMessages);

// Get language from localStorage or default to 'ja'
const language = localStorage.getItem("language") || "ja";
locale(language);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

reportWebVitals();