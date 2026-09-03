"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import ErrorDisplay from "../../components/ui/ErrorDisplay";
import { LoadingState, LoadingButton } from "../../components/ui/LoadingState";
import Skeleton from "../../components/admin/ui/Skeleton";
import * as adminApi from "../../api/adminApi";

const SKELETON_COLUMNS = [
  { label: "Day",            type: "text" },
  { label: "KR Coin Reward",   type: "number" },
  { label: "BP Reward",      type: "number" },
  { label: "Display Text",   type: "text" },
  { label: "Actions",        type: "actions", count: 1 },
];

const FULL_SKELETON = (
  <Skeleton.TablePage columns={SKELETON_COLUMNS} rows={7} withFilters={false} titleWidth={260} />
);
const BARE_SKELETON = (
  <Skeleton.TablePage columns={SKELETON_COLUMNS} rows={7} withHeader={false} withFilters={false} bare />
);

export default function CheckinSettingsPage() {
  return (
    <AdminRouteGuard skeleton={FULL_SKELETON}>
      <CheckinSettingsContent />
    </AdminRouteGuard>
  );
}

function CheckinSettingsContent() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getCheckinSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load check-in settings:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDay = async (dayData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Update the specific day in the settings
      const updatedRewards = settings.rewards.map(reward => 
        reward.day === dayData.day ? dayData : reward
      );
      
      // If day doesn't exist, add it
      if (!settings.rewards.find(r => r.day === dayData.day)) {
        updatedRewards.push(dayData);
      }
      
      // Sort by day
      updatedRewards.sort((a, b) => a.day - b.day);
      
      // Send all day settings to API
      await adminApi.updateCheckinSettings(updatedRewards);
      
      setEditingDay(null);
      await loadSettings();
    } catch (err) {
      console.error('Failed to update check-in settings:', err);
      setError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getDayReward = (day) => {
    return settings?.rewards?.find(r => r.day === day) || {
      day,
      reward_minimum: 100,
      reward_maximum: 100,
      battle_point_minimum: 0,
      battle_point_maximum: 0,
      display_text: ''
    };
  };

  return (
    <main className="min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Check-In Settings
          </h1>
          <p className="mt-2 text-gray-400">
            Configure daily check-in rewards for members
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Edit Form Modal */}
        {editingDay && (
          <DayFormModal
            day={editingDay}
            onSubmit={handleUpdateDay}
            onClose={() => setEditingDay(null)}
            isSaving={isSaving}
          />
        )}

        {/* Settings Table */}
        <LoadingState isLoading={isLoading} skeleton={BARE_SKELETON}>
          <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Day</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">KR Coin Reward</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">BP Reward</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Display Text</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const dayReward = getDayReward(day);
                    const isSpecialDay = day === 7;
                    
                    return (
                      <tr 
                        key={day} 
                        className={`border-b border-white/5 hover:bg-white/5 ${
                          isSpecialDay ? 'bg-yellow-400/5' : ''
                        }`}
                      >
                        <td className="px-5 py-3 text-sm text-white">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Day {day}</span>
                            {isSpecialDay && (
                              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded">
                                SPECIAL
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-white">
                          {dayReward.reward_minimum}–{dayReward.reward_maximum} KR Coins
                        </td>
                        <td className="px-5 py-3 text-sm text-white">
                          {dayReward.battle_point_minimum ?? 0}–{dayReward.battle_point_maximum ?? 0} BP
                        </td>
                        <td className="px-5 py-3 text-sm text-white">
                          {dayReward.display_text || <span className="text-gray-500">Auto</span>}
                        </td>
                        <td className="px-5 py-3 text-sm">
                          <button
                            onClick={() => setEditingDay(dayReward)}
                            className="rounded px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
                            style={{ backgroundColor: 'rgba(233, 175, 65, 0.2)' }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </LoadingState>
    </main>
  );
}

function DayFormModal({ day, onSubmit, onClose, isSaving }) {
  const [formData, setFormData] = useState({
    day: day.day,
    reward_minimum: day.reward_minimum ?? 100,
    reward_maximum: day.reward_maximum ?? 100,
    battle_point_minimum: day.battle_point_minimum ?? 0,
    battle_point_maximum: day.battle_point_maximum ?? 0,
    display_text: day.display_text || ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_text' ? value : (value === '' ? '' : Number(value))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      formData.reward_minimum < 0 ||
      formData.reward_maximum < 0 ||
      formData.battle_point_minimum < 0 ||
      formData.battle_point_maximum < 0
    ) {
      setError({ message: 'Reward values must be positive' });
      return;
    }

    if (formData.reward_minimum > formData.reward_maximum) {
      setError({ message: 'Minimum reward cannot be greater than maximum reward' });
      return;
    }

    if (formData.battle_point_minimum > formData.battle_point_maximum) {
      setError({ message: 'Minimum BP cannot be greater than maximum BP' });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl border border-[rgba(255,255,132,0.2)] bg-[#07190d] p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Edit Day {formData.day} Rewards
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorDisplay error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Minimum KR Coins *
              </label>
              <input
                type="number"
                name="reward_minimum"
                value={formData.reward_minimum}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Maximum KR Coins *
              </label>
              <input
                type="number"
                name="reward_maximum"
                value={formData.reward_maximum}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Minimum BP *
              </label>
              <input
                type="number"
                name="battle_point_minimum"
                value={formData.battle_point_minimum}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Maximum BP *
              </label>
              <input
                type="number"
                name="battle_point_maximum"
                value={formData.battle_point_maximum}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Display Text (Optional)
            </label>
            <input
              type="text"
              name="display_text"
              value={formData.display_text}
              onChange={handleChange}
              placeholder="e.g., +100 or +100-200"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from min/max values
            </p>
          </div>

          <div className="rounded-lg border border-blue-400/20 bg-blue-900/10 p-3">
            <p className="text-xs text-gray-300">
              <strong>Preview:</strong> Members will see{' '}
              {formData.display_text || (
                formData.reward_minimum === formData.reward_maximum
                  ? `+${formData.reward_minimum}`
                  : `+${formData.reward_minimum}-${formData.reward_maximum}`
              )}{' '}
              KR Coins and {formData.battle_point_minimum === formData.battle_point_maximum
                ? formData.battle_point_minimum
                : `${formData.battle_point_minimum}-${formData.battle_point_maximum}`} BP for Day {formData.day}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isSaving}
              className="rounded-[4px] px-[15px] py-[9px]"
              style={{
                backgroundImage: "linear-gradient(1.0746108354373831deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
              }}
            >
              <span className="text-[16px] font-bold text-black leading-none">
                Save Changes
              </span>
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
