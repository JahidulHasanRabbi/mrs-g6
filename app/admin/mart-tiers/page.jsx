"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import MartTierTable from "../../components/admin/mart-tiers/MartTierTable";
import MartTierDialog from "../../components/admin/mart-tiers/MartTierDialog";
import { LoadingState } from "../../components/ui/LoadingState";
import Skeleton from "../../components/admin/ui/Skeleton";
import * as adminApi from "../../api/adminApi";

const SKELETON_COLUMNS = [
  { label: "Tier Name", type: "text" },
  { label: "Level",     type: "number" },
  { label: "Action",    type: "actions", count: 2 },
];

const FULL_SKELETON = (
  <Skeleton.TablePage columns={SKELETON_COLUMNS} rows={5} withFilters={false} titleWidth={280} />
);
const BARE_SKELETON = (
  <Skeleton.TablePage columns={SKELETON_COLUMNS} rows={5} withHeader={false} withFilters={false} bare />
);

export default function MartTiersPage() {
  return (
    <AdminRouteGuard skeleton={FULL_SKELETON}>
      <MartTiersContent />
    </AdminRouteGuard>
  );
}

function MartTiersContent() {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, mode: "create", tier: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading mart tiers...');
      const tiersData = await adminApi.getRedemptionTiers();
      console.log('Mart tiers response:', tiersData);
      setTiers(Array.isArray(tiersData) ? tiersData : (tiersData?.results || []));
    } catch (err) {
      console.error('Failed to load mart tiers:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      setTiers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => setDialog({ open: true, mode: "create", tier: null });
  const openEdit = (tier) => setDialog({ open: true, mode: "edit", tier });
  const close = () => setDialog({ open: false, mode: "create", tier: null });

  const handleSubmit = async (formData) => {
    try {
      if (dialog.mode === "create") {
        await adminApi.createRedemptionTier(formData);
      } else {
        await adminApi.updateRedemptionTier(dialog.tier.uuid, formData);
      }
      await loadData();
      close();
    } catch (err) {
      console.error('Failed to save mart tier:', err);
      throw err;
    }
  };

  const handleArchive = async (tier) => {
    if (!confirm(`Are you sure you want to archive "${tier.name}"?`)) {
      return;
    }
    try {
      await adminApi.archiveRedemptionTier(tier.uuid);
      await loadData();
    } catch (err) {
      console.error('Failed to archive tier:', err);
      alert('Failed to archive tier. Please try again.');
    }
  };

  return (
    <main className="min-h-screen px-6 pt-6 pb-10 xl:admin-content-pl xl:pr-10 xl:pt-10">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold leading-[1.05] text-white">
          Mart Tier Management
        </h1>
        <button className="flex h-[26px] w-[26px] items-center justify-center text-[#e9af41]" aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7v3.586l-1.707 1.707A1 1 0 0 0 4 16h16a1 1 0 0 0 .707-1.707L19 12.586V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
          </svg>
        </button>
      </div>

      <LoadingState isLoading={isLoading} skeleton={BARE_SKELETON}>
        <MartTierTable tiers={tiers} onCreate={openCreate} onEdit={openEdit} onArchive={handleArchive} />
      </LoadingState>

      <MartTierDialog
        open={dialog.open}
        mode={dialog.mode}
        initial={dialog.tier}
        onClose={close}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
