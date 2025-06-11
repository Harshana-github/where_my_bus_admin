import { Routes, Route, Navigate } from 'react-router-dom';
import appInfo from './app-info';
import routes from './app-routes';
import { SideNavOuterToolbar as SideNavBarLayout } from './layouts';
import { Footer } from './components';

export default function Content() {
  return (
    <SideNavBarLayout title={appInfo.title}>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
        <Route
          path='*'
          element={<Navigate to='/home' />}
        />
      </Routes>
      <Footer>
        Copyright © 2015-{new Date().getFullYear()} {appInfo.title} Inc. All trademarks or registered trademarks are property of their respective owners.
      </Footer>
    </SideNavBarLayout>
  );
}

