"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import RedemptionMallTable from "../../components/admin/redemption-mall/RedemptionMallTable";
import RedemptionItemDialog from "../../components/admin/redemption-mall/RedemptionItemDialog";
import { LoadingState } from "../../components/ui/LoadingState";
import * as adminApi from "../../api/adminApi";

export default function RedemptionMallPage() {
  return (
    <AdminRouteGuard>
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
      // Load redemption items
      console.log('Loading redemption items...');
      const itemsData = await adminApi.getRedemptionItems();
      console.log('Redemption items response:', itemsData);
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
    console.log('Page handleSubmit called with:', formData);
    console.log('Dialog mode:', dialog.mode);
    console.log('Dialog item:', dialog.item);
    
    try {
      if (dialog.mode === "create") {
        console.log('Calling createRedemptionItem...');
        const result = await adminApi.createRedemptionItem(formData);
        console.log('Create result:', result);
      } else {
        console.log('Calling updateRedemptionItem with uuid:', dialog.item.uuid);
        const result = await adminApi.updateRedemptionItem(dialog.item.uuid, formData);
        console.log('Update result:', result);
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
    <main className="min-h-screen px-6 pt-6 pb-10 xl:pl-[388px] xl:pr-10 xl:pt-10">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className=" text-[18px] font-bold tracking-[-0.396px] text-white/70">
          Redemption Management
        </h1>
        <button className="flex h-[26px] w-[26px] items-center justify-center text-[#e9af41]" aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7v3.586l-1.707 1.707A1 1 0 0 0 4 16h16a1 1 0 0 0 .707-1.707L19 12.586V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
          </svg>
        </button>
      </div>

      <LoadingState isLoading={isLoading}>
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
