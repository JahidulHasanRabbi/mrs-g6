"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StepIndicator from "./StepIndicator";
import ProfileImageUpload from "./ProfileImageUpload";
import FormField from "./FormField";
import SubmitButton from "./SubmitButton";
import SuccessModal from "../ui/SuccessModal";
import { FORM_FIELDS, PERSONAL_DATA_ASSETS } from "./constants";

export default function PersonalDataForm({ currentStep = 1, onSubmit }) {
  const [formData, setFormData] = useState(
    FORM_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: "" }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileEdit = () => {
    console.log("Edit profile picture clicked");
    // Add file upload logic here
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log("Form submitted:", formData);
      if (onSubmit) {
        await onSubmit(formData);
      }
      // Show success modal after successful submission
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-5 w-full max-w-[400px] mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <StepIndicator currentStep={currentStep} />

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
