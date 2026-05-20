"use client";

import { useState, useEffect } from "react";
import SpinItemsTable from "./SpinItemsTable";
import SpinSequenceTable from "./SpinSequenceTable";
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
      // Also load spin items for the dropdown in sequence modal
      if (spinItems.length === 0) {
        loadSpinItems();
      }
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
      const response = await adminApi.getLuckySpinSequences();
      // Handle paginated response
      const sequences = Array.isArray(response) ? response : (response?.results || []);
      // Sort by item_order
      sequences.sort((a, b) => a.item_order - b.item_order);
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

  const handleSequenceAdd = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await adminApi.createLuckySpinSequence(formData.item_order, formData.item_uuid);
      await loadSpinSequences();
    } catch (err) {
      console.error('Failed to add sequence:', err);
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSequenceEdit = async (uuid, formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // API doesn't have PUT for sequences, so delete and recreate
      await adminApi.deleteLuckySpinSequence(uuid);
      await adminApi.createLuckySpinSequence(formData.item_order, formData.item_uuid);
      await loadSpinSequences();
    } catch (err) {
      console.error('Failed to edit sequence:', err);
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSequenceDelete = async (sequence) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await adminApi.deleteLuckySpinSequence(sequence.uuid);
      await loadSpinSequences();
    } catch (err) {
      console.error('Failed to delete sequence:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSequenceReorder = async (luckySpins) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Reordering sequences with payload:', luckySpins);
      await adminApi.changeSpinSequencesOrder(luckySpins);
      await loadSpinSequences();
    } catch (err) {
      console.error('Failed to reorder sequences:', err);
      console.error('Error details:', err.data);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      // Extract detailed error message
      let errorMessage = 'Unknown error';
      if (err.data) {
        if (err.data.details) {
          errorMessage = JSON.stringify(err.data.details);
        } else if (err.data.error) {
          errorMessage = err.data.error;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show user-friendly error message
      alert(`Failed to reorder sequences: ${errorMessage}`);
      
      // Don't set error state to avoid React rendering issues
      // setError(err);
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
          <h2 className="text-xl font-bold text-white">
            {activeTab === "items" ? "Spin Items Panel Table" : "Spin Sequence Table"}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleTabToggle}
              className={`inline-flex min-w-[172px] items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-center text-sm font-bold leading-none transition-colors ${
                activeTab === "sequence"
                  ? "border-[0.5px] border-[#f2c36b] text-black"
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
              Spin Sequence Setting
            </button>
            {activeTab === "items" && (
              <button 
                onClick={handleAddClick}
                className="inline-flex min-w-[72px] items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-center text-sm font-bold leading-none text-black transition-colors disabled:opacity-50"
                style={{
                  backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
                }}
                disabled={isLoading}
              >
                Add
              </button>
            )}
          </div>
        </div>

        {/* Loading State or Conditional Table Rendering */}
        {activeTab === "items" ? (
          <SpinItemsTable
            items={spinItems}
            isLoading={isLoading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <div className="p-6">
            <SpinSequenceTable
              sequences={spinSequences}
              spinItems={spinItems}
              onAdd={handleSequenceAdd}
              onEdit={handleSequenceEdit}
              onDelete={handleSequenceDelete}
              onReorder={handleSequenceReorder}
              isLoading={isLoading || isSubmitting}
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
