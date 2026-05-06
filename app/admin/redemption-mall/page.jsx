"use client";

import { useState } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import RedemptionMallTable from "../../components/admin/redemption-mall/RedemptionMallTable";
import RedemptionItemDialog from "../../components/admin/redemption-mall/RedemptionItemDialog";

const INITIAL_ITEMS = [
  { id: 1, name: "John",    quantity: "Bronze", startDate: "2nd June",  endDate: "3rd June",  prizeType: "2,00,000,000", mart: "VIP",     tokens: "2,000", promotion: "2,000", image: "/assets/admin/Tier.png", status: "Archive" },
  { id: 2, name: "Alice",   quantity: "Silver", startDate: "5th June",  endDate: "6th June",  prizeType: "1,50,000,000", mart: "Premium", tokens: "1,500", promotion: "1,500", image: "/assets/admin/Tier.png", status: "Active"  },
  { id: 3, name: "John",    quantity: "Bronze", startDate: "2nd June",  endDate: "3rd June",  prizeType: "2,00,000,000", mart: "VIP",     tokens: "2,000", promotion: "2,000", image: "/assets/admin/Tier.png", status: "Archive" },
  { id: 4, name: "Michael", quantity: "Gold",   startDate: "10th June", endDate: "11th June", prizeType: "3,00,000,000", mart: "Elite",   tokens: "3,000", promotion: "3,000", image: "/assets/admin/Tier.png", status: "Pending" },
  { id: 5, name: "John",    quantity: "Bronze", startDate: "2nd June",  endDate: "3rd June",  prizeType: "2,00,000,000", mart: "VIP",     tokens: "2,000", promotion: "2,000", image: "/assets/admin/Tier.png", status: "Archive" },
];

export default function RedemptionMallPage() {
  return (
    <AdminRouteGuard>
      <RedemptionMallContent />
    </AdminRouteGuard>
  );
}

function RedemptionMallContent() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [dialog, setDialog] = useState({ open: false, mode: "create", item: null });

  const openCreate = () => setDialog({ open: true, mode: "create", item: null });
  const openEdit = (item) => setDialog({ open: true, mode: "edit", item });
  const close = () => setDialog({ open: false, mode: "create", item: null });

  const handleSubmit = (form) => {
    if (dialog.mode === "create") {
      setItems((prev) => [
        ...prev,
        { id: Date.now(), status: "Pending", image: "/assets/admin/Tier.png", ...form },
      ]);
    } else {
      setItems((prev) => prev.map((it) => (it.id === dialog.item.id ? { ...it, ...form } : it)));
    }
    close();
  };

  return (
    <main className="min-h-screen px-6 pt-6 pb-10 xl:pl-[388px] xl:pr-10 xl:pt-10">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-['Times_New_Roman'] text-[18px] font-bold tracking-[-0.396px] text-white/70">
          Redemption Management
        </h1>
        <button className="flex h-[26px] w-[26px] items-center justify-center text-[#e9af41]" aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7v3.586l-1.707 1.707A1 1 0 0 0 4 16h16a1 1 0 0 0 .707-1.707L19 12.586V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
          </svg>
        </button>
      </div>

      <RedemptionMallTable items={items} onCreate={openCreate} onEdit={openEdit} />

      <RedemptionItemDialog
        open={dialog.open}
        mode={dialog.mode}
        initial={dialog.item}
        onClose={close}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
