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
import { getFrameById } from "../profile/profileFrames";
import { FORM_FIELDS, PERSONAL_DATA_ASSETS } from "./constants";
import { getProfile, updateProfile } from "@/app/api/memberApi";
import { mapProfileDataToForm, mapFormDataToProfileUpdate } from "@/app/api/responseMappers";
import { tokenStorage } from "@/app/api/tokenStorage";
import { useUser } from "@/app/contexts/UserContext";

export default function PersonalDataForm({ currentStep = 1, onSubmit }) {
  const router = useRouter();
  const { updateProfilePicture, selectedFrameId, updateSelectedFrame } = useUser();
  const [formData, setFormData] = useState(
    FORM_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: "" }), {})
  );
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [freeTokenFlag, setFreeTokenFlag] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);

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
        setFormData({
          full_name: mappedData.full_name,
          email: mappedData.email,
          date_of_birth: mappedData.date_of_birth,
          gender: mappedData.gender,
          hobby: mappedData.hobby
        });
        
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
      
      // Transform form data to API format (only filled fields, convert enums to integers)
      const updatePayload = mapFormDataToProfileUpdate(formData);
      
      // Add profile picture if a new one was selected
      if (profileImageFile) {
        updatePayload.profile_picture = profileImageFile;
      }
      
      // Call update profile API
      await updateProfile(memberUuid, updatePayload);
      
      // Refresh profile data after successful update
      const updatedProfile = await getProfile(memberUuid);
      const mappedData = mapProfileDataToForm(updatedProfile);
      setFormData({
        full_name: mappedData.full_name,
        email: mappedData.email,
        date_of_birth: mappedData.date_of_birth,
        gender: mappedData.gender,
        hobby: mappedData.hobby
      });
      
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
        <div className="text-[#e9af41] text-lg">Loading profile...</div>
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
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#e9af41] text-black rounded-lg hover:opacity-80 transition-opacity"
        >
          Retry
        </button>
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

      <button
        type="button"
        onClick={() => setIsFrameModalOpen(true)}
        className="flex items-center gap-2 px-5 py-2 -mt-1 rounded-full border border-[#e9af41] bg-[#0a1a0a]/80 text-[#e9af41] text-[13px] font-bold font-['Times_New_Roman'] shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:bg-[#e9af41]/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
        Change Frame
        <span className="text-[#a8c08a] text-[11px] font-normal">· {currentFrame.name}</span>
      </button>

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

      {/* Profile Frame Picker */}
      <FrameSelectionModal
        isOpen={isFrameModalOpen}
        onClose={() => setIsFrameModalOpen(false)}
        currentFrameId={selectedFrameId}
        onSelect={updateSelectedFrame}
        profilePicture={profileImage || "/android-chrome-512x512.png"}
      />
    </motion.div>
  );
}
