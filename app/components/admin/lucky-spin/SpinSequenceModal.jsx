"use client";

import { useState } from "react";
import Image from "next/image";

export default function SpinSequenceModal({ 
  isOpen, 
  onClose, 
  mode = "add", // "add" or "edit"
  initialData = null 
}) {
  const [formData, setFormData] = useState({
    spinSequence: initialData?.spinSequence || "",
    items: initialData?.items || "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form data:", formData);
    onClose();
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
          <h2 className="text-center text-[28px] font-bold text-white capitalize font-['Times_New_Roman'] mb-16">
            {mode === "add" ? "Add New Spin Items" : "Edit Spin Item"}
          </h2>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Text Input Fields */}
            <div className="space-y-4">
              {/* Spin Sequence */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white font-['Times_New_Roman'] w-[135px]">
                  Spin Sequence:
                </label>
                <input
                  type="number"
                  value={formData.spinSequence}
                  onChange={(e) => handleInputChange("spinSequence", e.target.value)}
                  className="bg-white/10 border-[#f2c36b] border-[0.5px] h-[36px] rounded-[4px] w-[305px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter sequence number"
                  min="1"
                  required
                />
              </div>

              {/* Items */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white font-['Times_New_Roman'] w-[136px]">
                  Items:
                </label>
                <input
                  type="text"
                  value={formData.items}
                  onChange={(e) => handleInputChange("items", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter item name"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[21px] justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#e5e6e6] h-[37px] px-[18px] py-[13px] rounded-[4px] flex items-center justify-center"
              >
                <span className="text-[#f04a4a] text-[14px] font-bold font-['Times_New_Roman']">
                  Cancel
                </span>
              </button>
              
              <button
                type="submit"
                className="h-[37px] px-[18px] py-[13px] rounded-[4px] flex items-center justify-center"
                style={{
                  backgroundImage: "linear-gradient(1.2852950753927956deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
                }}
              >
                <span className="text-black text-[14px] font-bold font-['Times_New_Roman']">
                  Confirm
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
