"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useConditionalFields } from "../../../hooks/useConditionalFields";
import { getOptionsArray, getOptionValue } from "../../../api/apiOptions";
import ErrorDisplay from "../../ui/ErrorDisplay";

// Configuration for conditional fields
const luckySpinFieldConfig = {
  item_type: [
    {
      field: 'min_withdraw',
      showWhen: [1], // Free Credit
      required: true
    },
    {
      field: 'max_withdraw',
      showWhen: [1], // Free Credit
      required: true
    },
    {
      field: 'token_amount',
      showWhen: [3], // Token
      required: true
    }
  ],
  unlimited: [
    {
      field: 'quantity',
      showWhen: [false], // Only required when unlimited is false
      required: true
    }
  ]
};

export default function LuckySpinItemForm({ 
  isOpen, 
  onClose, 
  onSubmit,
  mode = "add", // "add" or "edit"
  initialData = null,
  isLoading = false,
  error = null
}) {
  const { visibleFields, updateFieldVisibility, fieldValues, setFieldValues } = 
    useConditionalFields(luckySpinFieldConfig);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);

  const itemTypeOptions = getOptionsArray('ITEM_TYPE');

  // Initialize form with existing data
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const itemTypeValue = typeof initialData.item_type === 'string'
        ? getOptionValue('ITEM_TYPE', initialData.item_type)
        : initialData.item_type;
      
      const initialValues = {
        reward_name: initialData.reward_name || "",
        item_type: itemTypeValue || "",
        quantity: initialData.quantity || "",
        unlimited: initialData.unlimited || false,
        min_withdraw: initialData.min_withdraw || "",
        max_withdraw: initialData.max_withdraw || "",
        token_amount: initialData.token_amount || ""
      };
      
      setFieldValues(initialValues);
      setImagePreview(initialData.image || null);
      
      if (itemTypeValue) {
        updateFieldVisibility('item_type', itemTypeValue);
      }
      
      if (initialData.unlimited !== undefined) {
        updateFieldVisibility('unlimited', initialData.unlimited);
      }
    } else if (mode === "add") {
      setFieldValues({
        reward_name: "",
        item_type: "",
        quantity: "",
        unlimited: false,
        min_withdraw: "",
        max_withdraw: "",
        token_amount: ""
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [mode, initialData, updateFieldVisibility, setFieldValues]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build submission data with only visible fields
    const submitData = {};
    
    // Always include these fields
    submitData.reward_name = fieldValues.reward_name;
    submitData.item_type = fieldValues.item_type;
    submitData.unlimited = fieldValues.unlimited || false;
    
    // Include quantity only if visible (when unlimited is false)
    if (visibleFields.quantity !== false && !fieldValues.unlimited) {
      submitData.quantity = parseInt(fieldValues.quantity, 10);
    }
    
    // Include conditional fields for Free Credit
    if (visibleFields.min_withdraw) {
      submitData.min_withdraw = parseFloat(fieldValues.min_withdraw);
    }
    if (visibleFields.max_withdraw) {
      submitData.max_withdraw = parseFloat(fieldValues.max_withdraw);
    }

    // Include token_amount for Token type
    if (visibleFields.token_amount) {
      submitData.token_amount = parseInt(fieldValues.token_amount, 10);
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

  const handleItemTypeChange = (value) => {
    const numValue = parseInt(value, 10);
    handleInputChange('item_type', numValue);
    updateFieldVisibility('item_type', numValue);
  };

  const handleUnlimitedChange = (checked) => {
    handleInputChange('unlimited', checked);
    updateFieldVisibility('unlimited', checked);
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
          <h2 className="text-center text-[28px] font-bold text-white capitalize mb-8">
            {mode === "add" ? "Add New Spin Item" : "Edit Spin Item"}
          </h2>

          {/* Error Display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reward Name */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white w-[135px]">
                Reward Name:
              </label>
              <input
                type="text"
                value={fieldValues.reward_name || ""}
                onChange={(e) => handleInputChange("reward_name", e.target.value)}
                className="bg-white/10 border-[#f2c36b] border-[0.5px] h-[36px] rounded-[4px] w-[305px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                placeholder="Enter reward name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Item Type */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white w-[136px]">
                Item Type:
              </label>
              <select
                value={fieldValues.item_type || ""}
                onChange={(e) => handleItemTypeChange(e.target.value)}
                className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
                style={{
                  colorScheme: 'dark'
                }}
                required
                disabled={isLoading}
              >
                <option value="">Select item type</option>
                {itemTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Fields for Free Credit */}
            {visibleFields.min_withdraw && (
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Min Withdraw:
                </label>
                <input
                  type="number"
                  value={fieldValues.min_withdraw || ""}
                  onChange={(e) => handleInputChange("min_withdraw", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter minimum withdraw"
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {visibleFields.max_withdraw && (
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Max Withdraw:
                </label>
                <input
                  type="number"
                  value={fieldValues.max_withdraw || ""}
                  onChange={(e) => handleInputChange("max_withdraw", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter maximum withdraw"
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {visibleFields.token_amount && (
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Token Amount:
                </label>
                <input
                  type="number"
                  value={fieldValues.token_amount || ""}
                  onChange={(e) => handleInputChange("token_amount", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter token amount"
                  min="0"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Unlimited Checkbox */}
            <div className="flex items-center gap-[18px]">
              <label className="text-[18px] text-white w-[136px]">
                Unlimited:
              </label>
              <input
                type="checkbox"
                checked={fieldValues.unlimited || false}
                onChange={(e) => handleUnlimitedChange(e.target.checked)}
                className="h-[20px] w-[20px] rounded border-white/20 bg-white/10 focus:ring-2 focus:ring-[#f2c36b]"
                disabled={isLoading}
              />
            </div>

            {/* Quantity - conditional based on unlimited */}
            {visibleFields.quantity !== false && !fieldValues.unlimited && (
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
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
            )}

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex justify-start">
                <label className="text-[18px] text-white">
                  Image
                </label>
              </div>
              
              <div className="border-[#d3d3d3] border-[0.5px] border-dashed h-[199px] rounded-[8px] flex items-center justify-center relative overflow-hidden">
                {imagePreview ? (
                  <div className="relative h-full w-full">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="w-full h-full object-contain"
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
                <span className="text-[#f04a4a] text-[14px] font-bold">
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
                <span className="text-black text-[14px] font-bold">
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
