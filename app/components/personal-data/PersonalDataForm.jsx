"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProgressBar from "./StepIndicator";
import ProfileImageUpload from "./ProfileImageUpload";
import FormField from "./FormField";
import SubmitButton from "./SubmitButton";
import SuccessModal from "../ui/SuccessModal";
import { FORM_FIELDS, PERSONAL_DATA_ASSETS } from "./constants";
import { getProfile, updateProfile } from "@/app/api/memberApi";
import { mapProfileDataToForm, mapFormDataToProfileUpdate } from "@/app/api/responseMappers";
import { tokenStorage } from "@/app/api/tokenStorage";

export default function PersonalDataForm({ currentStep = 1, onSubmit }) {
  const [formData, setFormData] = useState(
    FORM_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: "" }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [freeTokenFlag, setFreeTokenFlag] = useState(false);

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

  // Calculate progress based on filled fields (20% per field)
  const calculateProgress = () => {
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim() !== "").length;
    return (filledFields / FORM_FIELDS.length) * 100;
  };

  const progress = calculateProgress();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileEdit = () => {
    console.log("Edit profile picture clicked");
    // Add file upload logic here
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
      setFreeTokenFlag(mappedData.free_token_flag);
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
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
        imageSrc="/assets/personal-data/profile-placeholder.png"
        onEditClick={handleProfileEdit}
      />

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
    </motion.div>
  );
}
