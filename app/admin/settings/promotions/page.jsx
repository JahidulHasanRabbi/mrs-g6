"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import Pagination from "../../../components/admin/retention/Pagination";
import {
  getLuckySpinItems,
  getPenaltyKickItems,
  getPromotionsByStation,
  getRedemptionItems,
  getStationList,
} from "../../../api/adminApi";

// Promotions (Settings → Promotions). Promotions are configured per-station,
// so the list shows the promotions assigned to a selected station via
// GET /settings/promotions/get-by-station/<station_uuid>/.
// Chrome (auth guard, topbar, padding) comes from app/admin/settings/layout.jsx.

const PAGE_SIZE = 8;

const COLUMNS = [
  { key: "type", label: "Type", minW: 220 },
  { key: "name", label: "Name", minW: 240 },
  { key: "code", label: "Code", minW: 160 },
  { key: "item", label: "Item", minW: 240 },
  { key: "actions", label: "Actions", minW: 120 },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.value)) return response.value;
  return [];
}

function itemLabel(item) {
  return item?.name || item?.reward_name || item?.title || item?.display_name || item?.uuid || "";
}

function buildItemNameLookup(responses) {
  const lookup = {};
  for (const response of responses) {
    for (const item of normalizeListResponse(response)) {
      if (item?.uuid) lookup[item.uuid] = itemLabel(item);
    }
  }
  return lookup;
}

function displayPromotionItem(promo, itemNameByUuid) {
  const item = promo?.item;
  if (typeof item === "string" && UUID_RE.test(item)) {
    return itemNameByUuid[item] || promo?.name || item;
  }
  return promo?.name || item || "—";
}


// Flatten the get-by-station response (groups of { type, promotions: [{item, name, code}] })
// into one row per promotion.
function flattenPromotions(response, itemNameByUuid = {}) {
  const groups = normalizeListResponse(response);
  const rows = [];
  for (const group of groups) {
    const promos = Array.isArray(group?.promotions) ? group.promotions : Array.isArray(group?.promotion) ? group.promotion : [];
    for (const promo of promos) {
      rows.push({
        type: group?.type || "—",
        name: promo?.name ?? "—",
        code: promo?.code ?? "—",
        item: displayPromotionItem(promo, itemNameByUuid),
      });
    }
  }
  return rows;
}

