"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getMemberInfo } from '../api/memberApi';
import { tokenStorage } from '../api/tokenStorage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: "Jhon Doe",
    balance: "0.00",
    currentLevel: "Gold",
    nextLevel: "Platinum",
    progress: 61.6,
    tokensNeeded: 20000,
  });

  useEffect(() => {
    const loadUserData = async () => {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) return;

      try {
        const memberInfo = await getMemberInfo(memberUuid);
        setUserData(prev => ({
          ...prev,
          name: memberInfo.username || prev.name,
          balance: parseFloat(memberInfo.current_tokens).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          currentLevel: memberInfo.tier || prev.currentLevel,
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

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
