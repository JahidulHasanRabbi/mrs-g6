"use client";

import { useState } from "react";
import { getOptionLabel } from "../../../api/apiOptions";
import { DataTable } from "../members/DataTable";
import Button from "../ui/Button";

const COLUMNS = [
  { key: "reward_name", label: "Reward Name", minW: "min-w-[180px]" },
  { key: "quantity",    label: "Quantity",    minW: "min-w-[110px]" },
  { key: "item_type",   label: "Item Type",   minW: "min-w-[140px]" },
  { key: "image",       label: "Image",       minW: "min-w-[80px]" },
  { key: "actions",     label: "Actions",     minW: "min-w-[180px]" },
];

export default function SpinItemsTable({ items = [], isLoading = false, onEditClick, onDeleteClick }) {
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
        <div className="flex items-center gap-2">
          <Button variant="success" size="sm" onClick={() => onEditClick(item)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDeleteClick?.(item)}>
            Archive
          </Button>
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
