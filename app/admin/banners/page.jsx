"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import LoadingState from "../../components/ui/LoadingState";
import ErrorDisplay from "../../components/ui/ErrorDisplay";
import BannersTable from "../../components/admin/banners/BannersTable";
import BannerForm from "../../components/admin/banners/BannerForm";
import Button from "../../components/admin/ui/Button";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../components/admin/ui/Toast";
import * as adminApi from "../../api/adminApi";

export default function BannersPage() {
  return (
    <AdminRouteGuard>
      <BannersPageContent />
    </AdminRouteGuard>
  );
}

function BannersPageContent() {
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null); // banner pending archive
  const [archiving, setArchiving] = useState(false);

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

  const handleFormSuccess = (mode) => {
    setShowForm(false);
    setEditingBanner(null);
    toast.success(mode === "update" ? "Banner updated" : "Banner created");
    fetchBanners();
  };

  const handleArchive = (banner) => {
    setArchiveTarget(banner);
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await adminApi.archiveBanner(archiveTarget.uuid);
      toast.success(`"${archiveTarget.name}" archived`);
      setArchiveTarget(null);
      fetchBanners();
    } catch (err) {
      console.error('Error archiving banner:', err);
      toast.error("Failed to archive banner", { description: err?.message });
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10">
        <LoadingState message="Loading banners..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10">
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Banners Management
          </h1>
          <Button onClick={handleCreate} variant="primary" size="md">
            + Create Banner
          </Button>
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

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive banner?"
        message={
          archiveTarget
            ? `"${archiveTarget.name}" will be archived and stop showing to members. You can restore it later if needed.`
            : ""
        }
        confirmLabel="Archive"
        tone="destructive"
        loading={archiving}
        preview={
          archiveTarget?.image && (
            <img
              src={archiveTarget.image}
              alt=""
              className="w-full h-32 object-cover rounded border border-white/10"
            />
          )
        }
        onConfirm={confirmArchive}
        onCancel={() => !archiving && setArchiveTarget(null)}
      />
    </main>
  );
}
