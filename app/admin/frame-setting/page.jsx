"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Image from "next/image";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { SortIcon, Pagination } from "../../components/admin/members/DataTable";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 7;

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

// Placeholder frame icon — replace `/assets/admin/frame-icon.png` with the
// real artwork. Falls back to Tier.png if the file is missing in dev.
const PLACEHOLDER_FRAME_ICON = "/assets/admin/frame-icon.png";
const FALLBACK_FRAME_ICON = "/assets/admin/Tier.png";

const VIP_OPTIONS = [
  "Bronze", "Silver", "Gold", "Platinum", "Diamond",
  "Emerald", "Ruby", "Sapphire", "Topaz",
];

const CHALLENGE_OPTIONS = ["Easy", "Medium", "Hard"];

// ── Mock data ────────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to frame-setting endpoint.
// Based on Figma 70:1000 — Frame Setting table columns:
// Frame Name, Frame Details, VIP, Challenge, Frame Icon.
const MOCK_FRAMES = [
  { id: 1, frameName: "Bronze",   frameDetails: 10000, vip: "Gold",     challenge: "Hard",   frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 2, frameName: "Silver",   frameDetails: 20000, vip: "Platinum", challenge: "Medium", frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 3, frameName: "Gold",     frameDetails: 30000, vip: "Diamond",  challenge: "Easy",   frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 4, frameName: "Copper",   frameDetails: 5000,  vip: "Emerald",  challenge: "Hard",   frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 5, frameName: "Platinum", frameDetails: 15000, vip: "Ruby",     challenge: "Medium", frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 6, frameName: "Titanium", frameDetails: 25000, vip: "Sapphire", challenge: "Easy",   frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 7, frameName: "Iron",     frameDetails: 8000,  vip: "Topaz",    challenge: "Hard",   frameIcon: PLACEHOLDER_FRAME_ICON },
  { id: 8, frameName: "Steel",    frameDetails: 12000, vip: "Gold",     challenge: "Medium", frameIcon: PLACEHOLDER_FRAME_ICON },
];

