"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProgressBar from "./StepIndicator";
import ProfileImageUpload from "./ProfileImageUpload";
import FormField from "./FormField";
import SubmitButton from "./SubmitButton";
import SuccessModal from "../ui/SuccessModal";
import FrameSelectionModal from "../profile/FrameSelectionModal";
import ThemeSelectionModal from "../profile/ThemeSelectionModal";
import { getFrameById } from "../profile/profileFrames";
import { getThemeLabel } from "@/app/config/themes";
import { FORM_FIELDS, PERSONAL_DATA_ASSETS } from "./constants";
import { getProfile, updateProfile } from "@/app/api/memberApi";
import { mapProfileDataToForm, mapFormDataToProfileUpdate } from "@/app/api/responseMappers";
import { tokenStorage } from "@/app/api/tokenStorage";
import ThemedActionButton from "../themes/shared/ThemedActionButton";
import { useThemeInk } from "../themes/shared/themeInk";
import { useUser } from "@/app/contexts/UserContext";
import { useTheme } from "@/app/contexts/ThemeContext";

// Default-portal look for the Change Frame / Change Theme pair — one component
// so the two buttons cannot drift apart.
function PickerPill({ onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-[#e9af41] bg-black/70 px-3 text-[14px] font-bold text-[#e9af41] font-['Times_New_Roman'] shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:bg-[#e9af41]/10 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

const FRAME_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
);

const THEME_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18 4.5 4.5 0 0 0 0-9 4.5 4.5 0 0 1 0-9Z" />
  </svg>
);

export default function PersonalDataForm({ currentStep = 1, onSubmit }) {
  const router = useRouter();
  const { updateProfilePicture, selectedFrameId, updateSelectedFrame } = useUser();
  const { themeId } = useTheme();
  // Loading text sits directly on the page backdrop, so it follows the same
  // light/dark split as every other label on this page.
  const ink = useThemeInk();
  const loadingTextStyle = { color: ink.label, textShadow: ink.onLight ? ink.halo : undefined };
  const [formData, setFormData] = useState(
    FORM_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: "" }), {})
  );
  const [originalData, setOriginalData] = useState({}); // Track original values
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [freeTokenFlag, setFreeTokenFlag] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const currentFrame = getFrameById(selectedFrameId);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const memberUuid = tokenStorage.getMemberUuid();
        if (!memberUuid) {
          throw new Error("Member UUID not found");
        }
        
        const profileData = await getProfile(memberUuid);
        const mappedData = mapProfileDataToForm(profileData);
        
        // Update form data with API response
        const initialFormData = {
          full_name: mappedData.full_name,
          email: mappedData.email,
          date_of_birth: mappedData.date_of_birth,
          gender: mappedData.gender,
          hobby: mappedData.hobby
        };
        
        setFormData(initialFormData);
        setOriginalData(initialFormData); // Store original values
        
        // Set profile image if available
        if (profileData.profile_picture) {
          setProfileImage(profileData.profile_picture);
        }
        
        setFreeTokenFlag(mappedData.free_token_flag);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Calculate progress based on filled fields + profile image (16.67% per field for 6 total items)
  const calculateProgress = () => {
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim() !== "").length;
    const hasProfileImage = profileImage ? 1 : 0;
    const totalItems = FORM_FIELDS.length + 1; // 5 fields + 1 profile image
    return ((filledFields + hasProfileImage) / totalItems) * 100;
  };

  const progress = calculateProgress();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileEdit = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setProfileImage(previewUrl);
        setProfileImageFile(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        throw new Error("Member UUID not found");
      }
      
      // Only send personal fields if they were originally empty (can only be set once)
      // Don't send them at all if they already have values
      const updatePayload = {};
      
      if (!originalData.full_name && formData.full_name) {
        updatePayload.full_name = formData.full_name;
      }
      if (!originalData.email && formData.email) {
        updatePayload.email = formData.email;
      }
      if (!originalData.date_of_birth && formData.date_of_birth) {
        updatePayload.date_of_birth = formData.date_of_birth;
      }
      if (!originalData.gender && formData.gender) {
        updatePayload.gender = parseInt(formData.gender, 10);
      }
      if (!originalData.hobby && formData.hobby) {
        updatePayload.hobby = parseInt(formData.hobby, 10);
      }
      
      // Add profile picture if a new one was selected
      if (profileImageFile) {
        updatePayload.profile_picture = profileImageFile;
      }
      
      // Call update profile API
      await updateProfile(memberUuid, updatePayload);
      
      // Refresh profile data after successful update
      const updatedProfile = await getProfile(memberUuid);
      const mappedData = mapProfileDataToForm(updatedProfile);
      const updatedFormData = {
        full_name: mappedData.full_name,
        email: mappedData.email,
        date_of_birth: mappedData.date_of_birth,
        gender: mappedData.gender,
        hobby: mappedData.hobby
      };
      
      setFormData(updatedFormData);
      setOriginalData(updatedFormData); // Update original data
      
      // Set profile image if available
      if (updatedProfile.profile_picture) {
        setProfileImage(updatedProfile.profile_picture);
      }
      
      // Check if user just earned free tokens (was false, now true)
      const earnedTokens = !freeTokenFlag && mappedData.free_token_flag;
      setFreeTokenFlag(mappedData.free_token_flag);
      
      // Update profile picture in global context
      await updateProfilePicture();
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Show success modal only if tokens were earned
      if (earnedTokens) {
        setShowSuccessModal(true);
      } else {
        // Just navigate back if no tokens earned
        router.push('/profile');
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Navigate back to profile page after closing the success modal
    router.push('/profile');
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-5 w-full max-w-[400px] mx-auto px-4 min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-lg" style={loadingTextStyle}>Loading profile...</div>
      </motion.div>
    );
  }

  // Error state
  if (error && !formData.full_name && !formData.email) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-5 w-full max-w-[400px] mx-auto px-4 min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-red-500 text-center">{error}</div>
        <div className="flex justify-center">
          <ThemedActionButton
            textSize={16}
            onClick={() => window.location.reload()}
            fallback={
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#e9af41] text-black rounded-lg hover:opacity-80 transition-opacity"
              >
                Retry
              </button>
            }
          >
            Retry
          </ThemedActionButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-5 w-full max-w-[400px] mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ProgressBar progress={progress} />

      <ProfileImageUpload
        imageSrc={profileImage || "/android-chrome-512x512.png"}
        onEditClick={handleProfileEdit}
        frameId={selectedFrameId}
      />

      {/* Change Frame (left) + Change Theme (right), equal size and style. */}
      <div className="w-full -mt-1">
        <div className="grid grid-cols-2 gap-2">
          <ThemedActionButton
            textSize={15}
            onClick={() => setIsFrameModalOpen(true)}
            fallback={
              <PickerPill
                onClick={() => setIsFrameModalOpen(true)}
                icon={FRAME_ICON}
                label="Change Frame"
              />
            }
          >
            Change Frame
          </ThemedActionButton>

          <ThemedActionButton
            textSize={15}
            onClick={() => setIsThemeModalOpen(true)}
            fallback={
              <PickerPill
                onClick={() => setIsThemeModalOpen(true)}
                icon={THEME_ICON}
                label="Change Theme"
              />
            }
          >
            Change Theme
          </ThemedActionButton>
        </div>

        <div
          className="grid grid-cols-2 gap-2 mt-1 text-[10px] font-['Times_New_Roman']"
          style={{ color: ink.meta }}
        >
          <span className="text-center truncate">{currentFrame?.name}</span>
          <span className="text-center truncate">{getThemeLabel(themeId)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-[14px] w-full">
        {FORM_FIELDS.map((field) => (
          <FormField
            key={field.id}
            {...field}
            value={formData[field.id]}
            onChange={handleInputChange}
          />
        ))}
      </div>

      {/* Display error message if submission fails */}
      {error && (
        <div className="text-red-500 text-sm text-center w-full">
          {error}
        </div>
      )}

      <SubmitButton
        onClick={handleSubmit}
        label="Saved Change"
        disabled={isSubmitting}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title="🎁  100% Done — Reward Unlocked"
        message="Thanks for completing your profile. 10 Free Coins added."
        backgroundColor="rgba(96, 128, 60, 1)"
      />

      {/* Frame picker — only shows frames for the user's current VIP tier */}
      <FrameSelectionModal
        isOpen={isFrameModalOpen}
        onClose={() => setIsFrameModalOpen(false)}
        currentFrameId={selectedFrameId}
        onSelect={updateSelectedFrame}
        profilePicture={profileImage || "/android-chrome-512x512.png"}
      />

      {/* Theme picker — any of the 6 brand looks, remembered across stations */}
      <ThemeSelectionModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

    </motion.div>
  );
}
