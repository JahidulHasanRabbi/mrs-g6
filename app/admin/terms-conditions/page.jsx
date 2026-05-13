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
  { id: 7, name: "Penalty Kick" },
  { id: 8, name: "Main Page", usesSections: true }
];

// Parse "title: X\ndescription: Y" format into sections array
function parseTextToSections(text) {
  if (!text || !text.trim()) return [];
  const sections = [];
  // Split by double newline or by "title:" occurrences
  const blocks = text.split(/\n(?=title:)/i);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const titleMatch = trimmed.match(/^title:\s*(.+?)(?:\n|$)/i);
    const descMatch = trimmed.match(/description:\s*([\s\S]*?)$/i);
    if (titleMatch || descMatch) {
      sections.push({
        id: Date.now() + Math.random(),
        title: titleMatch ? titleMatch[1].trim() : "",
        description: descMatch ? descMatch[1].trim() : ""
      });
    }
  }
  return sections;
}

// Serialize sections array back to "title: X\ndescription: Y" format
function sectionsToText(sections) {
  return sections
    .map(s => `title: ${s.title}\ndescription: ${s.description}`)
    .join("\n\n");
}

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
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Please enter terms and conditions text");

  const isMainPage = CATEGORIES.find(c => c.id === selectedCategory)?.usesSections;

  useEffect(() => {
    loadTermsData();
  }, []);

  useEffect(() => {
    const categoryData = termsData.find(t => t.category_number === selectedCategory);
    if (categoryData) {
      const text = categoryData.terms_and_conditions || "";
      setTermsText(text);
      setLastUpdated(categoryData.updated);
      if (CATEGORIES.find(c => c.id === selectedCategory)?.usesSections) {
        setSections(parseTextToSections(text));
      }
    } else {
      setTermsText("");
      setLastUpdated(null);
      setSections([]);
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

  // Section management
  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: Date.now() + Math.random(), title: "", description: "" }
    ]);
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  const handleSave = async () => {
    let textToSave = termsText;

    if (isMainPage) {
      // Validate sections
      const hasEmpty = sections.some(s => !s.title.trim() && !s.description.trim());
      if (sections.length === 0) {
        setErrorMessage("Please add at least one section");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }
      textToSave = sectionsToText(sections);
    } else {
      if (!termsText.trim()) {
        setErrorMessage("Please enter terms and conditions text");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }
    }

    setIsSaving(true);
    try {
      await adminApi.updateTermsAndConditions({
        terms_and_conditions: textToSave,
        category: selectedCategory
      });
      await loadTermsData();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Failed to save terms and conditions:', err);
      setErrorMessage("Failed to save. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
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
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-[#06b800] border border-[#06b800]/30 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3 min-w-[300px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-white font-bold font-['Times_New_Roman']">Success!</p>
              <p className="text-white/90 text-sm font-['Times_New_Roman']">Terms and conditions saved successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-red-500 border border-red-500/30 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3 min-w-[300px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-white font-bold font-['Times_New_Roman']">Error!</p>
              <p className="text-white/90 text-sm font-['Times_New_Roman']">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
          Terms & Conditions Management
        </h1>
        <button className="flex h-[26px] w-[26px] items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 3.25C12.3096 3.25 11.75 3.80964 11.75 4.5V5.75C11.75 6.44036 12.3096 7 13 7C13.6904 7 14.25 6.44036 14.25 5.75V4.5C14.25 3.80964 13.6904 3.25 13 3.25Z" fill="#E9AF41"/>
            <path d="M19.5 13C19.5 12.3096 20.0596 11.75 20.75 11.75H22C22.6904 11.75 23.25 12.3096 23.25 13C23.25 13.6904 22.6904 14.25 22 14.25H20.75C20.0596 14.25 19.5 13.6904 19.5 13Z" fill="#E9AF41"/>
            <path d="M13 19.5C13.6904 19.5 14.25 20.0596 14.25 20.75V22C14.25 22.6904 13.6904 23.25 13 23.25C12.3096 23.25 11.75 22.6904 11.75 22V20.75C11.75 20.0596 12.3096 19.5 13 19.5Z" fill="#E9AF41"/>
            <path d="M6.5 13C6.5 12.3096 5.94036 11.75 5.25 11.75H4C3.30964 11.75 2.75 12.3096 2.75 13C2.75 13.6904 3.30964 14.25 4 14.25H5.25C5.94036 14.25 6.5 13.6904 6.5 13Z" fill="#E9AF41"/>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-['Times_New_Roman']">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name} - Terms & Conditions
              </h2>
              {lastUpdated && (
                <span className="text-sm text-white/60 font-['Times_New_Roman']">
                  Last updated: {formatDateTime(lastUpdated)}
                </span>
              )}
            </div>

            {isMainPage ? (
              /* Section Builder for Main Page */
              <div className="space-y-4">
                {sections.length === 0 && (
                  <div className="text-center py-10 text-white/40 font-['Times_New_Roman'] text-sm border border-dashed border-white/10 rounded-lg">
                    No sections yet. Click &quot;Add Section&quot; to get started.
                  </div>
                )}

                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-5 relative"
                  >
                    {/* Section number badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-7 h-7 rounded-full text-[#3d1a02] text-sm font-extrabold shrink-0"
                          style={{
                            background: "linear-gradient(135deg, #e9af41 0%, #b07c2a 100%)"
                          }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-white/60 text-sm font-['Times_New_Roman']">Section {index + 1}</span>
                      </div>
                      <button
                        onClick={() => removeSection(section.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-['Times_New_Roman'] font-bold transition-colors disabled:opacity-50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                        Remove
                      </button>
                    </div>

                    {/* Title field */}
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-[#e9af41] font-['Times_New_Roman'] mb-1.5 uppercase tracking-wider">
                        Title
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, "title", e.target.value)}
                        disabled={isSaving}
                        placeholder="Enter section title..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white font-['Times_New_Roman'] text-sm focus:outline-none focus:border-[#f2c36b] disabled:opacity-50 placeholder:text-white/30"
                      />
                    </div>

                    {/* Description field */}
                    <div>
                      <label className="block text-xs font-bold text-[#e9af41] font-['Times_New_Roman'] mb-1.5 uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        value={section.description}
                        onChange={(e) => updateSection(section.id, "description", e.target.value)}
                        disabled={isSaving}
                        placeholder="Enter section description..."
                        rows={4}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white font-['Times_New_Roman'] text-sm focus:outline-none focus:border-[#f2c36b] disabled:opacity-50 resize-y placeholder:text-white/30"
                        style={{ lineHeight: "1.6" }}
                      />
                    </div>
                  </div>
                ))}

                {/* Add Section Button */}
                <button
                  onClick={addSection}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-[#e9af41]/40 text-[#e9af41] hover:bg-[#e9af41]/5 font-['Times_New_Roman'] text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  Add Section
                </button>
              </div>
            ) : (
              /* Plain textarea for other categories */
              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                disabled={isSaving}
                placeholder="Enter terms and conditions text here..."
                className="w-full min-h-[400px] bg-white/10 border border-white/20 rounded-lg p-4 text-white font-['Times_New_Roman'] text-sm focus:outline-none focus:border-[#f2c36b] disabled:opacity-50 resize-y"
                style={{ lineHeight: "1.6" }}
              />
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving || (isMainPage ? sections.length === 0 : !termsText.trim())}
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
              <strong>Note:</strong> {isMainPage
                ? "Main Page terms use sections with a title and description. Each section will appear as a collapsible item on the member site."
                : "These terms and conditions will be displayed to users on the member site. Make sure to review the content carefully before saving."
              }
            </p>
          </div>
        </div>
      </LoadingState>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
