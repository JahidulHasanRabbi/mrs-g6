"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { SortIcon, Pagination } from "../../components/admin/members/DataTable";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

// ── Mock data ────────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to MRS VIP tiers endpoint.
// Based on Figma 59:920 — MRS VIP Level table columns:
// Tier Name, Lifetime Deposit, Monthly Deposit, Check in Token,
// Upgrade (Free Token), Birthday (Free Token), Unlock Limited Mart.
const MOCK_MRS_VIP_TIERS = [
  { id: 1, tierName: "Bronze",   lifetimeDeposit: 10000, monthlyDeposit: 200000000, checkInToken: 200000000, upgradeFreeToken: 1000, birthdayFreeToken: 2000, unlockLimitedMart: 2000 },
  { id: 2, tierName: "Silver",   lifetimeDeposit: 50000, monthlyDeposit: 200000000, checkInToken: 200000000, upgradeFreeToken: 1500, birthdayFreeToken: 2500, unlockLimitedMart: 2500 },
  { id: 3, tierName: "Gold",     lifetimeDeposit: 150000, monthlyDeposit: 200000000, checkInToken: 200000000, upgradeFreeToken: 2000, birthdayFreeToken: 3000, unlockLimitedMart: 3000 },
  { id: 4, tierName: "Platinum", lifetimeDeposit: 500000, monthlyDeposit: 200000000, checkInToken: 200000000, upgradeFreeToken: 3000, birthdayFreeToken: 5000, unlockLimitedMart: 5000 },
  { id: 5, tierName: "Diamond",  lifetimeDeposit: 1500000, monthlyDeposit: 200000000, checkInToken: 200000000, upgradeFreeToken: 5000, birthdayFreeToken: 10000, unlockLimitedMart: 10000 },
];

