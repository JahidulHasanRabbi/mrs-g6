"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import Image from "next/image";

import { 
  getMemberList, 
  getMemberListSingle, 
  updateMember,
  getVipTierList,
  getStationList 
} from "../../api/adminApi";
import { FilterDropdown, DateFilter, TextSearchInput, GOLD_BG } from "../../components/admin/members/FilterControls";
import { Pagination } from "../../components/admin/members/DataTable";

export default function MembersPage() {
  return (
    <AdminRouteGuard>
      <MembersContent />
    </AdminRouteGuard>
  );
}

// Replaced inline components with imports from FilterControls.jsx

// ── Sort icon for table headers ────────────────────────────────────────
function SortIcon({ active, dir }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 ml-0.5"
    >
      <path
        d="M4 5L7 2L10 5"
        stroke={active && dir === "asc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={active && dir === "desc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Date formatters ────────────────────────────────────────────────────
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${dd}/${mm}/${yyyy} ${h12}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
}

function toDateOnly(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}


// ── View Member Profile Modal ──────────────────────────────────────────
function ViewMemberModal({ member, onClose, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member?.uuid) return;
    
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getMemberListSingle(member.uuid);
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch member profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [member?.uuid]);

  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-[14px] border border-[#6a6a6a] bg-[#484848] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
            <span className="ml-3 text-white/60">
              Loading profile...
            </span>
          </div>
        ) : (
          <>
            {/* Profile info card */}
            <div className="rounded-[10px] border border-[#6e6e6e] bg-[#555555] p-5 sm:p-6 mb-5">
              <h2 className=" font-bold text-[20px] text-white text-center mb-5">
                Member Profile
              </h2>

              {/* Profile picture */}
              {profile?.profile_picture && (
                <div className="flex items-center gap-2 mb-3">
                  <span className=" text-[14px] text-white/90">
                    Profile Picture
                  </span>
                  <div className="w-[30px] h-[30px] rounded bg-[#e9af41]/20 flex items-center justify-center overflow-hidden">
                    <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Info rows */}
              {[
                { label: "Full Name:", value: profile?.full_name || "N/A" },
                { label: "Email:", value: profile?.email || "N/A" },
                { label: "Gender:", value: profile?.gender || "N/A" },
                { label: "DOB:", value: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB') : "N/A" },
                { label: "Hobby:", value: profile?.hobby || "N/A" },
                { label: "MRS VIP Tier:", value: profile?.vip_tier || member.tier || "N/A" },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline gap-2 py-1.5">
                  <span className=" font-bold text-[14px] text-white/90 w-[110px] shrink-0">
                    {row.label}
                  </span>
                  <span className=" text-[14px] text-white/70">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons — 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Token History", action: () => onNavigate && onNavigate("token-history", member) },
                { label: "Reward History", action: () => onNavigate && onNavigate("reward-history", member) },
                { label: "Deposit History", action: () => onNavigate && onNavigate("deposit-history", member) },
                { label: "Station", action: () => onNavigate && onNavigate("station", member) },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action || undefined}
                  className="h-[44px] rounded-[8px] border border-[#2ed82e] bg-[#06b800] font-bold text-[15px] text-white hover:bg-[#05a000] transition-colors shadow-md"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Close button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="h-[36px] px-5 rounded font-bold text-[14px] text-black hover:opacity-90 transition-opacity"
                style={{ background: GOLD_BG }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Edit Member Profile Modal ──────────────────────────────────────────
function EditMemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [profileData, setProfileData] = useState(null); // Store original profile data
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vipTiers, setVipTiers] = useState([]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  // Gender enum mapping
  const GENDER_OPTIONS = [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
    { value: 3, label: "Prefer not to say" }
  ];

  // Hobby enum mapping
  const HOBBY_OPTIONS = [
    { value: 1, label: "Reading" },
    { value: 2, label: "Cooking / Baking" },
    { value: 3, label: "Travelling" },
    { value: 4, label: "Music" },
    { value: 5, label: "Gaming" },
    { value: 6, label: "Sports" },
    { value: 7, label: "Gardening" },
    { value: 8, label: "Photography" },
    { value: 9, label: "Art" },
    { value: 10, label: "Crafting" },
    { value: 11, label: "Watching Videos" },
    { value: 12, label: "Dancing" },
    { value: 13, label: "Hiking" },
    { value: 14, label: "Writing" },
    { value: 15, label: "Animal Care" }
  ];

  useEffect(() => {
    if (!member?.uuid) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedProfile, tiersData] = await Promise.all([
          getMemberListSingle(member.uuid),
          getVipTierList()
        ]);
        
        // Store the original profile data
        setProfileData(fetchedProfile);
        
        // Find gender value from label
        const genderOption = GENDER_OPTIONS.find(g => g.label === fetchedProfile.gender);
        // Find hobby value from label
        const hobbyOption = HOBBY_OPTIONS.find(h => h.label === fetchedProfile.hobby);
        
        setForm({
          full_name: fetchedProfile.full_name || "",
          email: fetchedProfile.email || "",
          gender: genderOption?.value || "",
          date_of_birth: fetchedProfile.date_of_birth || "",
          hobby: hobbyOption?.value || "",
          mrs_vip_tier_uuid: tiersData.find(t => t.name === fetchedProfile.vip_tier)?.uuid || "",
          profile_picture: fetchedProfile.profile_picture || null
        });
        setVipTiers(tiersData);
      } catch (err) {
        console.error("Failed to fetch member data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [member?.uuid]);

  if (!member || !form) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      // According to API doc: mrs_vip_tier_uuid is required, all other fields are optional
      // Send all fields from the form (admin can update everything)
      const updateData = {
        mrs_vip_tier_uuid: form.mrs_vip_tier_uuid,
        full_name: form.full_name || null,
        email: form.email || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        hobby: form.hobby || null,
      };

      // Profile picture - only send if user uploaded a new one
      if (profilePictureFile) {
        updateData.profile_picture = profilePictureFile;
      }

      console.log('Sending update data:', updateData);

      await updateMember(member.uuid, updateData);
      onSave?.(updateData);
      onClose();
    } catch (err) {
      console.error("Failed to update member:", err);
      let errorMsg = "Failed to update member profile. Please try again.";
      if (err.data?.details) {
        const details = Object.entries(err.data.details)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        errorMsg = `Failed to update:\n${details}`;
      } else if (err.data?.error) {
        errorMsg = err.data.error;
      }
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "full_name", label: "Full Name:", type: "text" },
    { key: "email", label: "Email:", type: "email" },
    {
      key: "gender",
      label: "Gender:",
      type: "select",
      options: GENDER_OPTIONS
    },
    { key: "date_of_birth", label: "DOB:", type: "date" },
    {
      key: "hobby",
      label: "Hobby:",
      type: "select",
      options: HOBBY_OPTIONS
    },
    {
      key: "mrs_vip_tier_uuid",
      label: "MRS VIP Tier:",
      type: "select",
      options: vipTiers.map(t => ({ value: t.uuid, label: t.name }))
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[540px] rounded-[14px] border border-[#6a6a6a] bg-[#484848] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-admin"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
            <span className="ml-3 text-white/60">
              Loading...
            </span>
          </div>
        ) : (
          <>
            {/* Gold badge + title */}
            <div className="flex flex-col items-center mb-6">
              <Image src="/assets/admin/Edit-profile.png" alt="Gold Badge" width={80} height={80} className="object-contain" />
              <h2 className=" font-bold text-[22px] text-white">
                Edit Profile
              </h2>
            </div>

            {/* Profile picture upload */}
            <div className="mb-5">
              <p className=" text-[14px] text-white/90 mb-2">
                Profile Picture
              </p>
              <label className="w-full h-[80px] rounded-lg border-2 border-dashed border-[#e9af41]/40 flex items-center justify-center cursor-pointer hover:border-[#e9af41]/70 transition-colors bg-white/[0.03]">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {profilePictureFile ? (
                  <span className=" text-[13px] text-white/70">
                    {profilePictureFile.name}
                  </span>
                ) : form.profile_picture ? (
                  <img src={form.profile_picture} alt="Current" className="h-full object-contain" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="20" height="18" rx="3" fill="#e9af41" />
                    <circle cx="8.5" cy="9.5" r="2.5" fill="white" />
                    <path d="M2 17l5-5 3 3 4-4 8 6" fill="white" fillOpacity="0.7" />
                  </svg>
                )}
              </label>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4 mb-6">
              {fields.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <label className=" font-bold text-[14px] text-white/90 w-[110px] shrink-0">
                    {f.label}
                  </label>
                  {f.type === "select" ? (
                    <select
                      value={form[f.key]}
                      onChange={(e) => handleChange(f.key, f.key === "gender" || f.key === "hobby" ? parseInt(e.target.value) : e.target.value)}
                      className="flex-1 h-[38px] rounded px-3 bg-[#b0b0b0] text-[#333] text-[14px] outline-none focus:ring-2 focus:ring-[#e9af41]/40 border-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {f.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="flex-1 h-[38px] rounded px-3 bg-[#b0b0b0] text-[#333] text-[14px] outline-none focus:ring-2 focus:ring-[#e9af41]/40 placeholder:text-[#666] [color-scheme:light]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="h-[38px] px-6 rounded border border-white/20 bg-white font-bold text-[14px] text-red-500 hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="h-[38px] px-6 rounded font-bold text-[14px] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: GOLD_BG }}
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main content ───────────────────────────────────────────────────────
function MembersContent() {
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic options from API
  const [vipTiers, setVipTiers] = useState([]);
  const [stations, setStations] = useState([]);

  // Modal state
  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);

  // Navigate to history sub-pages
  const handleHistoryNavigate = useCallback(
    (type, member) => {
      const params = new URLSearchParams({
        memberId: String(member.uuid),
        name: member.username || member.full_name || "",
      });
      router.push(`/admin/members/${type}?${params.toString()}`);
    },
    [router],
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [regFrom, setRegFrom] = useState("");
  const [regTo, setRegTo] = useState("");
  const [checkinFrom, setCheckinFrom] = useState("");
  const [checkinTo, setCheckinTo] = useState("");
  const [loginFrom, setLoginFrom] = useState("");
  const [loginTo, setLoginTo] = useState("");

  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const itemsPerPage = 10;

  // Fetch VIP tiers and stations on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tiersData, stationsData] = await Promise.all([
          getVipTierList(),
          getStationList()
        ]);
        console.log('VIP Tiers:', tiersData);
        console.log('Stations:', stationsData);
        
        // Handle if response is paginated (has results array) or direct array
        const tiers = Array.isArray(tiersData) ? tiersData : (tiersData?.results || []);
        const stations = Array.isArray(stationsData) ? stationsData : (stationsData?.results || []);
        
        console.log('Processed Tiers:', tiers);
        console.log('Processed Stations:', stations);
        
        setVipTiers(tiers);
        setStations(stations);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchOptions();
  }, []);

  const fetchMembers = useCallback(async (page) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: itemsPerPage,
        member_name: searchQuery || undefined,
        phone_number: phoneQuery || undefined,
        vip_tier_uuid: tierFilter || undefined,
        station_uuid: stationFilter || undefined,
        registered_start_date: regFrom || undefined,
        registered_end_date: regTo || undefined,
        last_checkin_start_date: checkinFrom || undefined,
        last_checkin_end_date: checkinTo || undefined,
        last_login_start_date: loginFrom || undefined,
        last_login_end_date: loginTo || undefined,
      };
      const res = await getMemberList(params);
      setMembers(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load members.");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, phoneQuery, tierFilter, stationFilter, regFrom, regTo, checkinFrom, checkinTo, loginFrom, loginTo]);

  // Debounced fetch - only trigger when user stops typing/selecting for 500ms
  useEffect(() => {
    // Check if date ranges are valid (both filled or both empty)
    const isRegDateValid = (!regFrom && !regTo) || (regFrom && regTo);
    const isCheckinDateValid = (!checkinFrom && !checkinTo) || (checkinFrom && checkinTo);
    const isLoginDateValid = (!loginFrom && !loginTo) || (loginFrom && loginTo);
    
    // Only fetch if all date ranges are valid
    if (!isRegDateValid || !isCheckinDateValid || !isLoginDateValid) {
      return; // Don't fetch if any date range is incomplete
    }
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchMembers(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, phoneQuery, tierFilter, stationFilter, regFrom, regTo, checkinFrom, checkinTo, loginFrom, loginTo]);

  // Sort
  const currentMembers = useMemo(() => {
    let list = [...members];
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        if (typeof va === "number" && typeof vb === "number")
          return sortDir === "asc" ? va - vb : vb - va;
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return list;
  }, [members, sortKey, sortDir]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMembers(page);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Column definitions
  const columns = [
    { key: "id", label: "No", minW: "min-w-[50px]" },
    { key: "full_name", label: "Member Name", minW: "min-w-[120px]" },
    { key: "phone_number", label: "Phone Number", minW: "min-w-[130px]" },
    { key: "vip_tier", label: "MRS VIP Tier", minW: "min-w-[110px]" },
    { key: "current_tokens", label: "Current Tokens", minW: "min-w-[110px]" },
    {
      key: "registered_datetime",
      label: "Registered Date",
      minW: "min-w-[140px]",
    },
    {
      key: "last_check_in_date",
      label: "Last Check in Date",
      minW: "min-w-[150px]",
    },
    {
      key: "last_login_datetime",
      label: "Last Login Date",
      minW: "min-w-[140px]",
    },
  ];

  const activeFilterCount = [
    tierFilter,
    stationFilter,
    regFrom || regTo,
    checkinFrom || checkinTo,
    loginFrom || loginTo,
    searchQuery,
    phoneQuery,
  ].filter(Boolean).length;

  return (
    <>
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:admin-content-pl xl:pr-10 xl:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Member List
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            Failed to load members. Please try again.
          </div>
        )}

        {/* Table card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {/* Filters row - Fixed height to prevent content jumping */}
          <div className="min-h-[44px]">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <p className=" font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
                The Member List
              </p>
              {activeFilterCount > 0 && (
                <>
                  <span className=" text-[11px] text-[#e9af41] bg-[rgba(233,175,65,0.15)] rounded-full px-2 py-0.5">
                    {activeFilterCount} active
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setPhoneQuery("");
                      setTierFilter("");
                      setStationFilter("");
                      setRegFrom("");
                      setRegTo("");
                      setCheckinFrom("");
                      setCheckinTo("");
                      setLoginFrom("");
                      setLoginTo("");
                    }}
                    className=" text-[11px] text-red-400 hover:text-red-300 underline"
                  >
                    Clear All
                  </button>
                </>
              )}
              <span className=" text-[13px] text-white/80 ml-auto mr-1 sm:mr-2">
                Filter By:
              </span>

              {/* Date range filters */}
              <DateFilter
                label="Registered Date"
                fromDate={regFrom}
                toDate={regTo}
                onFromChange={setRegFrom}
                onToChange={setRegTo}
              />
              <DateFilter
                label="Last Checkin Date"
                fromDate={checkinFrom}
                toDate={checkinTo}
                onFromChange={setCheckinFrom}
                onToChange={setCheckinTo}
              />
              <DateFilter
                label="Last Login Date"
                fromDate={loginFrom}
                toDate={loginTo}
                onFromChange={setLoginFrom}
                onToChange={setLoginTo}
              />

              {/* Dropdown filters */}
              <FilterDropdown
                label="Station"
                options={stations.map(s => s.station_name || s.name || '')}
                value={stationFilter ? (stations.find(s => s.uuid === stationFilter)?.station_name || stations.find(s => s.uuid === stationFilter)?.name || "") : ""}
                onChange={(name) => {
                  if (!name) {
                    setStationFilter("");
                  } else {
                    const station = stations.find(s => (s.station_name || s.name) === name);
                    setStationFilter(station?.uuid || "");
                  }
                }}
              />
              <FilterDropdown
                label="MRS VIP Tier"
                options={vipTiers.map(t => t.name || '')}
                value={tierFilter ? (vipTiers.find(t => t.uuid === tierFilter)?.name || "") : ""}
                onChange={(name) => {
                  if (!name) {
                    setTierFilter("");
                  } else {
                    const tier = vipTiers.find(t => t.name === name);
                    setTierFilter(tier?.uuid || "");
                  }
                }}
              />

              {/* Text search inputs */}
              <TextSearchInput placeholder="Enter Member" value={searchQuery} onChange={setSearchQuery} />
              <TextSearchInput placeholder="Enter Phone Number" value={phoneQuery} onChange={setPhoneQuery} />
            </div>
          </div>

          {/* Results count */}
          {!isLoading && (
            <div className=" text-[12px] text-white/40">
              Showing {totalCount === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, totalCount)} of{" "}
              {totalCount} members
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
              <span className="ml-3 text-white/60">
                Loading members...
              </span>
            </div>
          )}

          {/* Table */}
          {!isLoading && (
            <div className="overflow-x-auto scrollbar-admin rounded-lg">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-black">
                    {columns.map((c) => (
                      <th
                        key={c.key}
                        className={`${c.minW} px-2 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors`}
                        onClick={() => handleSort(c.key)}
                      >
                        <div className="flex items-center">
                          <span className=" font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                            {c.label}
                          </span>
                          <SortIcon active={sortKey === c.key} dir={sortDir} />
                        </div>
                      </th>
                    ))}
                    <th className="min-w-[120px] px-2 py-3 text-left">
                      <div className="flex items-center">
                        <span className=" font-bold text-[13px] sm:text-[14px] text-white">
                          Action
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-5 py-12 text-center text-white/40"
                      >
                        {activeFilterCount > 0
                          ? "No members found matching your filters."
                          : "No members found."}
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((m, idx) => (
                      <tr
                        key={m.uuid || idx}
                        className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-2 py-3 text-[13px] text-white">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {m.full_name || m.username || "N/A"}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {m.phone_number || "N/A"}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {m.vip_tier || "N/A"}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {m.current_tokens?.toLocaleString() || "0"}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {formatDateTime(m.registered_datetime)}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {formatDateTime(m.last_check_in_date)}
                        </td>
                        <td className="px-2 py-3 text-[13px] text-white/80 whitespace-nowrap">
                          {formatDateTime(m.last_login_datetime)}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setViewMember(m)}
                              className="bg-[#06b800] rounded px-3 py-1.5 font-bold text-[13px] text-white hover:bg-[#05a000] transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setEditMember(m)}
                              className="border border-[#00a63e] rounded px-3 py-1.5 text-[13px] text-[#00a63e] hover:bg-[#00a63e]/10 transition-colors"
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
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-4 border-t border-[rgba(255,255,255,0.05)] pt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
    </main>

    {/* Modals */}
    {viewMember && (
      <ViewMemberModal
        member={viewMember}
        onClose={() => setViewMember(null)}
        onNavigate={handleHistoryNavigate}
      />
    )}
    {editMember && (
      <EditMemberModal
        member={editMember}
        onClose={() => setEditMember(null)}
        onSave={() => {
          // Reload the member list after successful edit
          fetchMembers(currentPage);
        }}
      />
    )}
    </>
  );
}
