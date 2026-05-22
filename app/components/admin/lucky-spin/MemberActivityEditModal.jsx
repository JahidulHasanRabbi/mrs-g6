"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function MemberActivityEditModal({
  isOpen,
  onClose,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    userTier: "",
    maxSpinsPerDay: "",
    bonusSpin: "",
    resetTime: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      userTier: initialData?.userTier ?? "",
      maxSpinsPerDay: initialData?.maxSpinsPerDay ?? "",
      bonusSpin: initialData?.bonusSpin ?? "",
      resetTime: initialData?.resetTime ?? "",
    });
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 w-full max-w-[465px]">
        <div className="bg-[#4d4d4d] border border-white/50 rounded-[14px] shadow-[1px_4px_75px_9px_rgba(174,174,174,0.15)] p-8">
          <div className="flex justify-center mb-4">
            <div className="relative h-[60px] w-[60px]">
              <Image
                src="/assets/admin/lucky-spin/member-activity-modal-icon.svg"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h2 className="text-center text-[28px] font-bold text-white capitalize mb-16">
            Edit Spin Items
          </h2>

          <form onSubmit={handleSubmit} className="space-y-16">
            <div className="space-y-3">
              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[135px]">
                  User Tier :
                </label>
                <input
                  type="text"
                  value={formData.userTier}
                  onChange={(e) => setFormData((p) => ({ ...p, userTier: e.target.value }))}
                  className="bg-white/10 border-[#f2c36b] border-[0.5px] h-[36px] rounded-[4px] w-[305px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b] text-[14px]"
                />
              </div>

              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Max Spins/Day:
                </label>
                <input
                  type="text"
                  value={formData.maxSpinsPerDay}
                  onChange={(e) => setFormData((p) => ({ ...p, maxSpinsPerDay: e.target.value }))}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b] text-[14px]"
                />
              </div>

              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Bonus Spin :
                </label>
                <input
                  type="text"
                  value={formData.bonusSpin}
                  onChange={(e) => setFormData((p) => ({ ...p, bonusSpin: e.target.value }))}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b] text-[14px]"
                />
              </div>

              <div className="flex items-center gap-[18px]">
                <label className="text-[18px] text-white w-[136px]">
                  Reset Time :
                </label>
                <input
                  type="text"
                  value={formData.resetTime}
                  onChange={(e) => setFormData((p) => ({ ...p, resetTime: e.target.value }))}
                  className="bg-white/10 border-[0.5px] border-white/8 h-[36px] rounded-[4px] w-[304px] px-3 text-white placeholder-white/50 focus:outline-none focus:border-[#f2c36b] text-[14px]"
                />
              </div>
            </div>

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
                  backgroundImage:
                    "linear-gradient(1.2852950753927956deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)",
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
