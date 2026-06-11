"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GRAD_GOLD } from "../../../../components/admin/retention/constants";
import { createPromotion, getAvailablePromotions, getPromotionsByStation, getRedemptionItems, getStationList } from "../../../../api/adminApi";

// Manage Promotions (Settings → Promotions → Add/Edit).
// POST /settings/promotions/ body: { station_id, promotions: [{ promotion_type, item_uuid, promotion_code }] }
// There is no PUT/PATCH for individual promotions - POST replaces the full set
// for the station, so this page hydrates with the station's existing
// promotions (GET get-by-station) and re-submits the full edited list.
// Chrome (auth guard, topbar, padding) comes from app/admin/settings/layout.jsx.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function emptyPromotion() {
  return { promotion_type: "", item_uuid: "", promotion_code: "" };
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

// Map a get-by-station group's `type` label (e.g. "VIP Type") back to the
// numeric `value` from available-promotions (case/spacing tolerant).
function matchTypeValue(typeLabel, promotionTypes) {
  const norm = (s) => String(s ?? "").toLowerCase().replace(/[_\s]+/g, " ").trim();
  const target = norm(typeLabel);
  const found = promotionTypes.find((t) => norm(t.label) === target);
  return found ? String(found.value) : "";
}

// Flatten get-by-station groups into editable promotion rows.
function hydratePromotions(response, promotionTypes) {
  const groups = normalizeListResponse(response);
  const rows = [];
  for (const group of groups) {
    const promos = Array.isArray(group?.promotions) ? group.promotions : Array.isArray(group?.promotion) ? group.promotion : [];
    for (const promo of promos) {
      rows.push({
        promotion_type: matchTypeValue(group?.type, promotionTypes),
        item_uuid: typeof promo?.item === "string" && UUID_RE.test(promo.item) ? promo.item : "",
        promotion_code: String(promo?.code ?? ""),
      });
    }
  }
  return rows;
}

