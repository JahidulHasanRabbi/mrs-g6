"use client";

import { useState } from "react";
import Image from "next/image";

export default function SpinItemModal({ 
  isOpen, 
  onClose, 
  mode = "add", // "add" or "edit"
  initialData = null 
}) {
  const [formData, setFormData] = useState({
    rewardName: initialData?.rewardName || "",
    probability: initialData?.probability || "",
    quantity: initialData?.quantity || "",
    itemImage: initialData?.itemImage || null,
  });

  const [imageFile, setImageFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          itemImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-w-[565px] w-full">
        {/* Modal Content */}
        <div className="bg-[#4d4d4d] border border-white/50  shadow-[1px_4px_75px_9px_rgba(174,174,174,0.15)] p-8">
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
          <h2 className="text-center text-[28px] font-bold text-white capitalize mb-16">
            {mode === "add" ? "Add New Spin Items" : "Edit Spin Item"}
          </h2>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Text Input Fields */}
            <div className="space-y-4">
              {/* Reward Name */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[135px]">
                  Reward Name:
                </label>
                <input
                  type="text"
                  value={formData.rewardName}
                  onChange={(e) => handleInputChange("rewardName", e.target.value)}
                  className="bg-white/10 border-[#f2c36b] border-[0.5px] h-[36px] rounded-[4px] w-[305px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter reward name"
                  required
                />
              </div>

              {/* Probability */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Probability (%):
                </label>
                <input
                  type="number"
                  value={formData.probability}
                  onChange={(e) => handleInputChange("probability", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter probability"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Quantity:
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b]"
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex justify-start">
                <label className="text-[18px] text-white">
                  Image
                </label>
              </div>
              
              <div className="border-[#d3d3d3] border-[0.5px] border-dashed h-[199px] rounded-[8px] flex items-center justify-center relative overflow-hidden">
                {formData.itemImage ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={formData.itemImage}
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
                <span className="text-[#f04a4a] text-[14px] font-bold">
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
                <span className="text-black text-[14px] font-bold">
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
