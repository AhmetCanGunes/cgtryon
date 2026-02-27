import { useState, useCallback } from 'react';

export type TabId = 'product' | 'model' | 'style' | 'output';

const TAB_ORDER: TabId[] = ['product', 'model', 'style', 'output'];

export function useTabNavigation(initialTab: TabId = 'product') {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const switchTab = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  const nextTab = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIndex + 1]);
    }
  }, [activeTab]);

  const prevTab = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TAB_ORDER[currentIndex - 1]);
    }
  }, [activeTab]);

  const isFirstTab = activeTab === TAB_ORDER[0];
  const isLastTab = activeTab === TAB_ORDER[TAB_ORDER.length - 1];

  return {
    activeTab,
    switchTab,
    nextTab,
    prevTab,
    isFirstTab,
    isLastTab
  };
}
