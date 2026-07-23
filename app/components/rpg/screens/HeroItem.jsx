"use client";

// Hero Item screen (Figma 2026:3162): equipped slot row, backpack grid with
// MANAGE multi-select, and the drag-to-discard zone. Interactions:
//   - tap a backpack item        → equip it (swaps whatever's in the slot)
//   - drag a backpack item ↑ onto the slot row → equip it
//   - tap an equipped slot chip  → unequip back into the bag
//   - drag an equipped slot ↓ onto the backpack → unequip it
//   - drag an item onto the zone → confirm → discard (−10 Tokens each)
//   - MANAGE                     → multi-select + discard via the same zone
//     (the accessible fallback for touch scrolling vs drag conflicts)

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, EQUIP_SLOTS, DISCARD_COST } from "../constants";
import { RPG_IMAGES, heroPoseFor } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { SlotChip, HeroShowcase } from "../primitives";
import NoticeModal from "../NoticeModal";

export default function HeroItem({ profile, equipment, onEquipmentUpdate }) {
  const [manageMode, setManageMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmIds, setConfirmIds] = useState(null); // items pending discard confirm
  const [notice, setNotice] = useState(null); // { title, message }
  const [busy, setBusy] = useState(false);
  // Which drop target the currently-dragged item is hovering: for highlights.
  const [dropTarget, setDropTarget] = useState(null); // 'discard' | 'slots' | 'backpack'
  const zoneRef = useRef(null);
  const slotsRef = useRef(null);
  const backpackRef = useRef(null);
  // True while a real drag is in progress, so the click that fires after a drag
  // doesn't ALSO run the tap action (which would equip a second time → error).
  const draggedRef = useRef(false);

  const backpack = equipment?.backpack || [];
  const capacity = equipment?.capacity ?? 100;
  const slots = equipment?.slots || {};
  // Discard price comes from the live game settings (/avatar/settings/).
  const discardCost = equipment?.profile?.discardCost ?? DISCARD_COST;
  // Live hero preview (client feedback: equipping must visibly change the
  // avatar). Pose + aura react instantly to every equip/unequip below.
  const gender = profile?.gender || "male";
  const heroPose = heroPoseFor(gender, equipment);
  const equippedCount = EQUIP_SLOTS.filter((slot) => slots[slot]).length;
  const power = equipment?.profile?.power ?? profile?.power ?? 0;
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
      // A batch can fail partway (tokens run out) — resync so the grid never
      // keeps showing items the server already deleted.
      rpgApi.getEquipment().then(onEquipmentUpdate).catch(() => {});
      setSelected([]);
    } finally {
      setBusy(false);
      setConfirmIds(null);
    }
  };

  const toggleSelected = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Drop-zone rects are measured once per drag (touch-none means the page
  // can't scroll mid-drag, so they stay valid) instead of on every frame.
  const rectsRef = useRef({});
  const dropTargetRef = useRef(null);

  const captureRects = () => {
    rectsRef.current = {
      discard: zoneRef.current?.getBoundingClientRect(),
      slots: slotsRef.current?.getBoundingClientRect(),
      backpack: backpackRef.current?.getBoundingClientRect(),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  };

  // info.point is in page coordinates; the cached rects are viewport-relative.
  const hitZone = (name, point) => {
    const { [name]: r, scrollX, scrollY } = rectsRef.current;
    if (!r) return false;
    const x = point.x - scrollX;
    const y = point.y - scrollY;
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  // Only touch React state when the hovered zone actually changes, so a drag
  // doesn't re-render the whole screen on every pointer move.
  const updateDropTarget = (next) => {
    if (dropTargetRef.current === next) return;
    dropTargetRef.current = next;
    setDropTarget(next);
  };

  return (
    <div className="flex w-full flex-1 flex-col px-[18px]">
      <h2
        className="pt-[22px] pb-[4px] text-center text-[22px] font-bold tracking-[5px]"
        style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display, textShadow: "0 0 24px rgba(124,77,255,0.8)" }}
      >
        HERO ITEM
      </h2>

      {/* Hero preview — wears the equipped gear live, aura scales with the
          number of equipped pieces, POWER pops on every change. */}
      <HeroShowcase
        pose={heroPose}
        equippedCount={equippedCount}
        heightClass="h-[min(210px,26vh)]"
        className="mt-[6px] w-full"
      />
      <div className="flex items-center justify-center gap-[10px] pt-[8px]">
        <span
          className="text-[11px] font-semibold tracking-[3px]"
          style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
        >
          POWER
        </span>
        <motion.span
          key={power}
          initial={{ scale: 1.35, textShadow: "0 0 28px rgba(255,201,77,0.95)" }}
          animate={{ scale: 1, textShadow: "0 0 14px rgba(255,201,77,0.45)" }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className="text-[26px] font-bold leading-[28px]"
          style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.number }}
        >
          {Number(power).toLocaleString("en-GB")}
        </motion.span>
        <span
          className="rounded-full border px-[9px] py-[3px] text-[9px] font-bold tracking-[1px]"
          style={{
            borderColor: equippedCount ? "rgba(47,230,200,0.6)" : RPG_COLORS.violetBorderStrong,
            color: equippedCount ? RPG_COLORS.cyanSoft : RPG_COLORS.slotEmpty,
            fontFamily: RPG_FONTS.display,
          }}
        >
          {equippedCount}/{EQUIP_SLOTS.length} EQUIPPED
        </span>
      </div>

      {/* Equipped slots — drop a backpack item here to equip; drag a chip down
          to the backpack to unequip. */}
      <div
        ref={slotsRef}
        className="mt-[10px] flex w-full items-stretch justify-center gap-[10px] rounded-[16px] p-[6px] transition-colors"
        style={{
          background: dropTarget === "slots" ? "rgba(47,230,200,0.10)" : "transparent",
          outline: dropTarget === "slots" ? "2px dashed rgba(47,230,200,0.7)" : "2px dashed transparent",
        }}
      >
        {EQUIP_SLOTS.map((slot) => (
          <SlotChip
            key={slot}
            slot={slot}
            item={slots[slot]}
            draggable
            onClick={() => {
              if (draggedRef.current) {
                draggedRef.current = false;
                return;
              }
              handleUnequip(slot);
            }}
            onDragStart={() => {
              draggedRef.current = true;
              captureRects();
              updateDropTarget(null);
            }}
            onDrag={(e, info) => updateDropTarget(hitZone("backpack", info.point) ? "backpack" : null)}
            onDragEnd={(e, info) => {
              const drop = hitZone("backpack", info.point);
              updateDropTarget(null);
              if (drop) handleUnequip(slot);
            }}
          />
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

      {/* Backpack grid — drop an equipped chip here to unequip. */}
      <div
        ref={backpackRef}
        className="grid grid-cols-4 gap-[10px] rounded-[12px] pt-[4px] transition-colors"
        style={{
          outline: dropTarget === "backpack" ? "2px dashed rgba(47,230,200,0.7)" : "2px dashed transparent",
          outlineOffset: "4px",
        }}
      >
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
              dragMomentum={false}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 32 }}
              whileDrag={{ scale: 1.12, zIndex: 40, opacity: 0.9 }}
              onDragStart={() => {
                draggedRef.current = true;
                captureRects();
                updateDropTarget(null);
              }}
              onDrag={(e, info) => {
                if (hitZone("discard", info.point)) updateDropTarget("discard");
                else if (hitZone("slots", info.point)) updateDropTarget("slots");
                else updateDropTarget(null);
              }}
              onDragEnd={(e, info) => {
                const overDiscard = hitZone("discard", info.point);
                const overSlots = hitZone("slots", info.point);
                updateDropTarget(null);
                if (overDiscard) setConfirmIds([item.id]);
                else if (overSlots) handleEquip(item);
              }}
              onClick={() => {
                if (draggedRef.current) {
                  draggedRef.current = false;
                  return; // this "click" is the tail of a drag — ignore it
                }
                if (manageMode) toggleSelected(item.id);
                else handleEquip(item);
              }}
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
            borderColor: dropTarget === "discard" ? "#ff5c8a" : "rgba(255,92,138,0.5)",
            background: dropTarget === "discard" ? "rgba(255,92,138,0.12)" : "transparent",
          }}
        >
          <img src="/assets/rpg/icons/trash.svg" alt="" className="size-[18px]" />
          <span className="text-[11px] font-semibold tracking-[2px]" style={{ color: "#ff8faf", fontFamily: RPG_FONTS.display }}>
            {manageMode && selected.length
              ? `DISCARD ${selected.length} SELECTED · −${selected.length * discardCost} TOKENS`
              : "DRAG ITEM HERE TO DISCARD"}
          </span>
        </button>
      </div>

      <NoticeModal
        open={Boolean(confirmIds)}
        title="DISCARD EQUIPMENT?"
        message={`Discarding costs ${discardCost} Tokens per item (${(confirmIds?.length || 0) * discardCost} Tokens total). This cannot be undone.`}
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
