"use client";

import { useState, useEffect } from "react";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { LoadingState } from "../../components/ui/LoadingState";
import * as adminApi from "../../api/adminApi";

const CATEGORIES = [
  { id: 1, name: "Lucky Spin" },
  { id: 2, name: "Deposit Leaderboard" },
  { id: 3, name: "Withdraw Leaderboard" },
  { id: 4, name: "Referrer Leaderboard" },
  { id: 5, name: "World Cup Leaderboard" },
  { id: 6, name: "Smash Egg" },
  { id: 7, name: "Penalty Kick" }
];

export default function TermsConditionsPage() {
  return (
    <AdminRouteGuard>
      <TermsConditionsContent />
    </AdminRouteGuard>
  );
}

function TermsConditionsContent() {
  const [termsData, setTermsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [termsText, setTermsText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadTermsData();
  }, []);

  useEffect(() => {
    // Update text when category changes
    const categoryData = termsData.find(t => t.category_number === selectedCategory);
    if (categoryData) {
      setTermsText(categoryData.terms_and_conditions || "");
      setLastUpdated(categoryData.updated);
    } else {
      setTermsText("");
      setLastUpdated(null);
    }
  }, [selectedCategory, termsData]);

  const loadTermsData = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getTermsAndConditions();
      setTermsData(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Failed to load terms and conditions:', err);
      setTermsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!termsText.trim()) {
      alert("Please enter terms and conditions text.");
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.updateTermsAndConditions({
        terms_and_conditions: termsText,
        category: selectedCategory
      });
      
      // Reload data to get updated timestamp
      await loadTermsData();
      alert("Terms and conditions saved successfully!");
    } catch (err) {
      console.error('Failed to save terms and conditions:', err);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "Never";
    try {
      return new Date(datetime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return datetime;
    }
  };

  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
          Terms & Conditions Management
        </h1>
        <button className="flex h-[26px] w-[26px] items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 3.25C12.3096 3.25 11.75 3.80964 11.75 4.5V5.75C11.75 6.44036 12.3096 7 13 7C13.6904 7 14.25 6.44036 14.25 5.75V4.5C14.25 3.80964 13.6904 3.25 13 3.25Z"
              fill="#E9AF41"
            />
            <path
              d="M19.5 13C19.5 12.3096 20.0596 11.75 20.75 11.75H22C22.6904 11.75 23.25 12.3096 23.25 13C23.25 13.6904 22.6904 14.25 22 14.25H20.75C20.0596 14.25 19.5 13.6904 19.5 13Z"
              fill="#E9AF41"
            />
            <path
              d="M13 19.5C13.6904 19.5 14.25 20.0596 14.25 20.75V22C14.25 22.6904 13.6904 23.25 13 23.25C12.3096 23.25 11.75 22.6904 11.75 22V20.75C11.75 20.0596 12.3096 19.5 13 19.5Z"
              fill="#E9AF41"
            />
            <path
              d="M6.5 13C6.5 12.3096 5.94036 11.75 5.25 11.75H4C3.30964 11.75 2.75 12.3096 2.75 13C2.75 13.6904 3.30964 14.25 4 14.25H5.25C5.94036 14.25 6.5 13.6904 6.5 13Z"
              fill="#E9AF41"
            />
          </svg>
        </button>
      </div>

      <LoadingState isLoading={isLoading}>
        <div className="space-y-6">
          {/* Category Selector */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <h2 className="text-xl font-bold text-white font-['Times_New_Roman'] mb-4">
              Select Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={isSaving}
                  className={`px-4 py-3 rounded-lg font-['Times_New_Roman'] text-sm font-bold transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#e9af41] text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  } disabled:opacity-50`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-['Times_New_Roman']">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name} - Terms & Conditions
              </h2>
              {lastUpdated && (
                <span className="text-sm text-white/60 font-['Times_New_Roman']">
                  Last updated: {formatDateTime(lastUpdated)}
                </span>
              )}
            </div>

            <textarea
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              disabled={isSaving}
              placeholder="Enter terms and conditions text here..."
              className="w-full min-h-[400px] bg-white/10 border border-white/20 rounded-lg p-4 text-white font-['Times_New_Roman'] text-sm focus:outline-none focus:border-[#f2c36b] disabled:opacity-50 resize-y"
              style={{ lineHeight: "1.6" }}
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !termsText.trim()}
                className="inline-flex min-w-[164px] items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 font-['Times_New_Roman'] text-sm font-bold leading-none text-black transition-colors disabled:opacity-50"
                style={{
                  backgroundImage: "linear-gradient(2.1326483653998594deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)"
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-[#e9af41]/30 bg-[#e9af41]/10 p-4">
            <p className="text-white/80 text-sm font-['Times_New_Roman']">
              <strong>Note:</strong> These terms and conditions will be displayed to users on the member site. 
              Make sure to review the content carefully before saving.
            </p>
          </div>
        </div>
      </LoadingState>
    </main>
  );
}
