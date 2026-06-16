"use client";

import { useState } from "react";
import { getOptionLabel } from "../../../api/apiOptions";
import { DataTable } from "../members/DataTable";

const COLUMNS = [
  { key: "reward_name", label: "Reward Name", minW: "min-w-[180px]" },
  { key: "quantity",    label: "Quantity",    minW: "min-w-[110px]" },
  { key: "item_type",   label: "Item Type",   minW: "min-w-[140px]" },
  { key: "image",       label: "Image",       minW: "min-w-[80px]" },
  { key: "actions",     label: "Actions",     minW: "min-w-[180px]" },
];

export default function SpinItemsTable({
  items = [],
  isLoading = false,
  canEdit = true,
  canArchive = true,
  onEditClick,
  onDeleteClick,
}) {
  const [sortKey, setSortKey] = useState("reward_name");
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (key === "image" || key === "actions") return; // not sortable
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === "quantity") {
      av = a.unlimited ? Infinity : Number(a.quantity ?? 0);
      bv = b.unlimited ? Infinity : Number(b.quantity ?? 0);
    } else if (sortKey === "item_type") {
      av = getOptionLabel("ITEM_TYPE", a.item_type) ?? "";
      bv = getOptionLabel("ITEM_TYPE", b.item_type) ?? "";
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const renderCell = (item, col) => {
    if (col.key === "reward_name") {
      // Long reward names would otherwise stretch the column (cells are
      // nowrap). Cap the width and ellipsize; the full name shows on hover.
      return (
        <span className="block max-w-[260px] truncate" title={item.reward_name}>
          {item.reward_name}
        </span>
      );
    }
    if (col.key === "quantity") return item.unlimited ? "Unlimited" : item.quantity;
    if (col.key === "item_type") return getOptionLabel("ITEM_TYPE", item.item_type);
    if (col.key === "image") {
      return item.image ? (
        <img src={item.image} alt={item.reward_name} className="h-10 w-10 object-contain" />
      ) : (
        <span className="text-white/40">No image</span>
      );
    }
    if (col.key === "actions") {
      return (
        <div className="flex items-center justify-center gap-2">
          {canArchive && (
            <button
              type="button"
              onClick={() => onDeleteClick?.(item)}
              className="inline-flex h-[31px] min-w-[78px] items-center justify-center rounded-[6px] bg-[#06b800] px-3 text-[14px] font-bold text-white transition-colors hover:bg-[#05a000]"
            >
              Archive
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => onEditClick(item)}
              className="inline-flex h-[31px] min-w-[70px] items-center justify-center rounded-[6px] border border-[#00a63e] px-3 text-[14px] font-semibold text-[#00a63e] transition-colors hover:bg-[#00a63e]/10"
            >
              Edit
            </button>
          )}
        </div>
      );
    }
    return item[col.key];
  };

  return (
    <DataTable
      columns={COLUMNS}
      rows={sortedItems}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
      renderCell={renderCell}
      isLoading={isLoading}
      emptyMessage="No spin items found."
    />
  );
}
