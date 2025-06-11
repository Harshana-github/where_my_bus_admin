import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { TreeView } from "devextreme-react/tree-view";
import * as events from "devextreme/events";
import { navigation } from "./app-navigation";
import { useNavigation } from "../../contexts/navigation";
import { useScreenSize } from "../../utils/media-query";
import "./SideNavigationMenu.scss";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../../theme";

export default function SideNavigationMenu(props) {
  const { children, selectedItemChanged, openMenu, compactMode, onMenuReady } = props;

  const { t, i18n } = useTranslation();
  const theme = useContext(ThemeContext);
  const { isLarge } = useScreenSize();

  function translateItems(items) {
    return items.map((item) => {
      const translatedItem = {
        ...item,
        text: t(item.text), // use translation key
      };

      if (item.items) {
        translatedItem.items = translateItems(item.items);
      }

      return translatedItem;
    });
  }

  function normalizePath() {
    const baseItems = navigation.map((item) => ({
      ...item,
      expanded: isLarge,
      path: item.path && !/^\//.test(item.path) ? `/${item.path}` : item.path,
    }));

    return translateItems(baseItems);
  }

  // const items = useMemo(
  //   normalizePath,
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // );

  const items = useMemo(() => normalizePath(), [i18n.language]);

  const {
    navigationData: { currentPath },
  } = useNavigation();

  const treeViewRef = useRef(null);
  const wrapperRef = useRef(null);
  const getWrapperRef = useCallback(
    (element) => {
      const prevElement = wrapperRef.current;
      if (prevElement) {
        events.off(prevElement, "dxclick");
      }

      wrapperRef.current = element;
      events.on(element, "dxclick", (e) => {
        openMenu(e);
      });
    },
    [openMenu]
  );

  useEffect(() => {
    const treeView = treeViewRef.current && treeViewRef.current.instance();
    if (!treeView) {
      return;
    }

    if (currentPath !== undefined) {
      treeView.selectItem(currentPath);
      treeView.expandItem(currentPath);
    }

    if (compactMode) {
      treeView.collapseAll();
    }
  }, [currentPath, compactMode, items]);

  return (
    <div
      className={`dx-swatch-additional${theme?.isDark ? "-dark" : ""} side-navigation-menu`}
      ref={getWrapperRef}
    >
      {children}
      <div className={"menu-container"}>
        <TreeView
          ref={treeViewRef}
          items={items}
          keyExpr={"path"}
          selectionMode={"single"}
          focusStateEnabled={false}
          expandEvent={"click"}
          onItemClick={selectedItemChanged}
          onContentReady={onMenuReady}
          width={"100%"}
        />
      </div>
    </div>
  );
}
