"use client";

// Hero Item screen (Figma 2026:3162): equipped slot row, backpack grid with
// MANAGE multi-select, and the drag-to-discard zone. Interactions:
//   - tap a backpack item        → equip it (swaps whatever's in the slot)
//   - tap an equipped slot chip  → unequip back into the bag
//   - drag an item onto the zone → confirm → discard (−10 Tokens each)
//   - MANAGE                     → multi-select + discard via the same zone
//     (the accessible fallback for touch scrolling vs drag conflicts)

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, EQUIP_SLOTS, DISCARD_COST } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { SlotChip } from "../primitives";
import NoticeModal from "../NoticeModal";

export default function HeroItem({ equipment, onEquipmentUpdate }) {
  const [manageMode, setManageMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmIds, setConfirmIds] = useState(null); // items pending discard confirm
  const [notice, setNotice] = useState(null); // { title, message }
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const zoneRef = useRef(null);

  const backpack = equipment?.backpack || [];
  const capacity = equipment?.capacity ?? 100;
  const slots = equipment?.slots || {};
  // Grid keeps at least 3 rows of cells like the design's empty state.
  const cellCount = Math.max(12, Math.ceil(backpack.length / 4) * 4);

  const failNotice = (err, fallback) =>
    setNotice({ title: "OOPS", message: err?.message || fallback });

  const handleEquip = async (item) => {
    if (busy) return;
    setBusy(true);
    try {
      onEquipmentUpdate(await rpgApi.equipItem(item.id));
    } catch (err) {
      failNotice(err, "Could not equip that item.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnequip = async (slot) => {
    if (busy || !slots[slot]) return;
    setBusy(true);
    try {
      onEquipmentUpdate(await rpgApi.unequipItem(slot));
    } catch (err) {
      failNotice(err, "Could not unequip that item.");
    } finally {
      setBusy(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirmIds?.length) return;
    setBusy(true);
    try {
      onEquipmentUpdate(await rpgApi.discardItems(confirmIds));
      setSelected([]);
      setManageMode(false);
    } catch (err) {
      failNotice(err, "Could not discard.");
    } finally {
      setBusy(false);
      setConfirmIds(null);
    }
  };

  const toggleSelected = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Pointer-position hit test against the discard zone at drag end.
  const overZone = (point) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    return Boolean(
      rect && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom,
    );
  };

  return (
    <div className="flex w-full flex-1 flex-col px-[18px]">
      <h2
        className="pt-[22px] pb-[4px] text-center text-[22px] font-bold tracking-[5px]"
        style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display, textShadow: "0 0 24px rgba(124,77,255,0.8)" }}
      >
        HERO ITEM
      </h2>

      {/* Equipped slots */}
      <div className="mt-[14px] flex w-full items-stretch justify-center gap-[10px]">
        {EQUIP_SLOTS.map((slot) => (
          <SlotChip key={slot} slot={slot} item={slots[slot]} onClick={() => handleUnequip(slot)} />
        ))}
      </div>

      {/* Backpack header */}
      <div className="flex items-center justify-between pb-[10px] pt-[24px]">
        <span className="text-[18px] font-bold tracking-[4px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}>
          BACKPACK
        </span>
        <div className="flex items-center gap-[10px]">
          <span className="text-[12px] font-semibold" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.number }}>
            {backpack.length} / {capacity}
          </span>
          <button
            type="button"
            onClick={() => {
              setManageMode((m) => !m);
              setSelected([]);
            }}
            className="rounded-[8px] border px-[13px] py-[7px] text-[11px] font-bold tracking-[1px] active:scale-95 transition-transform"
            style={{
              borderColor: manageMode ? RPG_COLORS.gold : "rgba(47,230,200,0.6)",
              color: manageMode ? RPG_COLORS.gold : RPG_COLORS.cyan,
              fontFamily: RPG_FONTS.display,
              background: manageMode ? "rgba(255,201,77,0.08)" : "transparent",
            }}
          >
            {manageMode ? "DONE" : "MANAGE"}
          </button>
        </div>
      </div>

      {/* Backpack grid */}
      <div className="grid grid-cols-4 gap-[10px] pt-[4px]">
        {Array.from({ length: cellCount }, (_, i) => {
          const item = backpack[i];
          if (!item) {
            return (
              <div
                key={`empty-${i}`}
                className="aspect-square rounded-[12px] border border-dashed"
                style={{ borderColor: "rgba(255,255,255,0.3)" }}
              />
            );
          }
          const isSelected = selected.includes(item.id);
          return (
            <motion.button
              key={item.id}
              type="button"
              drag={!manageMode}
              dragSnapToOrigin
              dragElastic={0.2}
              dragMomentum={false}
              whileDrag={{ scale: 1.12, zIndex: 40, opacity: 0.9 }}
              onDragStart={() => setDragOver(false)}
              onDrag={(e, info) => setDragOver(overZone(info.point))}
              onDragEnd={(e, info) => {
                setDragOver(false);
                if (overZone(info.point)) setConfirmIds([item.id]);
              }}
              onClick={() => (manageMode ? toggleSelected(item.id) : handleEquip(item))}
              className="relative flex aspect-square touch-none flex-col items-center justify-center gap-[4px] rounded-[12px] border"
              style={{
                background: isSelected ? "rgba(255,92,138,0.12)" : "rgba(255,255,255,0.04)",
                borderColor: isSelected ? "rgba(255,92,138,0.7)" : RPG_COLORS.violetBorderStrong,
              }}
            >
              <img src={RPG_IMAGES.equipmentArt[item.slot]} alt="" className="size-[34px] object-contain" />
              <span
                className="max-w-full truncate px-[4px] text-[8px] tracking-[0.5px]"
                style={{ color: RPG_COLORS.slotLabel, fontFamily: RPG_FONTS.display }}
              >
                {item.name}
              </span>
              {isSelected ? (
                <span
                  className="absolute right-[5px] top-[5px] grid size-[14px] place-items-center rounded-full text-[9px] font-bold"
                  style={{ background: "#ff5c8a", color: "#fff" }}
                >
                  ✓
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {/* Discard zone */}
      <div className="pt-[16px]">
        <button
          ref={zoneRef}
          type="button"
          disabled={!manageMode || selected.length === 0}
          onClick={() => manageMode && selected.length && setConfirmIds(selected)}
          className="flex w-full items-center justify-center gap-[10px] rounded-[14px] border border-dashed p-[17px] transition-colors"
          style={{
            borderColor: dragOver ? "#ff5c8a" : "rgba(255,92,138,0.5)",
            background: dragOver ? "rgba(255,92,138,0.12)" : "transparent",
          }}
        >
          <img src="/assets/rpg/icons/trash.svg" alt="" className="size-[18px]" />
          <span className="text-[11px] font-semibold tracking-[2px]" style={{ color: "#ff8faf", fontFamily: RPG_FONTS.display }}>
            {manageMode && selected.length
              ? `DISCARD ${selected.length} SELECTED · −${selected.length * DISCARD_COST} TOKENS`
              : "DRAG ITEM HERE TO DISCARD"}
          </span>
        </button>
      </div>

      <NoticeModal
        open={Boolean(confirmIds)}
        title="DISCARD EQUIPMENT?"
        message={`Discarding costs ${DISCARD_COST} Tokens per item (${(confirmIds?.length || 0) * DISCARD_COST} Tokens total). This cannot be undone.`}
        confirmLabel="DISCARD"
        cancelLabel="KEEP IT"
        busy={busy}
        onConfirm={handleDiscard}
        onClose={() => setConfirmIds(null)}
      />
      <NoticeModal
        open={Boolean(notice)}
        title={notice?.title || ""}
        message={notice?.message}
        confirmLabel="OK"
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
