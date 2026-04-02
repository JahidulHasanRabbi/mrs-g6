"use client";

import { useState, useEffect } from "react";
import * as adminApi from "../../../api/adminApi";

export default function BannerForm({ banner, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    active_until: '',
    location: 1, // Default to Main Page
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBannerDetails = async () => {
      if (banner && banner.uuid) {
        try {
          // Fetch fresh banner details from API
          const bannerDetails = await adminApi.getBanner(banner.uuid);
          setFormData({
            name: bannerDetails.name || '',
            slug: bannerDetails.slug || '',
            active_until: bannerDetails.active_until ? formatDateTimeLocal(bannerDetails.active_until) : '',
            location: bannerDetails.location === 'Side Panel' ? 2 : 1, // Convert string to enum
          });
          setImagePreview(bannerDetails.image);
        } catch (error) {
          console.error('Error fetching banner details:', error);
          // Fallback to banner prop if API call fails
          setFormData({
            name: banner.name || '',
            slug: banner.slug || '',
            active_until: banner.active_until ? formatDateTimeLocal(banner.active_until) : '',
            location: banner.location === 'Side Panel' ? 2 : 1,
          });
          setImagePreview(banner.image);
        }
      }
    };

    fetchBannerDetails();
  }, [banner]);

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        active_until: new Date(formData.active_until).toISOString(),
        location: parseInt(formData.location), // Ensure it's an integer
      };

      // Only add image if user uploaded a new one
      if (imageFile) {
        payload.image = imageFile;
      } else if (!banner) {
        // Image is required for new banners
        throw new Error('Image is required for new banners');
      }
      // For PUT without new image: don't include image field, API will keep existing image

      console.log('Submitting banner with payload:', {
        ...payload,
        image: payload.image ? 'File object' : 'Not included'
      });

      if (banner) {
        // Update existing banner
        await adminApi.updateBanner(banner.uuid, payload);
      } else {
        // Create new banner
        await adminApi.createBanner(payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving banner:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      
      // Better error message handling
      let errorMessage = 'Failed to save banner';
      if (err.data && typeof err.data === 'object') {
        // Extract field-specific errors
        const errors = Object.entries(err.data).map(([field, msgs]) => {
          const msgArray = Array.isArray(msgs) ? msgs : [msgs];
          return `${field}: ${msgArray.join(', ')}`;
        });
        errorMessage = errors.join('; ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white font-['Times_New_Roman']">
          {banner ? 'Edit Banner' : 'Create New Banner'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Banner Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e9af41]"
            placeholder="Enter banner name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Link URL (Slug) *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e9af41]"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Location *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#e9af41] cursor-pointer"
          >
            <option value={1}>Main Page</option>
            <option value={2}>Side Panel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Active Until *
          </label>
          <input
            type="datetime-local"
            name="active_until"
            value={formData.active_until}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#e9af41] cursor-pointer"
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Banner Image *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#e9af41] file:text-black file:font-semibold hover:file:bg-[#d19a35]"
          />
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              <img
                src={imagePreview}
                alt="Banner preview"
                className="w-full max-w-md h-48 object-cover rounded"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#e9af41] text-black font-bold rounded hover:bg-[#d19a35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white/5 text-white font-bold rounded hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