const TABLE_COLUMNS = [
  { key: "rowNum",        label: "No",            minW: "min-w-[60px]" },
  { key: "frameName",     label: "Frame Name",    minW: "min-w-[140px]" },
  { key: "frameDetails",  label: "Frame Details", minW: "min-w-[140px]" },
  { key: "vip",           label: "VIP",           minW: "min-w-[120px]" },
  { key: "challenge",     label: "Challenge",     minW: "min-w-[120px]" },
  { key: "frameIcon",     label: "Frame Icon",    minW: "min-w-[120px]" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatNum(val) {
  if (typeof val !== "number") return val;
  return val.toLocaleString("en-MY");
}

// Inline SVG used as the empty-icon placeholder inside the upload box
// (matches the orange image silhouette in the Figma mockup).
function ImagePlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#e9af41" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
      <path d="M21 15l-5-5L5 21" stroke="#e9af41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Frame Form Modal (Create / Edit) ────────────────────────────────────
// Matches Figma 88:2414 (Create) and 94:1254 (Edit)
function FrameFormModal({ frame, onClose, onSave }) {
  const isEdit = !!frame;

  const [form, setForm] = useState({
    frameName:    frame?.frameName ?? "",
    frameDetails: frame?.frameDetails ?? "",
    vip:          frame?.vip ?? "",
    challenge:    frame?.challenge ?? "",
    frameIcon:    frame?.frameIcon ?? "",
  });
  const [iconPreview, setIconPreview] = useState(frame?.frameIcon ?? "");
  const [iconErrored, setIconErrored] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "frameDetails" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For now show a local preview. Backend upload can replace this with
    // the response URL.
    const url = URL.createObjectURL(file);
    setIconPreview(url);
    setIconErrored(false);
    setForm((prev) => ({ ...prev, frameIcon: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
    onClose();
  };

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
            alt="Frame"
            width={70}
            height={70}
            priority
          />
        </div>

        {/* Title */}
        <h2 className="font-['Times_New_Roman'] font-bold text-[28px] text-white text-center mb-8">
          {isEdit ? "Edit New Frame" : "Create New Frame"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 font-['Times_New_Roman'] text-[16px] text-white">
              Name:
            </label>
            <input
              type="text"
              value={form.frameName}
              onChange={(e) => handleChange("frameName", e.target.value)}
              required
              className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b]"
            />
          </div>

          {/* Details */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 font-['Times_New_Roman'] text-[16px] text-white">
              Details:
            </label>
            <input
              type="number"
              value={form.frameDetails}
              onChange={(e) => handleChange("frameDetails", e.target.value)}
              required
              min={0}
              className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b]"
            />
          </div>

          {/* VIP — dropdown */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 font-['Times_New_Roman'] text-[16px] text-white">
              VIP:
            </label>
            <div className="relative flex-1">
              <select
                value={form.vip}
                onChange={(e) => handleChange("vip", e.target.value)}
                required
                className="h-[36px] w-full rounded-[4px] px-3 pr-8 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#4d4d4d] text-white">
                  Select VIP tier
                </option>
                {VIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#4d4d4d] text-white">
                    {opt}
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
          </div>

          {/* Challenge */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 font-['Times_New_Roman'] text-[16px] text-white">
              Challenge:
            </label>
            <input
              type="text"
              list="challenge-options"
              value={form.challenge}
              onChange={(e) => handleChange("challenge", e.target.value)}
              required
              className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b]"
            />
            <datalist id="challenge-options">
              {CHALLENGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>

          {/* Icon upload */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="font-['Times_New_Roman'] text-[16px] text-white">
              Icon
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[110px] w-full items-center justify-center rounded-[6px] border border-dashed border-white/40 hover:border-[#f2c36b] transition-colors bg-transparent"
            >
              {iconPreview && !iconErrored ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconPreview}
                  alt="Frame icon preview"
                  onError={() => setIconErrored(true)}
                  className="h-[80px] w-[80px] object-contain"
                />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
          </div>

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
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Frame Icon cell (with onError fallback) ─────────────────────────────
function FrameIconCell({ src }) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? FALLBACK_FRAME_ICON : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt="Frame icon"
      onError={() => setErrored(true)}
      className="h-[40px] w-[60px] object-cover rounded-[4px]"
    />
  );
}

// ── Page content ─────────────────────────────────────────────────────────
function FrameSettingContent() {
  const [frames, setFrames] = useState(MOCK_FRAMES);
  const [editingFrame, setEditingFrame] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedRows = useMemo(() => {
    const list = [...frames];
    if (sortKey && sortKey !== "rowNum" && sortKey !== "frameIcon") {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [frames, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pageRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = useCallback((key) => {
    if (key === "rowNum" || key === "frameIcon") return;
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const handleSaveFrame = useCallback((updatedData) => {
    // TODO (Backend): call API to update the frame.
    if (editingFrame) {
      setFrames((prev) =>
        prev.map((f) => (f.id === editingFrame.id ? { ...f, ...updatedData } : f)),
      );
    }
    setEditingFrame(null);
  }, [editingFrame]);

  const handleCreateFrame = useCallback((newData) => {
    // TODO (Backend): call API to create frame.
    setFrames((prev) => {
      const newId = (prev.length ? Math.max(...prev.map((f) => f.id)) : 0) + 1;
      return [...prev, { id: newId, ...newData }];
    });
    setShowCreateForm(false);
  }, []);

  const handleArchive = useCallback((frame) => {
    // TODO (Backend): call archive API endpoint.
    setFrames((prev) => prev.filter((f) => f.id !== frame.id));
  }, []);

  return (
    <>
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Times_New_Roman'] font-bold text-[22px] sm:text-[28px] text-white">
          Frame Setting
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
          <p className="font-['Times_New_Roman'] font-bold text-[18px] sm:text-[20px] text-white">
            The Frame Setting Options Are Given Below
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-[36px] rounded px-4 font-['Times_New_Roman'] text-[16px] text-black hover:opacity-90 transition-opacity"
            style={{ background: GOLD_BG }}
          >
            Create New Frame <span className="font-bold">+</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-admin rounded-lg">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-black rounded-t-[6px]">
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.minW || ""} px-3 py-3 text-left ${col.key !== "rowNum" && col.key !== "frameIcon" ? "cursor-pointer select-none hover:bg-white/5 transition-colors" : ""}`}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      <span className="font-['Times_New_Roman'] font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                        {col.label}
                      </span>
                      {col.key !== "rowNum" && col.key !== "frameIcon" && (
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
                    No frames found.
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
                    {/* Frame Name */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {row.frameName}
                    </td>
                    {/* Frame Details */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {formatNum(row.frameDetails)}
                    </td>
                    {/* VIP */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {row.vip}
                    </td>
                    {/* Challenge */}
                    <td className="px-3 py-3 font-['Times_New_Roman'] text-[14px] text-white/80 whitespace-nowrap">
                      {row.challenge}
                    </td>
                    {/* Frame Icon */}
                    <td className="px-3 py-3">
                      <FrameIconCell src={row.frameIcon} />
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
                          onClick={() => setEditingFrame(row)}
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
    {editingFrame && (
      <FrameFormModal
        frame={editingFrame}
        onClose={() => setEditingFrame(null)}
        onSave={handleSaveFrame}
      />
    )}

    {/* Create Modal */}
    {showCreateForm && (
      <FrameFormModal
        frame={null}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateFrame}
      />
    )}
    </>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function FrameSettingPage() {
  return (
    <AdminRouteGuard>
      <FrameSettingContent />
    </AdminRouteGuard>
  );
}
