"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import ErrorDisplay from "../../components/ui/ErrorDisplay";
import { LoadingState, LoadingButton } from "../../components/ui/LoadingState";
import * as adminApi from "../../api/adminApi";

export default function VipTiersPage() {
  return (
    <AdminRouteGuard>
      <VipTiersContent />
    </AdminRouteGuard>
  );
}

function VipTiersContent() {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getVipTiers();
      setTiers(data);
    } catch (err) {
      console.error('Failed to load VIP tiers:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTier = async (tierData) => {
    try {
      await adminApi.createVipTier(tierData);
      setShowCreateForm(false);
      await loadTiers();
    } catch (err) {
      console.error('Failed to create tier:', err);
      throw err;
    }
  };

  const handleUpdateTier = async (tierUuid, tierData) => {
    try {
      await adminApi.updateVipTier(tierUuid, tierData);
      setEditingTier(null);
      await loadTiers();
    } catch (err) {
      console.error('Failed to update tier:', err);
      throw err;
    }
  };

  const handleArchiveTier = async (tierUuid) => {
    if (!confirm('Are you sure you want to archive this tier?')) {
      return;
    }
    
    try {
      await adminApi.archiveVipTier(tierUuid);
      await loadTiers();
    } catch (err) {
      console.error('Failed to archive tier:', err);
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07190d]">
      {/* Sidebar */}
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px]">
        <Sidebar activeItem="vip-tiers" />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
            VIP Tier Management
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-[4px] px-[15px] py-[9px]"
            style={{
              backgroundImage: "linear-gradient(1.0746108354373831deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
            }}
          >
            <span className="text-[16px] font-bold text-black font-['Times_New_Roman'] leading-none">
              Create New Tier
            </span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <TierFormModal
            title="Create New VIP Tier"
            onSubmit={handleCreateTier}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit Form Modal */}
        {editingTier && (
          <TierFormModal
            title="Edit VIP Tier"
            tier={editingTier}
            onSubmit={(data) => handleUpdateTier(editingTier.uuid, data)}
            onClose={() => setEditingTier(null)}
          />
        )}

        {/* Tiers List */}
        <LoadingState isLoading={isLoading}>
          <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Tier Name</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Lifetime Deposit</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Monthly Deposit</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Upgrade Bonus</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Monthly Loyalty</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Birthday Bonus</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-gray-400">
                        No VIP tiers found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    tiers.map((tier) => (
                      <tr key={tier.uuid} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-5 py-3 text-sm text-white">{tier.name}</td>
                        <td className="px-5 py-3 text-sm text-white">${tier.lifetime_deposit_required?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-white">${tier.monthly_deposit?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-white">${tier.upgrade_bonus?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-white">${tier.monthly_loyalty_bonus?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-white">${tier.birthday_bonus?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingTier(tier)}
                              className="rounded px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
                              style={{ backgroundColor: 'rgba(233, 175, 65, 0.2)' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleArchiveTier(tier.uuid)}
                              className="rounded px-3 py-1 text-xs font-medium text-white hover:bg-red-500/30"
                              style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
                            >
                              Archive
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
        </LoadingState>
      </main>
    </div>
  );
}

function TierFormModal({ title, tier, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: tier?.name || '',
    lifetime_deposit_required: tier?.lifetime_deposit_required || '',
    monthly_deposit: tier?.monthly_deposit || '',
    upgrade_bonus: tier?.upgrade_bonus || '',
    monthly_loyalty_bonus: tier?.monthly_loyalty_bonus || '',
    birthday_bonus: tier?.birthday_bonus || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : (value === '' ? '' : Number(value))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl border border-[rgba(255,255,132,0.2)] bg-[#07190d] p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-['Times_New_Roman']">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
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
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tier Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Lifetime Deposit Required *
              </label>
              <input
                type="number"
                name="lifetime_deposit_required"
                value={formData.lifetime_deposit_required}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Monthly Deposit *
              </label>
              <input
                type="number"
                name="monthly_deposit"
                value={formData.monthly_deposit}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Upgrade Bonus *
              </label>
              <input
                type="number"
                name="upgrade_bonus"
                value={formData.upgrade_bonus}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Monthly Loyalty Bonus *
              </label>
              <input
                type="number"
                name="monthly_loyalty_bonus"
                value={formData.monthly_loyalty_bonus}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Birthday Bonus *
              </label>
              <input
                type="number"
                name="birthday_bonus"
                value={formData.birthday_bonus}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              className="rounded-[4px] px-[15px] py-[9px]"
              style={{
                backgroundImage: "linear-gradient(1.0746108354373831deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
              }}
            >
              <span className="text-[16px] font-bold text-black font-['Times_New_Roman'] leading-none">
                {tier ? 'Update Tier' : 'Create Tier'}
              </span>
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
