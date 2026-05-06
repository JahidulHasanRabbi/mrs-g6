"use client";

import { useState, useMemo, useCallback } from "react";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import Sidebar from "../../components/admin/Sidebar";
import { SortIcon, Pagination } from "../../components/admin/members/DataTable";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

// ── Mock data ────────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to wallet site VIP tiers endpoint.
// Wallet Site VIP tiers (per-brand) — data from client requirements Item 11 & 12.
// Fields: Tier Name, Lifetime Deposit, Monthly Deposit, Upgrade Bonus, Monthly Loyalty, Birthday Bonus, Station
const MOCK_WALLET_VIP_TIERS = [
  { id: 1, tierName: "WARRIOR",        lifetimeDeposit: 0,      monthlyDeposit: 0,   upgradeBonus: 0,    monthlyLoyalty: 0,    birthdayBonus: 0,    station: "VIP 0" },
  { id: 2, tierName: "BRONZE ELITE",   lifetimeDeposit: 500,    monthlyDeposit: 300, upgradeBonus: 88,   monthlyLoyalty: 38,   birthdayBonus: 68,   station: "VIP 1" },
  { id: 3, tierName: "MASTER",         lifetimeDeposit: 2500,   monthlyDeposit: 300, upgradeBonus: 188,  monthlyLoyalty: 68,   birthdayBonus: 118,  station: "VIP 2" },
  { id: 4, tierName: "GRAND MASTER",   lifetimeDeposit: 10000,  monthlyDeposit: 300, upgradeBonus: 388,  monthlyLoyalty: 188,  birthdayBonus: 228,  station: "VIP 3" },
  { id: 5, tierName: "EPIC",           lifetimeDeposit: 35000,  monthlyDeposit: 300, upgradeBonus: 688,  monthlyLoyalty: 288,  birthdayBonus: 328,  station: "VIP 4" },
  { id: 6, tierName: "LEGEND",         lifetimeDeposit: 75000,  monthlyDeposit: 300, upgradeBonus: 888,  monthlyLoyalty: 388,  birthdayBonus: 668,  station: "VIP 5" },
  { id: 7, tierName: "MYTHIC",         lifetimeDeposit: 150000, monthlyDeposit: 300, upgradeBonus: 1288, monthlyLoyalty: 588,  birthdayBonus: 888,  station: "VIP 6" },
  { id: 8, tierName: "MYTHIC GLORY",   lifetimeDeposit: 300000, monthlyDeposit: 300, upgradeBonus: 1888, monthlyLoyalty: 1288, birthdayBonus: 1188, station: "VIP 7" },
  { id: 9, tierName: "MYTHIC PRIME",   lifetimeDeposit: 700000, monthlyDeposit: 300, upgradeBonus: 3888, monthlyLoyalty: 1888, birthdayBonus: 1688, station: "VIP 8" },
];

