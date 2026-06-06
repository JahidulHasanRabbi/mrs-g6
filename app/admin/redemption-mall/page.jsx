"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import RedemptionMallTable from "../../components/admin/redemption-mall/RedemptionMallTable";
import RedemptionItemDialog from "../../components/admin/redemption-mall/RedemptionItemDialog";
import { LoadingState } from "../../components/ui/LoadingState";
import Skeleton from "../../components/admin/ui/Skeleton";
import * as adminApi from "../../api/adminApi";

const SKELETON_COLUMNS = [
  { label: "Name",       type: "text" },
  { label: "Quantity",   type: "number" },
  { label: "Start Date", type: "datetime" },
  { label: "End Date",   type: "datetime" },
  { label: "Prize Type", type: "badge" },
  { label: "Mart Tier",  type: "badge" },
  { label: "Tokens",     type: "number" },
  { label: "Promotion",  type: "number" },
  { label: "Image",      type: "image" },
  { label: "Action",     type: "actions", count: 2 },
];

const FULL_SKELETON = (
  <Skeleton.TablePage
    columns={SKELETON_COLUMNS}
    rows={5}
    withFilters={false}
    titleWidth={360}
  />
);

const BARE_SKELETON = (
  <Skeleton.TablePage
    columns={SKELETON_COLUMNS}
    rows={5}
    withHeader={false}
    withFilters={false}
    bare
  />
);

export default function RedemptionMallPage() {
  return (
    <AdminRouteGuard skeleton={FULL_SKELETON}>
      <RedemptionMallContent />
    </AdminRouteGuard>
  );
}

function RedemptionMallContent() {
  const [items, setItems] = useState([]);
  const [martTiers, setMartTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, mode: "create", item: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const itemsData = await adminApi.getRedemptionItems();
      setItems(Array.isArray(itemsData) ? itemsData : (itemsData?.results || []));
      
      // Load mart tiers for dropdown
      try {
        const tiersData = await adminApi.getRedemptionTiers();
        setMartTiers(Array.isArray(tiersData) ? tiersData : (tiersData?.results || []));
      } catch (err) {
        console.warn('Mart tiers not available:', err);
        setMartTiers([]);
      }
    } catch (err) {
      console.error('Failed to load redemption items:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      // Set empty array so page still renders
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => setDialog({ open: true, mode: "create", item: null });
  const openEdit = (item) => setDialog({ open: true, mode: "edit", item });
  const close = () => setDialog({ open: false, mode: "create", item: null });

  const handleSubmit = async (formData) => {
    try {
      if (dialog.mode === "create") {
        await adminApi.createRedemptionItem(formData);
      } else {
        await adminApi.updateRedemptionItem(dialog.item.uuid, formData);
      }
      await loadData(); // Reload data after successful operation
      close();
    } catch (err) {
      console.error('Failed to save redemption item:', err);
      console.error('Error details:', {
        message: err?.message,
        status: err?.status,
        data: err?.data,
        type: typeof err,
        keys: Object.keys(err || {})
      });
      throw err; // Let the dialog handle the error display
    }
  };

  const handleArchive = async (item) => {
    if (!confirm(`Are you sure you want to archive "${item.name}"?`)) {
      return;
    }
    try {
      await adminApi.archiveRedemptionItem(item.uuid);
      await loadData();
    } catch (err) {
      console.error('Failed to archive item:', err);
      alert('Failed to archive item. Please try again.');
    }
  };

  return (
    <main className="min-h-screen px-6 pt-6 pb-10 xl:admin-content-pl xl:pr-10 xl:pt-10">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold leading-[1.05] text-white">
          Redemption Management
        </h1>
        <button className="flex h-[26px] w-[26px] items-center justify-center text-[#e9af41]" aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7v3.586l-1.707 1.707A1 1 0 0 0 4 16h16a1 1 0 0 0 .707-1.707L19 12.586V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
          </svg>
        </button>
      </div>

      <LoadingState isLoading={isLoading} skeleton={BARE_SKELETON}>
        <RedemptionMallTable items={items} onCreate={openCreate} onEdit={openEdit} onArchive={handleArchive} />
      </LoadingState>

      <RedemptionItemDialog
        open={dialog.open}
        mode={dialog.mode}
        initial={dialog.item}
        martTiers={martTiers}
        onClose={close}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
