"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import RedemptionMallTable from "../../components/admin/redemption-mall/RedemptionMallTable";
import RedemptionItemDialog from "../../components/admin/redemption-mall/RedemptionItemDialog";
import RedemptionStatusModal from "../../components/admin/redemption-mall/RedemptionStatusModal";
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
  { label: "KR Coins",     type: "number" },
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
function StatusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

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
  const [gameStatus, setGameStatus] = useState(1);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
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

      try {
        const settings = await adminApi.getRedemptionSettings();
        setGameStatus(Number(settings?.game_status ?? 1));
      } catch (err) {
        console.warn("Redemption settings not available:", err);
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

  const handleStatusSave = async (isOpen) => {
    const nextStatus = isOpen ? 1 : 2;
    setIsSavingStatus(true);
    try {
      const settings = await adminApi.updateRedemptionSettings({ game_status: nextStatus });
      setGameStatus(Number(settings?.game_status ?? nextStatus));
      setStatusOpen(false);
    } catch (err) {
      console.error("Failed to update redemption status:", err);
      alert("Failed to update Mart status. Please try again.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <main className="min-h-screen px-6 pt-6 pb-10 xl:admin-content-pl xl:pr-10 xl:pt-10">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold leading-[1.05] text-white">
          Redemption Management
        </h1>
        <button
          type="button"
          onClick={() => setStatusOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5"
          title={`Member Mart is ${gameStatus === 1 ? "open" : "closed"}`}
        >
          <StatusIcon />
          Game Status
          <span
            className={`ml-1 h-2 w-2 rounded-full ${
              gameStatus === 1 ? "bg-[#54e98a]" : "bg-[#ff7676]"
            }`}
          />
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

      <RedemptionStatusModal
        open={statusOpen}
        initialOpen={gameStatus === 1}
        saving={isSavingStatus}
        onClose={() => setStatusOpen(false)}
        onSave={handleStatusSave}
      />
    </main>
  );
}