const TABLE_COLUMNS = [
  { key: "rowNum",          label: "No",               minW: "min-w-[60px]" },
  { key: "tierName",        label: "Tier Name",        minW: "min-w-[140px]" },
  { key: "lifetimeDeposit", label: "Lifetime Deposit",  minW: "min-w-[130px]" },
  { key: "monthlyDeposit",  label: "Monthly Deposit",   minW: "min-w-[130px]" },
  { key: "upgradeBonus",    label: "Upgrade Bonus",     minW: "min-w-[120px]" },
  { key: "monthlyLoyalty",  label: "Monthly Loyalty",    minW: "min-w-[120px]" },
  { key: "birthdayBonus",   label: "Birthday Bonus",     minW: "min-w-[120px]" },
  { key: "station",         label: "Station",            minW: "min-w-[100px]" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatRM(val) {
  if (val === 0) return "RM 0";
  return `RM ${val.toLocaleString("en-MY")}`;
}

// ── Station options for dropdown ─────────────────────────────────────────
const STATION_OPTIONS = [
  "VIP 0", "VIP 1", "VIP 2", "VIP 3", "VIP 4",
  "VIP 5", "VIP 6", "VIP 7", "VIP 8",
];

// ── Tier Form Modal (Create / Edit) ─────────────────────────────────────
// Matches Figma 24:1561 (Create) and 24:1293 (Edit)
function TierFormModal({ tier, onClose, onSave }) {
  const isEdit = !!tier;

  const [form, setForm] = useState({
    tierName: tier?.tierName || "",
    lifetimeDeposit: tier?.lifetimeDeposit ?? "",
    monthlyDeposit: tier?.monthlyDeposit ?? "",
    upgradeBonus: tier?.upgradeBonus ?? "",
    monthlyLoyalty: tier?.monthlyLoyalty ?? "",
    birthdayBonus: tier?.birthdayBonus ?? "",
    station: tier?.station || "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "tierName" || key === "station" ? value : (value === "" ? "" : Number(value)),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
    onClose();
  };

  const fields = [
    { key: "tierName",        label: "Tier Name",        type: "text" },
    { key: "lifetimeDeposit", label: "Lifetime Deposit",  type: "number" },
    { key: "monthlyDeposit",  label: "Monthly Deposit",   type: "number" },
    { key: "upgradeBonus",    label: "Upgrade Bonus",     type: "number" },
    { key: "monthlyLoyalty",  label: "Monthly Loyalty",    type: "number" },
    { key: "birthdayBonus",   label: "Birthday Bonus",     type: "number" },
    { key: "station",         label: "Station",            type: "select" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-[14px] border border-[rgba(255,255,255,0.5)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-admin"
        style={{
          backgroundColor: "#4d4d4d",
          boxShadow: "1px 4px 75px 9px rgba(174,174,174,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold badge */}
        <div className="flex justify-center -mt-2 mb-2">
          <div
            className="h-[98px] w-[98px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #ffff84 0%, #dd8f1f 100%)",
              boxShadow: "0 4px 24px rgba(231,196,87,0.35)",
            }}
          >
            {/* Crown / star icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#4d4d4d"
                stroke="#4d4d4d"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-['Times_New_Roman'] font-bold text-[28px] text-white text-center capitalize mb-6">
          {isEdit ? "Edit Tier" : "Create Tier"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-[18px]">
              {/* Label */}
              <label className="w-[136px] shrink-0 font-['Times_New_Roman'] text-[18px] text-white">
                {f.label}
              </label>

              {/* Input */}
              {f.type === "select" ? (
                <div className="relative flex-1">
                  <select
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    required
                    className="h-[36px] w-full rounded-[4px] px-3 pr-8 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.08)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#4d4d4d] text-white">
                      Select station
                    </option>
                    {STATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#4d4d4d] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown caret */}
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              ) : (
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  required
                  min={f.type === "number" ? 0 : undefined}
                  step={f.type === "number" ? "0.01" : undefined}
                  className={`h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b] ${
                    f.key === "tierName"
                      ? "border-[#f2c36b]"
                      : "border-[rgba(255,255,255,0.08)]"
                  }`}
                />
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-[21px] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-[37px] px-6 rounded border border-[#e5e6e6] bg-white font-['Times_New_Roman'] font-bold text-[14px] text-[#f04a4a] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[37px] px-6 rounded font-['Times_New_Roman'] font-bold text-[14px] text-black hover:opacity-90 transition-opacity"
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
function WalletSiteVipContent() {
  const [tiers, setTiers] = useState(MOCK_WALLET_VIP_TIERS);
  const [editingTier, setEditingTier] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Table state
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
    // TODO (Backend): call API to update/create the tier, then reload
    if (editingTier) {
      setTiers((prev) =>
        prev.map((t) => (t.id === editingTier.id ? { ...t, ...updatedData } : t)),
      );
    }
    setEditingTier(null);
  }, [editingTier]);

  const handleCreateTier = useCallback((newData) => {
    // TODO (Backend): call API to create tier, then reload
    const newId = Math.max(...tiers.map((t) => t.id)) + 1;
    setTiers((prev) => [...prev, { id: newId, ...newData }]);
    setShowCreateForm(false);
  }, [tiers]);

  const handleArchive = useCallback((tier) => {
    // TODO (Backend): call archive API endpoint
    setTiers((prev) => prev.filter((t) => t.id !== tier.id));
  }, []);

  return (
    <div className="min-h-screen bg-[#07190d]">
      {/* Sidebar */}
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px] hidden xl:block">
        <Sidebar activeItem="wallet-site-vip" />
      </aside>

      {/* Main content */}
      <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Times_New_Roman'] font-bold text-[22px] sm:text-[28px] text-white">
            Wallet Side VIP
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
              Wallet Site VIP Is Given Below
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
            <table className="w-full min-w-[1100px]">
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
                  <th className="min-w-[166px] px-3 py-3 text-left">
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
                      No VIP tiers found.
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
                      <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap font-bold">
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
                      {/* Upgrade Bonus */}
                      <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                        {row.upgradeBonus.toLocaleString("en-MY")}
                      </td>
                      {/* Monthly Loyalty */}
                      <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                        {row.monthlyLoyalty.toLocaleString("en-MY")}
                      </td>
                      {/* Birthday Bonus */}
                      <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                        {row.birthdayBonus.toLocaleString("en-MY")}
                      </td>
                      {/* Station */}
                      <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                        {row.station}
                      </td>
                      {/* Action */}
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
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
    </div>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function WalletSiteVipPage() {
  return (
    <AdminRouteGuard>
      <WalletSiteVipContent />
    </AdminRouteGuard>
  );
}
