import React, { createContext, useCallback, useContext, useState } from "react";

type TabBarContextType = {
  isScrolled: boolean;
  onScroll: (y: number) => void;
};

const TabBarContext = createContext<TabBarContextType>({
  isScrolled: false,
  onScroll: () => {},
});

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  const onScroll = useCallback((y: number) => {
    setIsScrolled(y > 56);
  }, []);

  return (
    <TabBarContext.Provider value={{ isScrolled, onScroll }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  return useContext(TabBarContext);
}
