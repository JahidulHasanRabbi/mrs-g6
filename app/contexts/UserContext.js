"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getMemberInfo, getProfile } from '../api/memberApi';
import { tokenStorage } from '../api/tokenStorage';
import { onAuthChanged } from '../api/authEvents';

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
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [memberUuid, setMemberUuid] = useState(null);

  // Check for memberUuid changes natively via events
  useEffect(() => {
    // Check immediately on mount
    const uuid = tokenStorage.getMemberUuid();
    if (uuid !== memberUuid) {
      setMemberUuid(uuid);
    }

    // Subscribe to auth events (dispatched when tokens are set/cleared)
    const unsubscribe = onAuthChanged(() => {
      const newUuid = tokenStorage.getMemberUuid();
      if (newUuid !== memberUuid) {
        setMemberUuid(newUuid);
      }
    });

    return () => unsubscribe();
  }, [memberUuid]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!memberUuid) {
        // Reset to defaults when logged out / token expired / cleared
        setUserData({
          name: "Jhon Doe",
          balance: "0.00",
          currentLevel: "Gold",
          nextLevel: "Platinum",
          progress: 61.6,
          tokensNeeded: 20000,
        });
        setProfilePicture(null);
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);

      try {
        // Fetch member info for balance and basic data
        const memberInfo = await getMemberInfo(memberUuid);
        const formattedBalance = parseFloat(memberInfo.current_tokens).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        setUserData(prev => ({
          ...prev,
          name: memberInfo.username || prev.name,
          balance: formattedBalance,
          currentLevel: memberInfo.tier || prev.currentLevel,
        }));

        // Fetch profile data for profile picture
        try {
          const profileData = await getProfile(memberUuid);
          if (profileData.profile_picture) {
            setProfilePicture(profileData.profile_picture);
          }
        } catch (profileError) {
          console.error('UserContext: Error loading profile picture:', profileError);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserData();
  }, [memberUuid]);

  const refreshUserData = async () => {
    const uuid = tokenStorage.getMemberUuid();
    if (!uuid) return;

    try {
      const memberInfo = await getMemberInfo(uuid);
      const formattedBalance = parseFloat(memberInfo.current_tokens).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setUserData(prev => ({
        ...prev,
        name: memberInfo.username || prev.name,
        balance: formattedBalance,
        currentLevel: memberInfo.tier || prev.currentLevel,
      }));
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const updateBalance = (newBalance) => {
    setUserData(prev => ({ ...prev, balance: newBalance }));
  };

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const updateProfilePicture = async () => {
    const memberUuid = tokenStorage.getMemberUuid();
    if (!memberUuid) return;

    try {
      const profileData = await getProfile(memberUuid);
      if (profileData.profile_picture) {
        setProfilePicture(profileData.profile_picture);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      profilePicture, 
      isLoadingProfile,
      updateBalance, 
      updateUserData,
      updateProfilePicture,
      refreshUserData
    }}>
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
