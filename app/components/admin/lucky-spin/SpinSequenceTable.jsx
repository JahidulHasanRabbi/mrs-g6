"use client";

import { useState } from "react";
import SpinSequenceModal from "./SpinSequenceModal";

export default function SpinSequenceTable({ 
  sequences = [], 
  spinItems = [],
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  isLoading = false 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedSequence, setSelectedSequence] = useState(null);

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedSequence(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (sequence) => {
    setModalMode("edit");
    setSelectedSequence(sequence);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (sequence) => {
    const ok = window.confirm(`Are you sure you want to delete sequence at position ${sequence.item_order}?`);
    if (ok) {
      await onDelete(sequence);
    }
  };

  const handleMoveUp = async (sequence, index) => {
    if (index === 0) return;
    const prevSequence = sequences[index - 1];
    
    // Swap item_order values
    await onReorder([
      { item_order: prevSequence.item_order, sequence_UUID: sequence.uuid },
      { item_order: sequence.item_order, sequence_UUID: prevSequence.uuid }
    ]);
  };

  const handleMoveDown = async (sequence, index) => {
    if (index === sequences.length - 1) return;
    const nextSequence = sequences[index + 1];
    
    // Swap item_order values
    await onReorder([
      { item_order: nextSequence.item_order, sequence_UUID: sequence.uuid },
      { item_order: sequence.item_order, sequence_UUID: nextSequence.uuid }
    ]);
  };

  const handleModalSubmit = async (formData) => {
    if (modalMode === "add") {
      await onAdd(formData);
    } else {
      await onEdit(selectedSequence.uuid, formData);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSequence(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Add Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAddClick}
            disabled={isLoading}
            className="inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-sm font-bold leading-none text-black transition-colors disabled:opacity-50"
            style={{
              backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
            }}
          >
            Add Sequence
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-sm font-bold text-white/60">
                  Item Order
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-white/60">
                  Item Name
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-white/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-white/60">
                    Loading...
                  </td>
                </tr>
              ) : sequences.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-white/60">
                    No sequences configured. Click "Add Sequence" to create one.
                  </td>
                </tr>
              ) : (
                sequences.map((sequence, index) => (
                  <tr key={sequence.uuid} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white">
                      {sequence.item_order}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {sequence.item_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Move Up */}
                        <button
                          onClick={() => handleMoveUp(sequence, index)}
                          disabled={index === 0 || isLoading}
                          className="p-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 4L4 8H12L8 4Z" fill="currentColor"/>
                          </svg>
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => handleMoveDown(sequence, index)}
                          disabled={index === sequences.length - 1 || isLoading}
                          className="p-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 12L12 8H4L8 12Z" fill="currentColor"/>
                          </svg>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEditClick(sequence)}
                          disabled={isLoading}
                          className="p-2 text-[#e9af41] hover:text-[#f2c36b] disabled:opacity-50"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteClick(sequence)}
                          disabled={isLoading}
                          className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <SpinSequenceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        initialData={selectedSequence}
        spinItems={spinItems}
        existingOrders={sequences.map(s => s.item_order)}
        isLoading={isLoading}
      />
    </>
  );
}