export default function PromotionsPage() {
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState("");
  const [rows, setRows] = useState([]);
  const [itemNameByUuid, setItemNameByUuid] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getStationList()
      .then((res) => {
        if (cancelled) return;
        const results = normalizeListResponse(res);
        setStations(results);
        if (results.length > 0) setSelectedStation(results[0].uuid);
      })
      .catch((err) => console.error("[promotions] station list failed", err))
      .finally(() => { if (!cancelled) setStationsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      getLuckySpinItems(),
      getRedemptionItems(),
      getPenaltyKickItems({ page_size: 1000 }),
    ]).then((results) => {
      if (cancelled) return;
      setItemNameByUuid(buildItemNameLookup(
        results.filter((result) => result.status === "fulfilled").map((result) => result.value)
      ));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedStation) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getPromotionsByStation(selectedStation)
      .then((res) => {
        if (cancelled) return;
        setRows(flattenPromotions(res, itemNameByUuid));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[promotions] fetch failed", err);
        setError(true);
        setRows([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedStation, itemNameByUuid]);

  return (
    <>
      <PageHeader />
      <PromotionList
        stations={stations}
        stationsLoading={stationsLoading}
        selectedStation={selectedStation}
        onStationChange={setSelectedStation}
        rows={rows}
        loading={loading}
        error={error}
      />
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">
          ADMIN DASHBOARD
        </span>
        <h1
          className="bg-clip-text text-transparent font-bold whitespace-nowrap"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "clamp(32px, 5vw, 46px)",
            lineHeight: "1.2",
            letterSpacing: "-1px",
          }}
        >
          Promotions
        </h1>
      </div>
    </div>
  );
}

function PromotionList({ stations, stationsLoading, selectedStation, onStationChange, rows, loading, error }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const haystack = `${r.type || ""} ${r.name || ""} ${r.code || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, selectedStation]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, filtered.length);

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-col gap-4 p-6 w-full md:flex-row md:items-center md:justify-between">
        <h2
          className="text-white font-bold whitespace-nowrap shrink-0"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Promotion List
        </h2>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <SearchInput value={query} onChange={setQuery} />
          <AddPromotionButton stationUuid={selectedStation} />
        </div>
      </header>

      <div className="px-6 pb-6">
        <StationTabs
          stations={stations}
          loading={stationsLoading}
          value={selectedStation}
          onChange={onStationChange}
        />
      </div>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {!selectedStation ? (
              <EmptyRow text="Select a station to view its promotions." />
            ) : loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">
                Failed to load promotions.
              </div>
            ) : visibleRows.length === 0 ? (
              <EmptyRow text="No promotions yet." />
            ) : (
              visibleRows.map((row, idx) => (
                <PromotionRow key={`${row.type}-${row.code}-${idx}`} row={row} stationUuid={selectedStation} />
              ))
            )}
          </div>
        </div>
      </div>

      <Pagination
        from={showingFrom}
        to={showingTo}
        total={filtered.length}
        currentPage={safePage}
        pageCount={totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}

// Row of per-station buttons (matches the category-tab pattern used on the
// Terms & Conditions page) so stations are switched one-by-one.
function StationTabs({ stations, loading, value, onChange }) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[38px] w-[100px] animate-pulse rounded-[8px] bg-white/10" />
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return <p className="text-[12px] text-white/40">No stations available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {stations.map((s) => {
        const active = s.uuid === value;
        return (
          <button
            key={s.uuid}
            type="button"
            onClick={() => onChange(s.uuid)}
            className={`flex h-[38px] items-center justify-center rounded-[8px] border-2 px-4 text-[12px] font-semibold whitespace-nowrap transition ${
              active
                ? "border-[#f2cb7a] text-[#141828]"
                : "border-[#fbeed2]/30 text-[#fbeed2] hover:border-[#f2cb7a]"
            }`}
            style={active ? { backgroundImage: GRAD_GOLD } : undefined}
          >
            {s.station_name || s.name || s.uuid}
          </button>
        );
      })}
    </div>
  );
}

function AddPromotionButton({ stationUuid }) {
  const href = stationUuid
    ? `/admin/settings/promotions/add?station=${stationUuid}`
    : "/admin/settings/promotions/add";
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] whitespace-nowrap transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <PlusIcon />
      <span>Manage Promotions</span>
    </Link>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by type, name or code"
      className="w-[200px] bg-[#141828] border border-[#f2cb7a] rounded-[8px] px-3 py-2 text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6] placeholder:capitalize focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "15px" }}
    />
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className="flex flex-1 flex-col items-start px-6 py-4"
          style={{ minWidth: col.minW }}
        >
          <p className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap" style={{ letterSpacing: "-1px" }}>
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function PromotionRow({ row, stationUuid }) {
  const editHref = stationUuid
    ? `/admin/settings/promotions/add?station=${stationUuid}`
    : "/admin/settings/promotions/add";
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.type}
        </span>
      </Cell>
      <Cell minW={COLUMNS[1].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.name}
        </span>
      </Cell>
      <Cell minW={COLUMNS[2].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.code}
        </span>
      </Cell>
      <Cell minW={COLUMNS[3].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] break-all">
          {row.item}
        </span>
      </Cell>
      <Cell minW={COLUMNS[4].minW}>
        <Link
          href={editHref}
          className="rounded-[6px] border-2 border-[#f2cb7a] px-3 py-1 text-[12px] font-semibold text-[#fbeed2] transition hover:bg-[#f2cb7a]/10"
        >
          Edit
        </Link>
      </Cell>
    </div>
  );
}

function Cell({ children, minW }) {
  return (
    <div className="flex flex-1 items-center p-6" style={{ minWidth: minW }}>
      {children}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      {text}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <div key={col.key} className="flex flex-1 items-center p-6" style={{ minWidth: col.minW }}>
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
