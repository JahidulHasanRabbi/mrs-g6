"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getMemberInfo, getProfile, getPublicFrames, getVipTiers } from '../api/memberApi';
import { tokenStorage } from '../api/tokenStorage';
import { onAuthChanged } from '../api/authEvents';
import {
  DEFAULT_FRAME_ID,
  getFrameById,
  setActiveFrames,
  mapApiFrameToInternal,
  getFramesForExactTier,
  getActiveFrames
} from '../components/profile/profileFrames';

const FRAME_STORAGE_KEY = 'mrs_member_profile_frame';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: "",
    balance: "0.00",
    currentLevel: "",
    nextLevel: "",
    progress: 0,
    tokensNeeded: 0,
    currentTierIcon: null,
    nextTierIcon: null,
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [memberUuid, setMemberUuid] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(DEFAULT_FRAME_ID);
  const [availableFrames, setAvailableFrames] = useState([]);
  const [allVipTiers, setAllVipTiers] = useState([]);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Load frames from API when user logs in
  useEffect(() => {
    const loadFrames = async () => {
      // Only load frames if user is logged in
      if (!memberUuid) {
        // Use legacy frames when not logged in
        setAvailableFrames(getActiveFrames());
        setIsLoadingFrames(false);
        return;
      }

      try {
        setIsLoadingFrames(true);
        
        // Fetch frames and VIP tiers in parallel
        const [framesResponse, tiersResponse] = await Promise.all([
          getPublicFrames({ page_size: 100 }), // Get up to 100 frames
          getVipTiers()
        ]);

        // Handle paginated responses
        const framesData = Array.isArray(framesResponse) 
          ? framesResponse 
          : (framesResponse?.results || []);
        
        const tiersData = Array.isArray(tiersResponse)
          ? tiersResponse
          : (tiersResponse?.results || []);

        // Map API frames to internal structure
        const mappedFrames = framesData.map((apiFrame, index) => 
          mapApiFrameToInternal(apiFrame, index)
        );

        // Update active frames globally
        if (mappedFrames.length > 0) {
          setActiveFrames(mappedFrames);
          setAvailableFrames(mappedFrames);
        }

        setAllVipTiers(tiersData);
        
      } catch (error) {
        console.error('Failed to load frames from API, using legacy frames:', error);
        // Fallback to legacy frames is already set in profileFrames.js
        setAvailableFrames(getActiveFrames());
      } finally {
        setIsLoadingFrames(false);
      }
    };

    loadFrames();
  }, [memberUuid]); // Load frames when user logs in

  // Load persisted frame choice on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(FRAME_STORAGE_KEY);
      if (stored) setSelectedFrameId(stored);
    } catch (e) {
      // localStorage unavailable (private mode, etc.) — fall back to default
    }
  }, []);

  const updateSelectedFrame = (frameId) => {
    setSelectedFrameId(frameId);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(FRAME_STORAGE_KEY, frameId);
      } catch (e) {
        // ignore
      }
    }
  };

  const selectedFrame = getFrameById(selectedFrameId);

  // Check for memberUuid changes natively via events
  useEffect(() => {
    const uuid = tokenStorage.getMemberUuid(); // validates token expiry internally
    if (uuid !== memberUuid) setMemberUuid(uuid);
    setAuthReady(true);

    const unsubscribe = onAuthChanged(() => {
      const newUuid = tokenStorage.getMemberUuid();
      if (newUuid !== memberUuid) setMemberUuid(newUuid);
    });

    return () => unsubscribe();
  }, [memberUuid]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!memberUuid) {
        // Reset to defaults when logged out / token expired / cleared
        setUserData({
          name: "",
          balance: "0.00",
          currentLevel: "",
          nextLevel: "",
          progress: 0,
          tokensNeeded: 0,
          currentTierIcon: null,
          nextTierIcon: null,
        });
        setProfilePicture(null);
        setProfileData(null);
        setIsLoadingProfile(false);
        // Reset to all frames when logged out
        setAvailableFrames(getActiveFrames());
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

        let tierProgress = {};
        if (allVipTiers.length > 0 && memberInfo.tier) {
          const sorted = [...allVipTiers].sort((a, b) =>
            parseFloat(a.lifetime_deposit_required) - parseFloat(b.lifetime_deposit_required)
          );
          const idx = sorted.findIndex(t => t.name === memberInfo.tier);
          if (idx !== -1) {
            const cur = sorted[idx];
            const nxt = idx < sorted.length - 1 ? sorted[idx + 1] : null;
            const dep = parseFloat(memberInfo.total_deposit) || 0;
            const curReq = parseFloat(cur.lifetime_deposit_required) || 0;
            const nxtReq = nxt ? parseFloat(nxt.lifetime_deposit_required) || 0 : curReq;
            const range = nxt ? nxtReq - curReq : 1;
            tierProgress = {
              nextLevel: nxt ? nxt.name : cur.name,
              progress: nxt ? Math.min(100, Math.max(0, ((dep - curReq) / range) * 100)) : 100,
              tokensNeeded: nxt ? Math.max(0, nxtReq - dep) : 0,
              currentTierIcon: cur.rank_icon || null,
              nextTierIcon: nxt?.rank_icon || null,
            };
          }
        }

        setUserData(prev => ({
          ...prev,
          name: memberInfo.username || prev.name,
          balance: formattedBalance,
          currentLevel: memberInfo.tier || prev.currentLevel,
          ...tierProgress,
        }));

        // Only show frames belonging to the user's exact VIP tier
        const tierFrames = getFramesForExactTier(memberInfo.tier, allVipTiers);
        setAvailableFrames(tierFrames);

        // Validate the stored frame: if it doesn't belong to the current tier, reset to first tier frame
        const storedFrame = tierFrames.find((f) => f.id === selectedFrameId || f.uuid === selectedFrameId);
        if (!storedFrame && tierFrames.length > 0) {
          setSelectedFrameId(tierFrames[0].id);
        }

        // Fetch profile data for profile picture and field-completion checks
        try {
          const profile = await getProfile(memberUuid);
          setProfileData(profile);
          if (profile.profile_picture) {
            setProfilePicture(profile.profile_picture);
          }
        } catch (profileError) {
          console.error('UserContext: Error loading profile data:', profileError);
        }

        setUserData(prev => ({
          ...prev,
          phoneNumber: memberInfo.phone_number || prev.phoneNumber,
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserData();
  }, [memberUuid, allVipTiers]);

  const refreshUserData = async () => {
    const uuid = tokenStorage.getMemberUuid();
    if (!uuid) return;

    try {
      const memberInfo = await getMemberInfo(uuid);
      const formattedBalance = parseFloat(memberInfo.current_tokens).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      let tierProgress = {};
      if (allVipTiers.length > 0 && memberInfo.tier) {
        const sorted = [...allVipTiers].sort((a, b) =>
          parseFloat(a.lifetime_deposit_required) - parseFloat(b.lifetime_deposit_required)
        );
        const idx = sorted.findIndex(t => t.name === memberInfo.tier);
        if (idx !== -1) {
          const cur = sorted[idx];
          const nxt = idx < sorted.length - 1 ? sorted[idx + 1] : null;
          const dep = parseFloat(memberInfo.total_deposit) || 0;
          const curReq = parseFloat(cur.lifetime_deposit_required) || 0;
          const nxtReq = nxt ? parseFloat(nxt.lifetime_deposit_required) || 0 : curReq;
          const range = nxt ? nxtReq - curReq : 1;
          tierProgress = {
            nextLevel: nxt ? nxt.name : cur.name,
            progress: nxt ? Math.min(100, Math.max(0, ((dep - curReq) / range) * 100)) : 100,
            tokensNeeded: nxt ? Math.max(0, nxtReq - dep) : 0,
            currentTierIcon: cur.rank_icon || null,
            nextTierIcon: nxt?.rank_icon || null,
          };
        }
      }

      setUserData(prev => ({
        ...prev,
        name: memberInfo.username || prev.name,
        balance: formattedBalance,
        currentLevel: memberInfo.tier || prev.currentLevel,
        ...tierProgress,
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
      authReady,
      memberUuid,
      userData,
      profilePicture,
      profileData,
      isLoadingProfile,
      updateBalance,
      updateUserData,
      updateProfilePicture,
      refreshUserData,
      selectedFrame,
      selectedFrameId,
      updateSelectedFrame,
      availableFrames,
      allVipTiers,
      isLoadingFrames
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
