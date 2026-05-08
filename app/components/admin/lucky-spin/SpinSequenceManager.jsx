"use client";

import { useState, useEffect } from "react";
import ErrorDisplay from "../../ui/ErrorDisplay";

export default function SpinSequenceManager({ 
  sequences = [],
  spinItems = [],
  onSave,
  isLoading = false,
  error = null
}) {
  // Initialize 8 positions
  const [positions, setPositions] = useState(
    Array(8).fill(null).map((_, index) => ({
      position: index + 1,
      item_uuid: "",
      sequence_uuid: null // Track existing sequence UUID for updates
    }))
  );

  // Load existing sequences into positions
  useEffect(() => {
    if (sequences.length > 0) {
      const newPositions = Array(8).fill(null).map((_, index) => {
        const position = index + 1;
        const existingSequence = sequences.find(seq => seq.item_order === position);
        
        return {
          position,
          item_uuid: existingSequence?.item_uuid || "",
          sequence_uuid: existingSequence?.uuid || null
        };
      });
      
      setPositions(newPositions);
    }
  }, [sequences]);

  const handleItemChange = (position, itemUuid) => {
    setPositions(prev => prev.map(pos => 
      pos.position === position 
        ? { ...pos, item_uuid: itemUuid }
        : pos
    ));
  };

  const handleSave = async () => {
    // Get only filled positions
    const filledPositions = positions.filter(pos => pos.item_uuid);
    
    if (filledPositions.length === 0) {
      alert('Please select at least one item for the wheel.');
      return;
    }

    // Pass only filled positions to parent for saving
    await onSave(filledPositions);
  };

  const getItemName = (itemUuid) => {
    const item = spinItems.find(i => i.uuid === itemUuid);
    return item ? item.reward_name : '';
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="mb-4">
          <ErrorDisplay error={error} />
        </div>
      )}

      {/* Instructions */}
      <div className="bg-[#e9af41]/10 border border-[#e9af41]/30 rounded-lg p-4">
        <p className="text-white/80 text-sm">
          Configure the lucky spin wheel positions (1-8). You can fill as many or as few positions as you want.
          Empty positions will not appear on the wheel. The same item can appear in multiple positions.
        </p>
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positions.map((pos) => (
          <div 
            key={pos.position}
            className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Times_New_Roman']">
                Position {pos.position}
              </h3>
              {pos.sequence_uuid && (
                <span className="text-xs text-[#06b800] bg-[#06b800]/10 px-2 py-1 rounded">
                  Configured
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 font-['Times_New_Roman']">
                Select Item:
              </label>
              <select
                value={pos.item_uuid}
                onChange={(e) => handleItemChange(pos.position, e.target.value)}
                className="w-full bg-white/10 border border-white/20 h-[40px] rounded-[4px] px-3 text-white focus:outline-none focus:border-[#f2c36b]"
                disabled={isLoading}
                style={{ colorScheme: 'dark' }}
              >
                <option value="">-- Leave empty --</option>
                {spinItems.map(item => (
                  <option key={item.uuid} value={item.uuid}>
                    {item.reward_name}
                  </option>
                ))}
              </select>
            </div>

            {pos.item_uuid ? (
              <div className="text-xs text-white/40 font-['Times_New_Roman']">
                Selected: {getItemName(pos.item_uuid)}
              </div>
            ) : (
              <div className="text-xs text-white/30 font-['Times_New_Roman'] italic">
                Empty - will not appear on wheel
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex min-w-[164px] items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 font-['Times_New_Roman'] text-sm font-bold leading-none text-black transition-colors disabled:opacity-50"
          style={{
            backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
          }}
        >
          {isLoading ? 'Saving...' : 'Save All Positions'}
        </button>
      </div>
    </div>
  );
}
