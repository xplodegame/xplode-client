import React, { createContext, useContext } from 'react';

interface DepositContextType {
  depositAddress?: string;
}

const DepositContext = createContext<DepositContextType>({});

export const useDepositContext = () => useContext(DepositContext);

export const DepositProvider: React.FC<{
  children: React.ReactNode;
  depositAddress?: string;
}> = ({ children, depositAddress }) => {
  return (
    <DepositContext.Provider value={{ depositAddress }}>
      {children}
    </DepositContext.Provider>
  );
};