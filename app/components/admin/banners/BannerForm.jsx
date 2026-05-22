"use client";

import { useState, useEffect } from "react";
import * as adminApi from "../../../api/adminApi";
import Button from "../ui/Button";
import FormField, { BASE_INPUT, stateClasses } from "../ui/FormField";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    if (name === "name" && !value?.trim()) return "Banner name is required";
    if (name === "slug") {
      if (!value?.trim()) return "Link URL is required";
      const url = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
      try { new URL(url); } catch { return "Enter a valid URL"; }
    }
    if (name === "active_until") {
      if (!value) return "Active-until date is required";
      if (new Date(value) <= new Date()) return "Active-until must be in the future";
    }
    return null;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
  };

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
    if (touched[name]) {
      setFieldErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
    }
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

    // Pre-submit: mark all fields touched and surface validation errors.
    const errs = {
      name: validateField("name", formData.name),
      slug: validateField("slug", formData.slug),
      active_until: validateField("active_until", formData.active_until),
    };
    setFieldErrors(errs);
    setTouched({ name: true, slug: true, active_until: true });
    if (Object.values(errs).some(Boolean)) return;

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

      if (banner) {
        // Update existing banner
        await adminApi.updateBanner(banner.uuid, payload);
        onSuccess("update");
      } else {
        // Create new banner
        await adminApi.createBanner(payload);
        onSuccess("create");
      }
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
        <h2 className="text-2xl font-bold text-white">
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Banner Name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={touched.name ? fieldErrors.name : undefined}
          placeholder="Enter banner name"
        />

        <FormField
          label="Link URL (Slug)"
          name="slug"
          required
          value={formData.slug}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={touched.slug ? fieldErrors.slug : undefined}
          placeholder="https://example.com"
        />

        <FormField.Group label="Location" required>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className={`${BASE_INPUT} ${stateClasses(null)} cursor-pointer`}
          >
            <option value={1}>Main Page</option>
            <option value={2}>Side Panel</option>
          </select>
        </FormField.Group>

        <FormField.Group label="Active Until" required error={touched.active_until ? fieldErrors.active_until : undefined}>
          <input
            type="datetime-local"
            name="active_until"
            value={formData.active_until}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
            className={`${BASE_INPUT} ${stateClasses(touched.active_until && fieldErrors.active_until)} cursor-pointer`}
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </FormField.Group>

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

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
            {banner ? 'Update Banner' : 'Create Banner'}
          </Button>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