const TABLE_COLUMNS = [
  { key: "rowNum",             label: "No",                   minW: "min-w-[60px]" },
  { key: "tierName",           label: "Tier Name",            minW: "min-w-[120px]" },
  { key: "lifetimeDeposit",    label: "Lifetime Deposit",      minW: "min-w-[140px]" },
  { key: "monthlyDeposit",     label: "Monthly Deposit",       minW: "min-w-[160px]" },
  { key: "checkInToken",       label: "Check in Token",        minW: "min-w-[140px]" },
  { key: "upgradeFreeToken",   label: "Upgrade (Free Token)",   minW: "min-w-[160px]" },
  { key: "birthdayFreeToken",  label: "Birthday (Free Token)",  minW: "min-w-[160px]" },
  { key: "unlockLimitedMart",  label: "Unlock limited mart",    minW: "min-w-[160px]" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatRM(val) {
  if (val === 0) return "RM 0";
  // Figma uses Indian-style grouping (e.g., "RM 2,00,00,000"); we use
  // standard western grouping for clarity since en-MY is the project locale.
  return `RM ${val.toLocaleString("en-MY")}`;
}

function formatNum(val) {
  return val.toLocaleString("en-MY");
}

// ── Tier Form Modal (Create / Edit) ─────────────────────────────────────
// Matches Figma 59:1315 (Edit) and 59:1568 (Create)
function TierFormModal({ tier, onClose, onSave }) {
  const isEdit = !!tier;

  const [form, setForm] = useState({
    tierName:           tier?.tierName ?? "",
    lifetimeDeposit:    tier?.lifetimeDeposit ?? "",
    monthlyDeposit:     tier?.monthlyDeposit ?? "",
    checkInToken:       tier?.checkInToken ?? "",
    upgradeFreeToken:   tier?.upgradeFreeToken ?? "",
    birthdayFreeToken:  tier?.birthdayFreeToken ?? "",
    unlockLimitedMart:  tier?.unlockLimitedMart ?? "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "tierName" ? value : (value === "" ? "" : Number(value)),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
    onClose();
  };

  const fields = [
    { key: "tierName",           label: "Tier Name:",            type: "text" },
    { key: "lifetimeDeposit",    label: "Lifetime Deposit:",     type: "number" },
    { key: "monthlyDeposit",     label: "Monthly Deposit:",      type: "number" },
    { key: "checkInToken",       label: "Check in Token:",       type: "number" },
    { key: "upgradeFreeToken",   label: "Upgrade (Free Token):",  type: "number" },
    { key: "birthdayFreeToken",  label: "Birthday (Free Token):", type: "number" },
    { key: "unlockLimitedMart",  label: "Unlock Limited Mart:",   type: "number" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] rounded-[14px] border border-[rgba(255,255,255,0.5)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-admin"
        style={{
          backgroundColor: "#4d4d4d",
          boxShadow: "1px 4px 75px 9px rgba(174,174,174,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tier badge image */}
        <div className="flex justify-center mb-2">
          <Image
            src="/assets/admin/Tier.png"
            alt="Tier"
            width={70}
            height={70}
            priority
          />
        </div>

        {/* Title */}
        <h2 className="font-['Times_New_Roman'] font-bold text-[28px] text-white text-center capitalize mb-8">
          {isEdit ? "Edit Tier" : "Create Tier"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-[18px]">
              {/* Label */}
              <label className="w-[160px] shrink-0 font-['Times_New_Roman'] text-[16px] text-white">
                {f.label}
              </label>

              {/* Input */}
              <input
                type={f.type}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                required
                min={f.type === "number" ? 0 : undefined}
                step={f.type === "number" ? "0.01" : undefined}
                className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b]"
              />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-[21px] pt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-[37px] px-7 rounded border border-[#e5e6e6] bg-white font-['Times_New_Roman'] font-bold text-[14px] text-[#f04a4a] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[37px] px-7 rounded font-['Times_New_Roman'] font-bold text-[14px] text-black hover:opacity-90 transition-opacity"
              style={{ background: GOLD_BG }}
            >
              {isEdit ? "Confirm" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page content ─────────────────────────────────────────────────────────
function MrsVipContent() {
  const [tiers, setTiers] = useState(MOCK_MRS_VIP_TIERS);
  const [editingTier, setEditingTier] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedRows = useMemo(() => {
    const list = [...tiers];
    if (sortKey && sortKey !== "rowNum") {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [tiers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pageRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = useCallback((key) => {
    if (key === "rowNum") return;
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const handleSaveTier = useCallback((updatedData) => {
    // TODO (Backend): call API to update the tier, then reload.
    if (editingTier) {
      setTiers((prev) =>
        prev.map((t) => (t.id === editingTier.id ? { ...t, ...updatedData } : t)),
      );
    }
    setEditingTier(null);
  }, [editingTier]);

  const handleCreateTier = useCallback((newData) => {
    // TODO (Backend): call API to create tier, then reload.
    setTiers((prev) => {
      const newId = (prev.length ? Math.max(...prev.map((t) => t.id)) : 0) + 1;
      return [...prev, { id: newId, ...newData }];
    });
    setShowCreateForm(false);
  }, []);

  const handleArchive = useCallback((tier) => {
    // TODO (Backend): call archive API endpoint.
    setTiers((prev) => prev.filter((t) => t.id !== tier.id));
  }, []);

  return (
    <>
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Times_New_Roman'] font-bold text-[22px] sm:text-[28px] text-white">
          MRS VIP Level
        </h1>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e9af41"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      {/* Table card */}
      <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-4">
        {/* Title row + Create button */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="font-['Times_New_Roman'] font-bold text-[18px] sm:text-[20px] text-white capitalize">
            MRS VIP Level Is Given Below
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-[36px] rounded px-4 font-['Times_New_Roman'] text-[16px] text-black hover:opacity-90 transition-opacity"
            style={{ background: GOLD_BG }}
          >
            Create new tier <span className="font-bold">+</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-admin rounded-lg">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-black rounded-t-[6px]">
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.minW || ""} px-3 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors`}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      <span className="font-['Times_New_Roman'] font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                        {col.label}
                      </span>
                      {col.key !== "rowNum" && (
                        <SortIcon active={sortKey === col.key} direction={sortDir} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="min-w-[180px] px-3 py-3 text-center">
                  <span className="font-['Times_New_Roman'] font-bold text-[14px] sm:text-[16px] text-white">
                    Action
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length + 1}
                    className="px-5 py-12 text-center font-['Times_New_Roman'] text-white/40"
                  >
                    No MRS VIP tiers found.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Row number */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white whitespace-nowrap">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    {/* Tier Name */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {row.tierName}
                    </td>
                    {/* Lifetime Deposit */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatRM(row.lifetimeDeposit)}
                    </td>
                    {/* Monthly Deposit */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatRM(row.monthlyDeposit)}
                    </td>
                    {/* Check in Token */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatNum(row.checkInToken)}
                    </td>
                    {/* Upgrade (Free Token) */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatNum(row.upgradeFreeToken)}
                    </td>
                    {/* Birthday (Free Token) */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatNum(row.birthdayFreeToken)}
                    </td>
                    {/* Unlock Limited Mart */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatNum(row.unlockLimitedMart)}
                    </td>
                    {/* Action */}
                    <td className="px-3 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleArchive(row)}
                          className="h-[31px] rounded px-3 bg-[#06b800] font-['Times_New_Roman'] font-bold text-[14px] text-white hover:bg-[#05a000] transition-colors"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => setEditingTier(row)}
                          className="h-[31px] w-[70px] rounded border border-[#00a63e] font-['Times_New_Roman'] text-[14px] text-[#00a63e] hover:bg-[#00a63e]/10 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </main>

    {/* Edit Modal */}
    {editingTier && (
      <TierFormModal
        tier={editingTier}
        onClose={() => setEditingTier(null)}
        onSave={handleSaveTier}
      />
    )}

    {/* Create Modal */}
    {showCreateForm && (
      <TierFormModal
        tier={null}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateTier}
      />
    )}
    </>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function MrsVipPage() {
  return (
    <AdminRouteGuard>
      <MrsVipContent />
    </AdminRouteGuard>
  );
}