export default function AddPromotionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStation = searchParams.get("station") || "";

  const [stationId, setStationId] = useState(initialStation);
  const [stations, setStations] = useState([]);
  const [stationsError, setStationsError] = useState(false);

  const [promotionTypes, setPromotionTypes] = useState([]);
  const [typesError, setTypesError] = useState(false);

  const [items, setItems] = useState([]);
  const [itemsError, setItemsError] = useState(false);

  const [promotions, setPromotions] = useState([emptyPromotion()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStationList()
      .then((res) => {
        const results = normalizeListResponse(res);
        setStations(results);
        setStationsError(false);
        if (!stationId && results.length > 0) setStationId(results[0].uuid);
      })
      .catch(() => {
        setStations([]);
        setStationsError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAvailablePromotions()
      .then((res) => {
        setPromotionTypes(normalizeListResponse(res));
        setTypesError(false);
      })
      .catch(() => {
        setPromotionTypes([]);
        setTypesError(true);
      });
  }, []);

  // The <select> visually shows the first option as selected before the user
  // touches it, but the controlled value stays "" until onChange fires. Seed
  // any unset promotion_type with the first loaded type so what's shown
  // matches what gets submitted.
  useEffect(() => {
    if (promotionTypes.length === 0) return;
    const firstValue = String(promotionTypes[0].value);
    setPromotions((prev) =>
      prev.map((p) => (p.promotion_type === "" ? { ...p, promotion_type: firstValue } : p))
    );
  }, [promotionTypes]);

  useEffect(() => {
    getRedemptionItems()
      .then((res) => {
        setItems(normalizeListResponse(res));
        setItemsError(false);
      })
      .catch(() => {
        setItems([]);
        setItemsError(true);
      });
  }, []);

  // POST replaces the full set of promotions for the station, so hydrate the
  // form with the station's existing promotions once we know the station and
  // have the type list (needed to map type labels back to values).
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!stationId || promotionTypes.length === 0) return;
    hydratedRef.current = true;
    getPromotionsByStation(stationId)
      .then((res) => {
        const rows = hydratePromotions(res, promotionTypes);
        if (rows.length > 0) setPromotions(rows);
      })
      .catch((err) => console.error("[promotions-add] hydrate failed", err));
  }, [stationId, promotionTypes]);

  const updatePromotion = (index, key) => (value) => {
    setPromotions((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  };

  const addPromotionRow = () => setPromotions((prev) => [...prev, emptyPromotion()]);

  const removePromotionRow = (index) =>
    setPromotions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stationId) {
      alert("Cannot save: please select a station.");
      return;
    }
    if (promotions.length === 0) {
      alert("Cannot save: please add at least one promotion.");
      return;
    }
    for (const p of promotions) {
      if (p.promotion_type === "") {
        alert("Cannot save: please select a promotion type for every entry.");
        return;
      }
      if (p.promotion_code.trim() === "" || !/^-?\d+$/.test(p.promotion_code.trim())) {
        alert("Cannot save: promotion code must be a whole number for every entry.");
        return;
      }
    }

    setSaving(true);
    try {
      await createPromotion({
        station_id: stationId,
        promotions: promotions.map((p) => ({
          promotion_type: Number(p.promotion_type),
          ...(p.item_uuid ? { item_uuid: p.item_uuid } : {}),
          promotion_code: parseInt(p.promotion_code.trim(), 10),
        })),
      });
      router.push("/admin/settings/promotions");
    } catch (err) {
      console.error("[promotions-add] save failed", err);
      alert("Failed to save promotion. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stationOptions = stations.map((s) => ({
    value: s.uuid,
    label: s.station_name || s.name || s.uuid,
  }));

  const typeOptions = promotionTypes.map((t) => ({
    value: String(t.value),
    label: t.label,
  }));

  const itemOptions = items.map((i) => ({
    value: i.uuid,
    label: i.name || i.title || i.uuid,
  }));

  return (
    <>
      <PageHeader />
      <form onSubmit={handleSubmit} className="flex w-full flex-col">
        <div
          className="flex w-full flex-col gap-6 rounded-[16px] bg-[#05060a] p-6 md:p-10"
          style={{ filter: "drop-shadow(0 0 1.5px #dea220)" }}
        >
          <SectionTitle>Promotion Info</SectionTitle>
          <p className="-mt-4 text-[12px] text-white/40">
            Saving replaces all promotions for this station, so existing entries are loaded below — edit, remove, or add rows, then Save.
          </p>

          <div className="grid w-full gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
            <SelectField
              label="Station"
              value={stationId}
              onChange={setStationId}
              options={stationOptions}
              placeholder={
                stationsError
                  ? "Failed to load stations"
                  : stations.length === 0
                    ? "Loading..."
                    : "Select station"
              }
            />
          </div>

          <div className="flex flex-col gap-4">
            {promotions.map((promo, index) => (
              <PromotionEntry
                key={index}
                index={index}
                promo={promo}
                typeOptions={typeOptions}
                typesError={typesError}
                itemOptions={itemOptions}
                itemsError={itemsError}
                onChange={updatePromotion}
                onRemove={promotions.length > 1 ? () => removePromotionRow(index) : null}
              />
            ))}
            <AddRowButton onClick={addPromotionRow} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
            <BackButton />
            <SaveButton disabled={saving} />
          </div>
        </div>
      </form>
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
          Manage Promotions
        </h1>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      className="bg-clip-text text-transparent font-bold whitespace-nowrap"
      style={{
        backgroundImage: GRAD_GOLD,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: "26px",
        lineHeight: "39px",
        letterSpacing: "-2px",
      }}
    >
      {children}
    </h2>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[18px] font-medium leading-[27px] text-[#f6dda6] whitespace-nowrap"
    >
      {children}
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-[12px] font-medium leading-[18px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, allowEmpty = false, emptyLabel = "" }) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[8px] border border-[#fbeed2] bg-[#05060a] px-4 py-3 text-[12px] font-medium leading-[18px] text-white focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      >
        {options.length === 0 && <option value="">{placeholder}</option>}
        {options.length > 0 && allowEmpty && <option value="">{emptyLabel}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PromotionEntry({ index, promo, typeOptions, typesError, itemOptions, itemsError, onChange, onRemove }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[12px] border border-[#fbeed2]/20 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold text-[#f6dda6]">Promotion {index + 1}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[12px] font-medium text-[#d00416] hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid w-full gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
        <SelectField
          label="Promotion Type"
          value={promo.promotion_type}
          onChange={onChange(index, "promotion_type")}
          options={typeOptions}
          placeholder={
            typesError
              ? "Failed to load types"
              : typeOptions.length === 0
                ? "Loading..."
                : "Select type"
          }
        />
        <TextField
          label="Promotion Code"
          value={promo.promotion_code}
          onChange={onChange(index, "promotion_code")}
          placeholder="e.g. 1001"
        />
        <SelectField
          label="Item (optional)"
          value={promo.item_uuid}
          onChange={onChange(index, "item_uuid")}
          options={itemOptions}
          allowEmpty
          emptyLabel="No item"
          placeholder={
            itemsError
              ? "Failed to load items"
              : itemOptions.length === 0
                ? "Loading..."
                : "Select item"
          }
        />
      </div>
    </div>
  );
}

function AddRowButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-semibold text-[#f6dda6] transition hover:bg-[#f2cb7a]/10"
      style={{ letterSpacing: "-1px" }}
    >
      <PlusIcon />
      <span>Add Another Promotion</span>
    </button>
  );
}

function BackButton() {
  return (
    <Link
      href="/admin/settings/promotions"
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:brightness-110"
      style={{ letterSpacing: "-1px" }}
    >
      <ArrowLeftIcon />
      <span>Back</span>
    </Link>
  );
}

function SaveButton({ disabled = false }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <CheckIcon />
      <span>Save</span>
    </button>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
