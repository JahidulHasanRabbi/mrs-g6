"use client";

import { useState } from "react";
import SpinItemsTable, { SPIN_ITEMS_DATA } from "./SpinItemsTable";
import SpinSequenceTable from "./SpinSequenceTable";
import SpinItemModal from "./SpinItemModal";
import SpinSequenceModal from "./SpinSequenceModal";

export default function SpinTablesContainer() {
  const [activeTab, setActiveTab] = useState("items"); // "items" or "sequence"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [spinItems, setSpinItems] = useState(SPIN_ITEMS_DATA);

  const handleTabToggle = () => {
    setActiveTab(prev => prev === "items" ? "sequence" : "items");
  };

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    const ok = window.confirm("Are you sure you want to delete this item?");
    if (!ok) return;
    setSpinItems((prev) => prev.filter((x) => x.id !== item.id));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-bold text-white font-['Times_New_Roman']">
            {activeTab === "items" ? "Spin Items Panel Table" : "Spin Sequence Table"}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleTabToggle}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "sequence"
                  ? "border-[0.5px] border-[#f2c36b]"
                  : "border border-[#e9af41]/30 bg-[#e9af41]/10 text-[#e9af41] hover:bg-[#e9af41]/20"
              }`}
              style={
                activeTab === "sequence"
                  ? {
                      backgroundImage: "linear-gradient(0.6987979417932735deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
                    }
                  : {}
              }
            >
              <span className={activeTab === "sequence" ? "text-black font-bold" : ""}>
                Spin Sequence Setting
              </span>
            </button>
            <button 
              onClick={handleAddClick}
              className="rounded-lg px-4 py-2 text-sm font-bold transition-colors"
              style={{
                backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
              }}
            >
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Add
              </span>
            </button>
          </div>
        </div>

        {/* Conditional Table Rendering */}
        {activeTab === "items" ? (
          <SpinItemsTable
            items={spinItems}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <SpinSequenceTable onEditClick={handleEditClick} />
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
              ‹
            </button>
            <div className="flex items-center gap-1 px-2 text-sm text-white/70">
              <span className="font-bold text-white">27</span>
              <span>/</span>
              <span>38</span>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeTab === "items" ? (
        <SpinItemModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          initialData={selectedItem}
        />
      ) : (
        <SpinSequenceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          initialData={selectedItem}
        />
      )}
    </>
  );
}
