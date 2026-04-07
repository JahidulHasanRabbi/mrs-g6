"use client";

import { useState, useEffect } from "react";
import SpinItemsTable from "./SpinItemsTable";
import SpinSequenceManager from "./SpinSequenceManager";
import LuckySpinItemForm from "./LuckySpinItemForm";
import ErrorDisplay from "../../ui/ErrorDisplay";
import * as adminApi from "../../../api/adminApi";

export default function SpinTablesContainer() {
  const [activeTab, setActiveTab] = useState("items"); // "items" or "sequence"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [spinItems, setSpinItems] = useState([]);
  const [spinSequences, setSpinSequences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Load spin items on mount
  useEffect(() => {
    loadSpinItems();
  }, []);

  // Load sequences when switching to sequence tab
  useEffect(() => {
    if (activeTab === "sequence") {
      loadSpinSequences();
    }
  }, [activeTab]);

  const loadSpinItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await adminApi.getLuckySpinItems();
      setSpinItems(items);
    } catch (err) {
      console.error('Failed to load spin items:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpinSequences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sequences = await adminApi.getLuckySpinSequences();
      setSpinSequences(sequences);
    } catch (err) {
      console.error('Failed to load spin sequences:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabToggle = () => {
    setActiveTab(prev => prev === "items" ? "sequence" : "items");
  };

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedItem(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (item) => {
    const ok = window.confirm("Are you sure you want to archive this item?");
    if (!ok) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await adminApi.archiveLuckySpinItem(item.uuid);
      await loadSpinItems(); // Refresh list
    } catch (err) {
      console.error('Failed to archive spin item:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSequenceSave = async (filledPositions) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Delete all existing sequences first
      for (const seq of spinSequences) {
        await adminApi.deleteLuckySpinSequence(seq.uuid);
      }
      
      // Create new sequences only for filled positions
      for (const pos of filledPositions) {
        await adminApi.createLuckySpinSequence(pos.position, pos.item_uuid);
      }
      
      // Refresh sequences
      await loadSpinSequences();
      setFormError(null);
      
      alert(`Spin sequences saved successfully! ${filledPositions.length} position(s) configured.`);
    } catch (err) {
      console.error('Failed to save sequences:', err);
      setFormError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      if (activeTab === "items") {
        if (modalMode === "add") {
          await adminApi.createLuckySpinItem(formData);
        } else {
          await adminApi.updateLuckySpinItem(selectedItem.uuid, formData);
        }
        await loadSpinItems(); // Refresh list
      } else {
        // Sequence handling
        if (modalMode === "add") {
          await adminApi.createLuckySpinSequence(formData.item_order, formData.item_uuid);
        } else {
          // For edit, delete old and create new (API doesn't have update for sequences)
          await adminApi.deleteLuckySpinSequence(selectedItem.uuid);
          await adminApi.createLuckySpinSequence(formData.item_order, formData.item_uuid);
        }
        await loadSpinSequences(); // Refresh list
      }
      
      handleModalClose();
    } catch (err) {
      console.error('Failed to save:', err);
      setFormError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormError(null);
  };

  return (
    <>
      {/* Error Display for table operations */}
      {error && (
        <div className="mb-4">
          <ErrorDisplay error={error} />
        </div>
      )}

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
              disabled={isLoading}
            >
              <span className={activeTab === "sequence" ? "text-black font-bold" : ""}>
                Spin Sequence Setting
              </span>
            </button>
            {activeTab === "items" && (
              <button 
                onClick={handleAddClick}
                className="rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50"
                style={{
                  backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
                }}
                disabled={isLoading}
              >
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Add
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State or Conditional Table Rendering */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white/60">Loading...</div>
          </div>
        ) : activeTab === "items" ? (
          <SpinItemsTable
            items={spinItems}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <div className="p-6">
            <SpinSequenceManager
              sequences={spinSequences}
              spinItems={spinItems}
              onSave={handleSequenceSave}
              isLoading={isSubmitting}
              error={formError}
            />
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
              ‹
            </button>
            <div className="flex items-center gap-1 px-2 text-sm text-white/70">
              <span className="font-bold text-white">
                {activeTab === "items" ? spinItems.length : spinSequences.length}
              </span>
              <span>/</span>
              <span>
                {activeTab === "items" ? spinItems.length : spinSequences.length}
              </span>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Only for Items */}
      {activeTab === "items" && (
        <LuckySpinItemForm
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit}
          mode={modalMode}
          initialData={selectedItem}
          isLoading={isSubmitting}
          error={formError}
        />
      )}
    </>
  );
}
