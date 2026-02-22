"use client";

import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: "Jhon Doe",
    balance: "5,450.00",
    currentLevel: "Gold",
    nextLevel: "Platinum",
    progress: 61.6,
    tokensNeeded: 20000,
  });

  const updateBalance = (newBalance) => {
    setUserData(prev => ({ ...prev, balance: newBalance }));
  };

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, updateBalance, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
