import React, { useCallback, useContext, useEffect } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import { ThemeContext } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../../stores/useUIStore';

export const ThemeSwitcher = () => {
  const themeContext = useContext(ThemeContext);

  const { i18n } = useTranslation();
  const language = useUIStore(state => state.language);
  const languages = useUIStore(state => state.languages);
  const setLanguage = useUIStore(state => state.setLanguage);

  const onThemeToggle = useCallback(() => {
    themeContext?.switchTheme();
  }, [themeContext]);

  const onLanguageChange = useCallback((e) => {
    i18n.changeLanguage(e.itemData.id);
    setLanguage(e.itemData.id);
    window.location.reload();
  }, [i18n]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <DropDownButton
        items={languages}
        displayExpr="name"
        keyExpr="id"
        selectedItemKey={language}
        showArrowIcon={true}
        useSelectMode={true}
        stylingMode="text"
        icon="globe"
        onItemClick={onLanguageChange}
        hint="Select Language"
      />
      {/* <Button
        className="theme-button"
        stylingMode="text"
        icon={themeContext?.theme === 'dark' ? 'sun' : 'moon'}
        onClick={onThemeToggle}
      /> */}
    </div>
  );
};
