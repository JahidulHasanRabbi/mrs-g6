"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { SortIcon, Pagination } from "../../components/admin/members/DataTable";
import { LoadingState } from "../../components/ui/LoadingState";
import Skeleton from "../../components/admin/ui/Skeleton";
import * as adminApi from "../../api/adminApi";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 7;

const MRS_PAGES = [
  { slug: "/",                   label: "Home" },
  { slug: "/personal-data",      label: "Personal Data" },
  { slug: "/profile",            label: "Profile" },
  { slug: "/mart",               label: "Redemption Mart" },
  { slug: "/spin",               label: "Lucky Spin" },
  { slug: "/penalty-kick",       label: "Penalty Kick" },
  { slug: "/terms-and-conditions", label: "Terms & Conditions" },
  { slug: "/vip",                label: "VIP" },
];

const MRS_SLUGS = new Set(MRS_PAGES.map((p) => p.slug));

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

const FALLBACK_ICON = "/assets/admin/Tier.png";

const TABLE_COLUMNS = [
  { key: "rowNum",         label: "No",            minW: "min-w-[60px]" },
  { key: "display_text",   label: "Display Text",  minW: "min-w-[180px]" },
  { key: "url_slug",       label: "URL",           minW: "min-w-[200px]" },
  { key: "display_order",  label: "Order",         minW: "min-w-[100px]" },
  { key: "station_name",   label: "Station",       minW: "min-w-[140px]" },
  { key: "icon",           label: "Icon",          minW: "min-w-[100px]" },
];

// ── Menu Icon cell (with onError fallback) ──────────────────────────────
function MenuIconCell({ src }) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? FALLBACK_ICON : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt="Menu icon"
      onError={() => setErrored(true)}
      className="h-[40px] w-[40px] object-cover rounded-[4px]"
    />
  );
}

