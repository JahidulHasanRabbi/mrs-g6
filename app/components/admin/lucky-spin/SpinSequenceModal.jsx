"use client";

import { useState, useEffect } from "react";
import ErrorDisplay from "../../ui/ErrorDisplay";

export default function SpinSequenceModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "add",
  initialData = null,
  spinItems = [],
  existingOrders = [],
  isLoading = false,
  error = null
}) {
  const [formData, setFormData] = useState({
    item_order: "",
    item_uuid: ""
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        item_order: initialData.item_order,
        item_uuid: initialData.item_uuid
      });
    } else {
      // For add mode, suggest next available order
      const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;
      setFormData({
        item_order: maxOrder + 1,
        item_uuid: ""
      });
    }
  }, [mode, initialData, existingOrders]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.item_uuid) {
      alert("Please select a spin item.");
      return;
    }
    
    if (!formData.item_order || formData.item_order < 1) {
      alert("Please enter a valid item order (must be 1 or greater).");
      return;
    }

    // Check for duplicate order (only in add mode or if order changed in edit mode)
    if (mode === "add" || (mode === "edit" && formData.item_order !== initialData?.item_order)) {
      if (existingOrders.includes(parseInt(formData.item_order))) {
        alert(`Item order ${formData.item_order} is already in use. Please choose a different order.`);
        return;
      }
    }

    await onSubmit({
      item_order: parseInt(formData.item_order),
      item_uuid: formData.item_uuid
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            {mode === "add" ? "Add Spin Sequence" : "Edit Spin Sequence"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white/60 hover:text-white disabled:opacity-50"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Item Order */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-white">
              Item Order <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.item_order}
              onChange={(e) => handleChange("item_order", e.target.value)}
              className="w-full bg-white/10 border border-white/20 h-[40px] rounded-[4px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-white/40">
              The position order of this item in the spin sequence
            </p>
          </div>

          {/* Spin Item */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-white">
              Spin Item <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.item_uuid}
              onChange={(e) => handleChange("item_uuid", e.target.value)}
              className="w-full bg-white/10 border border-white/20 h-[40px] rounded-[4px] px-3 text-white focus:outline-none focus:border-[#f2c36b] [&>option]:bg-[#1a1a1a] [&>option]:text-white"
              disabled={isLoading}
              required
            >
              <option value="" className="bg-[#1a1a1a] text-white">-- Select Spin Item --</option>
              {spinItems.map(item => (
                <option key={item.uuid} value={item.uuid} className="bg-[#1a1a1a] text-white">
                  {item.reward_name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 disabled:opacity-50 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-w-[100px] items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-bold leading-none text-black transition-colors disabled:opacity-50"
              style={{
                backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
              }}
            >
              {isLoading ? "Saving..." : mode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
