"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ErrorDisplay from "../../ui/ErrorDisplay";

export default function SpinSequenceModal({ 
  isOpen, 
  onClose,
  onSubmit,
  mode = "add", // "add" or "edit"
  initialData = null,
  spinItems = [],
  isLoading = false,
  error = null
}) {
  const [formData, setFormData] = useState({
    item_order: "",
    item_uuid: "",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        item_order: initialData.item_order || "",
        item_uuid: initialData.item_uuid || "",
      });
    } else if (mode === "add") {
      setFormData({
        item_order: "",
        item_uuid: "",
      });
    }
  }, [mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      item_order: parseInt(formData.item_order, 10),
      item_uuid: formData.item_uuid
    };
    
    await onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-w-[465px] w-full">
        {/* Modal Content */}
        <div className="bg-[#4d4d4d] border border-white/50 rounded-[14px] shadow-[1px_4px_75px_9px_rgba(174,174,174,0.15)] p-8">
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
            {mode === "add" ? "Add New Spin Sequence" : "Edit Spin Sequence"}
          </h2>

          {/* Error Display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Text Input Fields */}
            <div className="space-y-4">
              {/* Spin Sequence */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white font-['Times_New_Roman'] w-[135px]">
                  Spin Sequence:
                </label>
                <input
                  type="number"
                  value={formData.item_order}
                  onChange={(e) => handleInputChange("item_order", e.target.value)}
                  className="bg-white/10 border-[#f2c36b] border-[0.5px] h-[36px] rounded-[4px] w-[305px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter sequence number"
                  min="1"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Items */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                  Items:
                </label>
                <select
                  value={formData.item_uuid}
                  onChange={(e) => handleInputChange("item_uuid", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select an item</option>
                  {spinItems.map(item => (
                    <option key={item.uuid} value={item.uuid}>
                      {item.reward_name}
                    </option>
                  ))}
                </select>
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