// ── Menu Form Modal (Create / Edit) ─────────────────────────────────────
function MenuFormModal({ menu, onClose, onSave, stations }) {
  const isEdit = !!menu;

  const initialSlug = menu?.url_slug ?? "";
  const initialIsMrs = MRS_SLUGS.has(initialSlug);

  const [form, setForm] = useState({
    display_text:   menu?.display_text ?? "",
    url_slug:       initialSlug,
    display_order:  menu?.display_order ?? "",
    station_uuid:   menu?.station_uuid ?? "",
  });
  const [useMrsPage, setUseMrsPage] = useState(initialIsMrs);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(menu?.icon ?? "");
  const [iconErrored, setIconErrored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // When editing, find the station_uuid from station_name
  useEffect(() => {
    if (menu && stations.length > 0) {
      if (menu.station_uuid) {
        setForm(prev => ({ ...prev, station_uuid: menu.station_uuid }));
      } else if (menu.station_name) {
        const matchingStation = stations.find(s => 
          s.station_name === menu.station_name || s.name === menu.station_name
        );
        if (matchingStation) {
          setForm(prev => ({ ...prev, station_uuid: matchingStation.uuid }));
        }
      }
    }
  }, [menu, stations]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "display_order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result);
      setIconErrored(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const submitData = { ...form };
      
      // Only add icon if user uploaded a new one
      if (iconFile) {
        submitData.icon = iconFile;
      }
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      let message = "Failed to save menu. Please try again.";
      if (err.data) {
        if (typeof err.data === 'string') {
          message = err.data;
        } else if (err.data.detail) {
          message = err.data.detail;
        } else if (err.data.message) {
          message = err.data.message;
        } else {
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
        {/* Icon badge */}
        <div className="flex justify-center mb-2">
          <Image
            src="/assets/admin/Tier.png"
            alt="Menu"
            width={70}
            height={70}
            priority
          />
        </div>

        {/* Title */}
        <h2 className=" font-bold text-[28px] text-white text-center mb-8">
          {isEdit ? "Edit Floating Menu" : "Create New Floating Menu"}
        </h2>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50">
            <p className="text-red-200 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Display Text */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 text-[16px] text-white">
              Display Text:
            </label>
            <input
              type="text"
              value={form.display_text}
              onChange={(e) => handleChange("display_text", e.target.value)}
              required
              className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b]"
            />
          </div>

          {/* URL Slug */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-[18px]">
              <label className="w-[120px] shrink-0 text-[16px] text-white">
                URL:
              </label>
              {/* Use MRS Page toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useMrsPage}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseMrsPage(checked);
                    // clear url when toggling to avoid stale value
                    handleChange("url_slug", checked ? (MRS_PAGES[0]?.slug ?? "") : "");
                  }}
                  className="w-4 h-4 accent-[#f2c36b] cursor-pointer"
                />
                <span className="text-[14px] text-white/80">Use MRS Page</span>
              </label>
            </div>

            {useMrsPage ? (
              <div className="flex items-center gap-[18px]">
                <span className="w-[120px] shrink-0" />
                <div className="relative flex-1">
                  <select
                    value={form.url_slug}
                    onChange={(e) => handleChange("url_slug", e.target.value)}
                    required
                    className="h-[36px] w-full rounded-[4px] px-3 pr-8 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
                  >
                    {MRS_PAGES.map((p) => (
                      <option key={p.slug} value={p.slug} className="bg-[#4d4d4d] text-white">
                        {p.label} ({p.slug})
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-[18px]">
                <span className="w-[120px] shrink-0" />
                <input
                  type="text"
                  value={form.url_slug}
                  onChange={(e) => handleChange("url_slug", e.target.value)}
                  required
                  placeholder="https://example.com or /custom-path"
                  className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b]"
                />
              </div>
            )}
          </div>

          {/* Display Order */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 text-[16px] text-white">
              Display Order:
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => handleChange("display_order", e.target.value)}
              required
              min={0}
              className="h-[36px] flex-1 rounded-[4px] px-3 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b]"
            />
          </div>

          {/* Station */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 text-[16px] text-white">
              Station:
            </label>
            <div className="relative flex-1">
              <select
                value={form.station_uuid}
                onChange={(e) => handleChange("station_uuid", e.target.value)}
                required
                className="h-[36px] w-full rounded-[4px] px-3 pr-8 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#4d4d4d] text-white">
                  Select station
                </option>
                {stations?.map((station) => (
                  <option key={station.uuid} value={station.uuid} className="bg-[#4d4d4d] text-white">
                    {station.station_name || station.name}
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

          {/* Icon upload */}
          <div className="flex flex-col gap-2 pt-2">
            <span className=" text-[16px] text-white">
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
                  alt="Menu icon preview"
                  onError={() => setIconErrored(true)}
                  className="h-[80px] w-[80px] object-contain"
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#e9af41" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
                  <path d="M21 15l-5-5L5 21" stroke="#e9af41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
              {isSubmitting ? "Saving..." : (isEdit ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Root Icon Form Modal ─────────────────────────────────────────────────
function RootIconFormModal({ rootIcon, onClose, onSave, stations }) {
  const isEdit = !!rootIcon;

  const [form, setForm] = useState({
    station_uuid: rootIcon?.station_uuid ?? "",
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(rootIcon?.icon ?? "");
  const [iconErrored, setIconErrored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // When editing, ensure we have the station_uuid
  useEffect(() => {
    if (rootIcon && stations.length > 0) {
      if (rootIcon.station_uuid) {
        setForm(prev => ({ ...prev, station_uuid: rootIcon.station_uuid }));
      } else if (rootIcon.station_name) {
        const matchingStation = stations.find(s => 
          s.station_name === rootIcon.station_name || s.name === rootIcon.station_name
        );
        if (matchingStation) {
          setForm(prev => ({ ...prev, station_uuid: matchingStation.uuid }));
        }
      }
    }
  }, [rootIcon, stations]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result);
      setIconErrored(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!iconFile && !isEdit) {
      setErrorMessage("Please upload an icon image");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const submitData = { ...form };
      
      // Icon is required for create, optional for edit
      if (iconFile) {
        submitData.icon = iconFile;
      }
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      let message = "Failed to save root icon. Please try again.";
      if (err.data) {
        if (typeof err.data === 'string') {
          message = err.data;
        } else if (err.data.detail) {
          message = err.data.detail;
        } else if (err.data.message) {
          message = err.data.message;
        } else {
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
        {/* Icon badge */}
        <div className="flex justify-center mb-2">
          <Image
            src="/assets/admin/Tier.png"
            alt="Root Icon"
            width={70}
            height={70}
            priority
          />
        </div>

        {/* Title */}
        <h2 className="font-['Times_New_Roman'] font-bold text-[28px] text-white text-center mb-4">
          {isEdit ? "Edit Root Icon" : "Create Root Icon"}
        </h2>
        
        <p className="text-white/70 text-[14px] font-['Times_New_Roman'] text-center mb-6">
          The root icon is the main floating button that opens the menu
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50">
            <p className="text-red-200 text-sm font-['Times_New_Roman']">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Station */}
          <div className="flex items-center gap-[18px]">
            <label className="w-[120px] shrink-0 font-['Times_New_Roman'] text-[16px] text-white">
              Station:
            </label>
            <div className="relative flex-1">
              <select
                value={form.station_uuid}
                onChange={(e) => handleChange("station_uuid", e.target.value)}
                required
                className="h-[36px] w-full rounded-[4px] px-3 pr-8 bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] font-['Times_New_Roman'] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#4d4d4d] text-white">
                  Select station
                </option>
                {stations?.map((station) => (
                  <option key={station.uuid} value={station.uuid} className="bg-[#4d4d4d] text-white">
                    {station.station_name || station.name}
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

          {/* Icon upload */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="font-['Times_New_Roman'] text-[16px] text-white">
              Root Icon {!isEdit && <span className="text-red-400">*</span>}
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
                  alt="Root icon preview"
                  onError={() => setIconErrored(true)}
                  className="h-[80px] w-[80px] object-contain"
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#e9af41" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
                  <path d="M21 15l-5-5L5 21" stroke="#e9af41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
              disabled={isSubmitting}
              className="h-[37px] px-7 rounded border border-[#e5e6e6] bg-white font-['Times_New_Roman'] font-bold text-[14px] text-[#f04a4a] hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[37px] px-7 rounded font-['Times_New_Roman'] font-bold text-[14px] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: GOLD_BG }}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page content ─────────────────────────────────────────────────────────
function FloatingMenuContent() {
  const [menus, setMenus] = useState([]);
  const [rootIcons, setRootIcons] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("menu-items"); // "menu-items" or "root-icons"

  // Search filters
  const [stationSearch, setStationSearch] = useState("");
  const [displayTextSearch, setDisplayTextSearch] = useState("");

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [stationSearch, displayTextSearch]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (stationSearch) params.station_name = stationSearch;
      if (displayTextSearch) params.display_text = displayTextSearch;

      const [menusData, rootIconsData, stationsData] = await Promise.all([
        adminApi.getFloatingMenus(params),
        adminApi.getFloatingMenuRootIcons(),
        adminApi.getStationList(),
      ]);
      // Handle paginated response
      const menusArray = Array.isArray(menusData) ? menusData : (menusData?.results || []);
      const rootIconsArray = Array.isArray(rootIconsData) ? rootIconsData : (rootIconsData?.results || []);
      
      setMenus(menusArray);
      setRootIcons(rootIconsArray);
      setStations(stationsData);
      setCurrentPage(1); // Reset to first page on search
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedRows = useMemo(() => {
    const list = [...menus];
    if (sortKey && sortKey !== "rowNum" && sortKey !== "icon") {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [menus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pageRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = useCallback((key) => {
    if (key === "rowNum" || key === "icon") return;
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const handleSaveMenu = useCallback(async (updatedData) => {
    if (editingMenu) {
      await adminApi.updateFloatingMenu(editingMenu.uuid, updatedData);
    }
    await loadData();
  }, [editingMenu]);

  const handleCreateMenu = useCallback(async (newData) => {
    await adminApi.createFloatingMenu(newData);
    await loadData();
  }, []);

  const handleArchive = useCallback(async (menu) => {
    if (!confirm(`Are you sure you want to archive "${menu.display_text}"?`)) {
      return;
    }
    try {
      await adminApi.archiveFloatingMenu(menu.uuid);
      await loadData();
    } catch (err) {
      console.error('Failed to archive menu:', err);
      alert('Failed to archive menu. Please try again.');
    }
  }, []);

  const handleSaveRootIcon = useCallback(async (rootIconData) => {
    await adminApi.createOrUpdateRootIcon(rootIconData);
    await loadData();
  }, []);

  const [editingRootIcon, setEditingRootIcon] = useState(null);
  const [showRootIconForm, setShowRootIconForm] = useState(false);

  return (
    <>
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:admin-content-pl xl:pr-10 xl:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold leading-[1.05] text-white">
          Floating Menu
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

      <LoadingState
        isLoading={isLoading}
        skeleton={
          <Skeleton.TabbedPage tabs={2} columnLabels={["Menu Item", "Display Text", "Icon", "Order", "Action"]} rows={6} withHeader={false} bare />
        }
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("menu-items")}
            className={`h-[40px] px-6 rounded font-['Times_New_Roman'] text-[16px] transition-all ${
              activeTab === "menu-items"
                ? "text-black"
                : "text-white/70 bg-white/5 hover:bg-white/10"
            }`}
            style={activeTab === "menu-items" ? { background: GOLD_BG } : {}}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab("root-icons")}
            className={`h-[40px] px-6 rounded font-['Times_New_Roman'] text-[16px] transition-all ${
              activeTab === "root-icons"
                ? "text-black"
                : "text-white/70 bg-white/5 hover:bg-white/10"
            }`}
            style={activeTab === "root-icons" ? { background: GOLD_BG } : {}}
          >
            Root Icons
          </button>
        </div>

        {/* Menu Items Tab */}
        {activeTab === "menu-items" && (
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-4">
          {/* Title row + Create button */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className=" font-bold text-[18px] sm:text-[20px] text-white">
              The Floating Menu Options Are Given Below
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="h-[36px] rounded px-4 text-[16px] text-black hover:opacity-90 transition-opacity"
              style={{ background: GOLD_BG }}
            >
              Create New Menu <span className="font-bold">+</span>
            </button>
          </div>

          {/* Search filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-['Times_New_Roman'] text-[14px] text-white/80">
              Search:
            </span>
            <input
              type="text"
              placeholder="Station name..."
              value={stationSearch}
              onChange={(e) => setStationSearch(e.target.value)}
              className="h-[36px] w-[180px] rounded px-3 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] font-['Times_New_Roman'] text-[14px] text-white placeholder:text-white/40 outline-none focus:border-[#e9af41]"
            />
            <input
              type="text"
              placeholder="Display text..."
              value={displayTextSearch}
              onChange={(e) => setDisplayTextSearch(e.target.value)}
              className="h-[36px] w-[180px] rounded px-3 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] font-['Times_New_Roman'] text-[14px] text-white placeholder:text-white/40 outline-none focus:border-[#e9af41]"
            />
            {(stationSearch || displayTextSearch) && (
              <button
                onClick={() => {
                  setStationSearch("");
                  setDisplayTextSearch("");
                }}
                className="font-['Times_New_Roman'] text-[12px] text-red-400 hover:text-red-300 underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-admin rounded-lg">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-black rounded-t-[6px]">
                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`${col.minW || ""} px-3 py-3 text-left ${col.key !== "rowNum" && col.key !== "icon" ? "cursor-pointer select-none hover:bg-white/5 transition-colors" : ""}`}
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center">
                        <span className=" font-bold text-[14px] sm:text-[16px] text-white whitespace-nowrap">
                          {col.label}
                        </span>
                        {col.key !== "rowNum" && col.key !== "icon" && (
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
                      No floating menus found.
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
                      {/* Display Text */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {row.display_text}
                      </td>
                      {/* URL */}
                      <td className="px-3 py-3 text-[14px] text-white/80">
                        <a 
                          href={row.url_slug} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#e9af41] hover:underline truncate block max-w-[300px]"
                        >
                          {row.url_slug}
                        </a>
                      </td>
                      {/* Display Order */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {row.display_order}
                      </td>
                      {/* Station */}
                      <td className="px-3 py-3 text-[14px] text-white/80 whitespace-nowrap">
                        {row.station_name || "-"}
                      </td>
                      {/* Icon */}
                      <td className="px-3 py-3">
                        <MenuIconCell src={row.icon} />
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
                            onClick={() => setEditingMenu(row)}
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
        )}

        {/* Root Icons Tab */}
        {activeTab === "root-icons" && (
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-4">
          {/* Title row + Create button */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-['Times_New_Roman'] font-bold text-[18px] sm:text-[20px] text-white">
              Root Icons (Main Floating Button)
            </p>
            <button
              onClick={() => setShowRootIconForm(true)}
              className="h-[36px] rounded px-4 font-['Times_New_Roman'] text-[16px] text-black hover:opacity-90 transition-opacity"
              style={{ background: GOLD_BG }}
            >
              Create Root Icon <span className="font-bold">+</span>
            </button>
          </div>

          {/* Root Icons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rootIcons.length === 0 ? (
              <div className="col-span-full py-12 text-center font-['Times_New_Roman'] text-white/40">
                No root icons found. Create one to get started.
              </div>
            ) : (
              rootIcons.map((rootIcon) => (
                <div
                  key={rootIcon.uuid}
                  className="relative rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.3)] p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <MenuIconCell src={rootIcon.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-['Times_New_Roman'] font-bold text-[16px] text-white truncate">
                        {rootIcon.station_name || "Unknown Station"}
                      </h3>
                      <p className="font-['Times_New_Roman'] text-[12px] text-white/60">
                        Station Root Icon
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setEditingRootIcon(rootIcon)}
                      className="flex-1 h-[32px] rounded border border-[#00a63e] font-['Times_New_Roman'] text-[14px] text-[#00a63e] hover:bg-[#00a63e]/10 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </LoadingState>
    </main>

    {/* Edit Modal */}
    {editingMenu && (
      <MenuFormModal
        menu={editingMenu}
        onClose={() => setEditingMenu(null)}
        onSave={handleSaveMenu}
        stations={stations}
      />
    )}

    {/* Create Modal */}
    {showCreateForm && (
      <MenuFormModal
        menu={null}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateMenu}
        stations={stations}
      />
    )}

    {/* Root Icon Edit Modal */}
    {editingRootIcon && (
      <RootIconFormModal
        rootIcon={editingRootIcon}
        onClose={() => setEditingRootIcon(null)}
        onSave={handleSaveRootIcon}
        stations={stations}
      />
    )}

    {/* Root Icon Create Modal */}
    {showRootIconForm && (
      <RootIconFormModal
        rootIcon={null}
        onClose={() => setShowRootIconForm(false)}
        onSave={handleSaveRootIcon}
        stations={stations}
      />
    )}
    </>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function FloatingMenuPage() {
  return (
    <AdminRouteGuard>
      <FloatingMenuContent />
    </AdminRouteGuard>
  );
}
