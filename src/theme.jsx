import React, { useCallback, useMemo, useState } from 'react';
import Cookies from 'js-cookie';

const themes = ['light', 'dark'];
const themeClassNamePrefix = 'dx-swatch-';

function getNextTheme(currentTheme = '') {
  const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
  return themes[nextIndex];
}

function getCurrentTheme() {
  const cookieTheme = Cookies.get('theme');
  
  if (cookieTheme) {
    return cookieTheme;
  }

  // if (window.matchMedia) {
  //   const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //   return systemPrefersDark ? 'dark' : 'light';
  // }

  return themes[0];
}

function applyTheme(newTheme, prevTheme) {
  document.body.classList.replace(
    themeClassNamePrefix + prevTheme,
    themeClassNamePrefix + newTheme
  );
  Cookies.set('theme', newTheme, { expires: Infinity });
}

function toggleTheme(prevTheme) {
  const newTheme = getNextTheme(prevTheme);
  applyTheme(newTheme, prevTheme);
  return newTheme;
}

export function useThemeContext() {
  const [theme, setTheme] = useState(() => {
    const initialTheme = getCurrentTheme();
    if (!document.body.className.includes(themeClassNamePrefix)) {
      document.body.classList.add(themeClassNamePrefix + initialTheme);
    }
    return initialTheme;
  });

  const switchTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const newTheme = toggleTheme(currentTheme);
      return newTheme;
    });
  }, []);

  const isDark = useMemo(() => theme === 'dark', [theme]);

  return useMemo(() => ({ theme, switchTheme, isDark }), [theme, switchTheme, isDark]);
}

export const ThemeContext = React.createContext(null);
