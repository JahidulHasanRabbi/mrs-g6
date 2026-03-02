"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useConditionalFields } from "../../../hooks/useConditionalFields";
import { getOptionsArray } from "../../../api/apiOptions";
import ErrorDisplay from "../../ui/ErrorDisplay";

// Configuration for conditional fields
const redemptionFieldConfig = {
  prize_type: [
    {
      field: 'credit_amount',
      showWhen: [3], // CREDIT
      required: true
    }
  ]
};

export default function RedemptionItemForm({ 
  isOpen, 
  onClose, 
  onSubmit,
  mode = "add", // "add" or "edit"
  initialData = null,
  isLoading = false,
  error = null
}) {
  const { visibleFields, updateFieldVisibility, fieldValues, setFieldValues } = 
    useConditionalFields(redemptionFieldConfig);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);

  const prizeTypeOptions = getOptionsArray('PRIZE_TYPE');

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      const initialValues = {
        name: initialData.name || "",
        quantity: initialData.quantity || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        prize_type: initialData.prize_type || "",
        tokens_needed: initialData.tokens_needed || "",
        promotion: initialData.promotion || "",
        credit_amount: initialData.credit_amount || ""
      };
      
      setFieldValues(initialValues);
      setImagePreview(initialData.image || null);
      
      // Set initial visibility
      if (initialData.prize_type) {
        updateFieldVisibility('prize_type', initialData.prize_type);
      }
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build submission data with only visible fields
    const submitData = {};
    
    // Always include these fields
    submitData.name = fieldValues.name;
    submitData.quantity_available = parseInt(fieldValues.quantity, 10);
    submitData.start_date = fieldValues.start_date;
    submitData.end_date = fieldValues.end_date;
    submitData.prize_type = fieldValues.prize_type;
    submitData.tokens_needed = parseInt(fieldValues.tokens_needed, 10);
    submitData.promotion = fieldValues.promotion;
    
    // Include credit_amount only if visible (when prize_type is CREDIT)
    if (visibleFields.credit_amount) {
      submitData.credit_amount = parseFloat(fieldValues.credit_amount);
    }
    
    // Include image file if uploaded
    if (imageFile) {
      submitData.image = imageFile;
    }
    
    await onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFieldValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrizeTypeChange = (value) => {
    const numValue = parseInt(value, 10);
    handleInputChange('prize_type', numValue);
    updateFieldVisibility('prize_type', numValue);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-w-[565px] w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Content */}
        <div className="bg-[#4d4d4d] border border-white/50 shadow-[1px_4px_75px_9px_rgba(174,174,174,0.15)] p-8">
          {/* Modal Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative h-[60px] w-[60px]">
              <Image
                src="/assets/admin/spin-items/modal-icon.svg"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Modal Title */}
          <h2 className="text-center text-[28px] font-bold text-white capitalize font-['Times_New_Roman'] mb-8">
            {mode === "add" ? "Add New Redemption Item" : "Edit Redemption Item"}
          </h2>

          {/* Error Display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[135px]">
                Name:
              </label>
              <input
                type="text"
                value={fieldValues.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-white/10 border-[#f2c36b] border-[0.5px] h-[36px] rounded-[4px] w-[305px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                placeholder="Enter item name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                Quantity:
              </label>
              <input
                type="number"
                value={fieldValues.quantity || ""}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                placeholder="Enter quantity"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                Start Date:
              </label>
              <input
                type="date"
                value={fieldValues.start_date || ""}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
                required
                disabled={isLoading}
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                End Date:
              </label>
              <input
                type="date"
                value={fieldValues.end_date || ""}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
                required
                disabled={isLoading}
              />
            </div>

            {/* Prize Type */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                Prize Type:
              </label>
              <select
                value={fieldValues.prize_type || ""}
                onChange={(e) => handlePrizeTypeChange(e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
                required
                disabled={isLoading}
              >
                <option value="">Select prize type</option>
                {prizeTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Field for CREDIT */}
            {visibleFields.credit_amount && (
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                  Credit Amount:
                </label>
                <input
                  type="number"
                  value={fieldValues.credit_amount || ""}
                  onChange={(e) => handleInputChange("credit_amount", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter credit amount"
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Tokens Needed */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                Tokens Needed:
              </label>
              <input
                type="number"
                value={fieldValues.tokens_needed || ""}
                onChange={(e) => handleInputChange("tokens_needed", e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                placeholder="Enter tokens needed"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            {/* Promotion */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                Promotion:
              </label>
              <input
                type="text"
                value={fieldValues.promotion || ""}
                onChange={(e) => handleInputChange("promotion", e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                placeholder="Enter promotion text"
                required
                disabled={isLoading}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex justify-start">
                <label className="text-[18px] text-white font-['Times_New_Roman']">
                  Image
                </label>
              </div>
              
              <div className="border-[#d3d3d3] border-[0.5px] border-dashed h-[199px] rounded-[8px] flex items-center justify-center relative overflow-hidden">
                {imagePreview ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={imagePreview}
                      alt="Item preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="relative h-[59px] w-[59px] mx-auto mb-4">
                      <Image
                        src="/assets/admin/spin-items/upload-icon.svg"
                        alt="Upload"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-white/60 text-sm">Click to upload image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[21px] justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#e5e6e6] h-[37px] px-[18px] py-[13px] rounded-[4px] flex items-center justify-center"
                disabled={isLoading}
              >
                <span className="text-[#f04a4a] text-[14px] font-bold font-['Times_New_Roman']">
                  Cancel
                </span>
              </button>
              
              <button
                type="submit"
                className="h-[37px] px-[18px] py-[13px] rounded-[4px] flex items-center justify-center disabled:opacity-50"
                style={{
                  backgroundImage: "linear-gradient(1.2852950753927956deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
                }}
                disabled={isLoading}
              >
                <span className="text-black text-[14px] font-bold font-['Times_New_Roman']">
                  {isLoading ? 'Saving...' : 'Confirm'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
