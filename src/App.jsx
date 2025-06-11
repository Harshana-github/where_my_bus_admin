import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.dark.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.dark.css';
import './themes/generated/theme.additional.css';
import React, { useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './dx-styles.scss';
import LoadPanel from 'devextreme-react/load-panel';
import { NavigationProvider } from './contexts/navigation';
import { useScreenSizeClass } from './utils/media-query';
import Content from './Content';
import UnauthenticatedContent from './UnauthenticatedContent';
import { ThemeContext, useThemeContext } from "./theme";
import { useAuthStore } from './stores/useAuthStore';
import { useUIStore } from './stores/useUIStore';

function App() {
  const pageTitle = useUIStore(state => state.pageTitle);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (pageTitle.length > 0) {
      document.title = "Ohayo" + " - " + pageTitle;
    }
  }, [pageTitle]);

  if (user) {
    return <Content />;
  }

  return <UnauthenticatedContent />;
}

export default function Root() {
  const screenSizeClass = useScreenSizeClass();
  const themeContext = useThemeContext();
  const isLoading = useUIStore(state => state.isLoading);

  return (
    <Router>
      <ThemeContext.Provider value={themeContext}>
        <NavigationProvider>
          <div className={`app ${screenSizeClass}`}>
            <App />
            <LoadPanel
              visible={isLoading}
              showIndicator={true}
              showPane={true}
              shading={true}
              position={{ of: window }}
              shadingColor='rgba(0,0,0,0.4)'
            />
          </div>
        </NavigationProvider>
      </ThemeContext.Provider>
    </Router>
  );
}