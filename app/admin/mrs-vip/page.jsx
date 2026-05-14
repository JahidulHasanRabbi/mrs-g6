"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { SortIcon, Pagination } from "../../components/admin/members/DataTable";
import { LoadingState } from "../../components/ui/LoadingState";
import * as adminApi from "../../api/adminApi";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

const TABLE_COLUMNS = [
  { key: "rowNum",             label: "No",                   minW: "min-w-[60px]" },
  { key: "name",               label: "Tier Name",            minW: "min-w-[120px]" },
  { key: "lifetime_deposit_required", label: "Lifetime Deposit", minW: "min-w-[140px]" },
  { key: "monthly_deposit",    label: "Monthly Deposit",       minW: "min-w-[160px]" },
  { key: "check_in_token",     label: "Check in Token",       minW: "min-w-[140px]" },
  { key: "upgrade_bonus",      label: "Upgrade Bonus",        minW: "min-w-[160px]", hasFreeToken: true },
  { key: "birthday_bonus",     label: "Birthday Bonus",       minW: "min-w-[160px]", hasFreeToken: true },
  { key: "mart_tier",          label: "Mart Tier",            minW: "min-w-[160px]" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatRM(val) {
  if (!val || val === 0) return "RM 0";
  return `RM ${Number(val).toLocaleString("en-MY")}`;
}

function formatNum(val) {
  if (!val) return "0";
  return Number(val).toLocaleString("en-MY");
}

// ── Tier Form Modal (Create / Edit) ─────────────────────────────────────
function TierFormModal({ tier, onClose, onSave, martTiers }) {
  const isEdit = !!tier;

  const [form, setForm] = useState({
    name: tier?.name ?? "",
    lifetime_deposit_required: tier?.lifetime_deposit_required ?? "",
    monthly_deposit: tier?.monthly_deposit ?? "",
    upgrade_bonus: tier?.upgrade_bonus ?? "",
    birthday_bonus: tier?.birthday_bonus ?? "",
    check_in_token: tier?.check_in_token ?? "",
    mart_tier_uuid: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // When editing, find the UUIDs from tier names
  useEffect(() => {
    if (tier && martTiers.length > 0) {
      const updates = {};
      
      // Find mart tier UUID
      if (tier.mart_tier && martTiers.length > 0) {
        const matchingMart = martTiers.find(t => t.name === tier.mart_tier);
        if (matchingMart) {
          updates.mart_tier_uuid = matchingMart.uuid;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        setForm(prev => ({ ...prev, ...updates }));
      }
    }
  }, [tier, martTiers]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "name" || key.includes("uuid") ? value : (value === "" ? "" : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Prepare data - only include tier UUIDs if they are selected
      const submitData = {
        name: form.name,
        lifetime_deposit_required: form.lifetime_deposit_required,
        monthly_deposit: form.monthly_deposit,
        upgrade_bonus: form.upgrade_bonus,
        birthday_bonus: form.birthday_bonus,
        check_in_token: form.check_in_token,
      };
      
      // Only add mart tier UUID if it is selected (not empty string)
      if (form.mart_tier_uuid) {
        submitData.mart_tier_uuid = form.mart_tier_uuid;
      }
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      // Extract error message from API response
      let message = "Failed to save tier. Please try again.";
      if (err.data) {
        if (typeof err.data === 'string') {
          message = err.data;
        } else if (err.data.detail) {
          message = err.data.detail;
        } else if (err.data.message) {
          message = err.data.message;
        } else if (err.data.error && err.data.details) {
          // Handle error with details structure
          const errorDetails = Object.entries(err.data.details)
            .map(([field, msgs]) => {
              const fieldName = field.replace(/_/g, ' ');
              const errorMsgs = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${fieldName}: ${errorMsgs}`;
            })
            .join('; ');
          message = err.data.error + (errorDetails ? ` - ${errorDetails}` : '');
        } else {
          // Collect all field errors
          const errors = Object.entries(err.data)
            .map(([field, msgs]) => {
              const fieldName = field.replace(/_/g, ' ');
              const errorMsgs = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${fieldName}: ${errorMsgs}`;
            })
            .join('; ');
          if (errors) message = errors;
        }
      } else if (err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { key: "name", label: "Tier Name:", type: "text" },
    { key: "lifetime_deposit_required", label: "Lifetime Deposit:", type: "number" },
    { key: "monthly_deposit", label: "Monthly Deposit:", type: "number" },
    { key: "check_in_token", label: "Check in Token:", type: "number" },
    { key: "upgrade_bonus", label: "Upgrade Bonus (Free Token):", type: "number" },
    { key: "birthday_bonus", label: "Birthday Bonus (Free Token):", type: "number" },
    { key: "mart_tier_uuid", label: "Mart Tier:", type: "select", options: martTiers },
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
        <h2 className=" font-bold text-[28px] text-white text-center capitalize mb-8">
          {isEdit ? "Edit Tier" : "Create Tier"}
        </h2>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50">
            <p className="text-red-200 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-[18px]">
              {/* Label */}
              <label className="w-[160px] shrink-0 text-[16px] text-white">
                {f.key === 'upgrade_bonus' || f.key === 'birthday_bonus' ? (
                  <>
                    {f.label.replace(' (Free Token):', ':')} <span className="text-[#e9af41]">(Free Token)</span>
                  </>
                ) : (
                  f.label
                )}
              </label>

              {/* Input */}
              {f.type === "select" ? (
                <div className="relative flex-1">
                  <select
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    className="h-[36px] w-full rounded-[4px] px-3 pr-8 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#4d4d4d] text-white">
                      {f.options?.length === 0 ? 'No options available' : `Select ${f.label.replace(':', '')}`}
                    </option>
                    {f.options?.map((opt) => (
                      <option key={opt.uuid} value={opt.uuid} className="bg-[#4d4d4d] text-white">
                        {opt.name}
                      </option>
                    ))}
                  </select>
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
                  className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b]"
                />
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-[21px] pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[37px] px-7 rounded border border-[#e5e6e6] bg-white font-bold text-[14px] text-[#f04a4a] hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[37px] px-7 rounded font-bold text-[14px] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: GOLD_BG }}
            >
              {isSubmitting ? "Saving..." : (isEdit ? "Confirm" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page content ─────────────────────────────────────────────────────────
function MrsVipContent() {
  const [tiers, setTiers] = useState([]);
  const [martTiers, setMartTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTier, setEditingTier] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load VIP tiers first (required)
      const tiersData = await adminApi.getVipTiers();
      setTiers(tiersData);
      
      // Try to load mart tiers (optional - may not exist yet)
      try {
        console.log('Loading mart tiers from API...');
        const martData = await adminApi.getRedemptionTiers();
        console.log('Mart tiers API response:', martData);
        const martArray = Array.isArray(martData) ? martData : (martData?.results || []);
        console.log('Mart tiers array:', martArray);
        setMartTiers(martArray);
      } catch (err) {
        console.error('Mart tiers API error:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          data: err.data
        });
        setMartTiers([]);
      }
    } catch (err) {
      console.error('Failed to load VIP tiers:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSaveTier = useCallback(async (tierData) => {
    if (editingTier) {
      await adminApi.updateVipTier(editingTier.uuid, tierData);
    }
    await loadData();
  }, [editingTier]);

  const handleCreateTier = useCallback(async (tierData) => {
    await adminApi.createVipTier(tierData);
    await loadData();
  }, []);

  const handleArchive = useCallback(async (tier) => {
    if (!confirm(`Are you sure you want to archive "${tier.name}"?`)) {
      return;
    }
    try {
      await adminApi.archiveVipTier(tier.uuid);
      await loadData();
    } catch (err) {
      console.error('Failed to archive tier:', err);
      alert('Failed to archive tier. Please try again.');
    }
  }, []);

  return (
    <>
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:admin-content-pl xl:pr-10 xl:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className=" font-bold text-[22px] sm:text-[28px] text-white">
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

      <LoadingState isLoading={isLoading}>
        {/* Table card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-4">
          {/* Title row + Create button */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className=" font-bold text-[18px] sm:text-[20px] text-white capitalize">
              MRS VIP Level Is Given Below
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="h-[36px] rounded px-4 text-[16px] text-black hover:opacity-90 transition-opacity"
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
                        <span className=" font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                          {col.label}
                          {col.hasFreeToken && (
                            <span className="text-[#e9af41] ml-1">(Free Token)</span>
                          )}
                        </span>
                        {col.key !== "rowNum" && (
                          <SortIcon active={sortKey === col.key} direction={sortDir} />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="min-w-[180px] px-3 py-3 text-center">
                    <span className=" font-bold text-[14px] sm:text-[16px] text-white">
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
                      className="px-5 py-12 text-center text-white/40"
                    >
                      No MRS VIP tiers found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => (
                    <tr
                      key={row.uuid}
                      className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Row number */}
                      <td className="px-3 py-3 text-[14px] text-white whitespace-nowrap">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      {/* Tier Name */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {row.name}
                      </td>
                      {/* Lifetime Deposit */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {formatRM(row.lifetime_deposit_required)}
                      </td>
                      {/* Monthly Deposit */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {formatRM(row.monthly_deposit)}
                      </td>
                      {/* Check in Token */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {formatNum(row.check_in_token)}
                      </td>
                      {/* Upgrade Bonus */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {formatNum(row.upgrade_bonus)}
                      </td>
                      {/* Birthday Bonus */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {formatNum(row.birthday_bonus)}
                      </td>
                      {/* Mart Tier */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {row.mart_tier || "-"}
                      </td>
                      {/* Action */}
                      <td className="px-3 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleArchive(row)}
                            className="h-[31px] rounded px-3 bg-[#06b800] font-bold text-[14px] text-white hover:bg-[#05a000] transition-colors"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => setEditingTier(row)}
                            className="h-[31px] w-[70px] rounded border border-[#00a63e] text-[14px] text-[#00a63e] hover:bg-[#00a63e]/10 transition-colors"
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
      </LoadingState>
    </main>

    {/* Edit Modal */}
    {editingTier && (
      <TierFormModal
        tier={editingTier}
        onClose={() => setEditingTier(null)}
        onSave={handleSaveTier}
        martTiers={martTiers}
      />
    )}

    {/* Create Modal */}
    {showCreateForm && (
      <TierFormModal
        tier={null}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateTier}
        martTiers={martTiers}
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
