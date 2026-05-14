"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import LoadingState from "../../components/ui/LoadingState";
import ErrorDisplay from "../../components/ui/ErrorDisplay";
import BannersTable from "../../components/admin/banners/BannersTable";
import BannerForm from "../../components/admin/banners/BannerForm";
import * as adminApi from "../../api/adminApi";

export default function BannersPage() {
  return (
    <AdminRouteGuard>
      <BannersPageContent />
    </AdminRouteGuard>
  );
}

function BannersPageContent() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getBanners();
      setBanners(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBanner(null);
    fetchBanners();
  };

  const handleArchive = async (uuid) => {
    if (!confirm('Are you sure you want to archive this banner?')) {
      return;
    }

    try {
      await adminApi.archiveBanner(uuid);
      fetchBanners();
    } catch (err) {
      console.error('Error archiving banner:', err);
      alert('Failed to archive banner');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        <LoadingState message="Loading banners..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Banners Management
          </h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-[#e9af41] text-black font-bold rounded hover:bg-[#d19a35] transition-colors"
          >
            + Create Banner
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {showForm ? (
          <BannerForm
            banner={editingBanner}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        ) : (
          <BannersTable
            banners={banners}
            onEdit={handleEdit}
            onArchive={handleArchive}
          />
      )}
    </main>
  );
}
