import React, { createContext, useContext, useState } from "react";

type GlobalValueType = {
  [key: string]: any;
};

interface GlobalContextType {
  globalValue: GlobalValueType;
  setGlobalValue: React.Dispatch<React.SetStateAction<GlobalValueType>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalValue, setGlobalValue] = useState<GlobalValueType>({});

  return (
    <GlobalContext.Provider value={{ globalValue, setGlobalValue }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
