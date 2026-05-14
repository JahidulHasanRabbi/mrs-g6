"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import { LoadingState } from "../../components/ui/LoadingState";
import * as externalApi from "../../api/externalApi";

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

// ── Page content ─────────────────────────────────────────────────────────
function ExternalApiContent() {
  const [specialCodes, setSpecialCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [walletVipTiers, setWalletVipTiers] = useState([]);
  const [floatingMenus, setFloatingMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("special-code");

  useEffect(() => {
    loadSpecialCodes();
  }, []);

  const loadSpecialCodes = async () => {
    setIsLoading(true);
    try {
      const codesData = await externalApi.getSpecialCode();
      console.log('Special Codes:', codesData);
      setSpecialCodes(codesData || []);
      
      // Auto-select first code if available
      if (codesData && codesData.length > 0) {
        setSelectedCode(codesData[0].special_code);
        loadDataForCode(codesData[0].special_code);
      }
    } catch (err) {
      console.error('Failed to load special codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataForCode = async (code) => {
    if (!code) return;
    
    setIsLoadingData(true);
    try {
      const [tiersData, menusData] = await Promise.all([
        externalApi.getExternalWalletVipTiers(code).catch(err => {
          console.error('Failed to load wallet VIP tiers:', err);
          return [];
        }),
        externalApi.getExternalFloatingMenus(code).catch(err => {
          console.error('Failed to load floating menus:', err);
          return [];
        }),
      ]);
      
      setWalletVipTiers(tiersData);
      setFloatingMenus(menusData);
    } catch (err) {
      console.error('Failed to load data for code:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCodeChange = (code) => {
    setSelectedCode(code);
    loadDataForCode(code);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:admin-content-pl xl:pr-10 xl:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className=" font-bold text-[22px] sm:text-[28px] text-white">
          External API
        </h1>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e9af41"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      <LoadingState isLoading={isLoading}>
        {/* Info Card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="flex-1">
              <h2 className=" font-bold text-[18px] text-white mb-2">
                Public API Endpoints
              </h2>
              <p className=" text-[14px] text-white/70 mb-4">
                These endpoints are publicly accessible and do not require authentication. 
                They are designed for third-party integration with external wallet and gaming sites.
              </p>
              
              {/* Station Selector */}
              {specialCodes.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  <label className=" text-[14px] text-white">
                    Select Station:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="h-[36px] px-4 pr-10 rounded-[4px] bg-[rgba(255,255,255,0.1)] border-[0.5px] border-[rgba(255,255,255,0.15)] text-[14px] text-white outline-none focus:border-[#f2c36b] appearance-none cursor-pointer"
                    >
                      {specialCodes.map((station) => (
                        <option key={station.special_code} value={station.special_code} className="bg-[#4d4d4d] text-white">
                          {station.station_name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <span className=" text-[12px] text-white/50 font-mono">
                    Code: {selectedCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("special-code")}
            className={`h-[40px] px-6 rounded text-[16px] transition-all ${
              activeTab === "special-code"
                ? "text-black"
                : "text-white/70 bg-white/5 hover:bg-white/10"
            }`}
            style={activeTab === "special-code" ? { background: GOLD_BG } : {}}
          >
            Special Code
          </button>
          <button
            onClick={() => setActiveTab("wallet-vip")}
            className={`h-[40px] px-6 rounded text-[16px] transition-all ${
              activeTab === "wallet-vip"
                ? "text-black"
                : "text-white/70 bg-white/5 hover:bg-white/10"
            }`}
            style={activeTab === "wallet-vip" ? { background: GOLD_BG } : {}}
          >
            Wallet VIP Tiers
          </button>
          <button
            onClick={() => setActiveTab("floating-menus")}
            className={`h-[40px] px-6 rounded text-[16px] transition-all ${
              activeTab === "floating-menus"
                ? "text-black"
                : "text-white/70 bg-white/5 hover:bg-white/10"
            }`}
            style={activeTab === "floating-menus" ? { background: GOLD_BG } : {}}
          >
            Floating Menus
          </button>
        </div>

        {/* Content */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 sm:p-6">
          {isLoadingData && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e9af41]"></div>
            </div>
          )}
          
          {!isLoadingData && (
            <>
              {/* Special Code Tab */}
              {activeTab === "special-code" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className=" font-bold text-[20px] text-white">
                      Special Codes (All Stations)
                    </h3>
                    <code className="px-3 py-1 rounded bg-black/30 text-[#e9af41] font-mono text-sm">
                      GET /third-party/special-codes/
                    </code>
                  </div>
                  
                  {specialCodes.length > 0 ? (
                    <div className="overflow-x-auto scrollbar-admin rounded-lg">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="bg-black rounded-t-[6px]">
                            <th className="px-4 py-3 text-left">
                              <span className=" font-bold text-[16px] text-white">
                                Station Name
                              </span>
                            </th>
                            <th className="px-4 py-3 text-left">
                              <span className=" font-bold text-[16px] text-white">
                                Special Code
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {specialCodes.map((station, idx) => (
                            <tr key={idx} className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                {station.station_name}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-[#e9af41] font-mono">
                                {station.special_code}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-white/50">No special codes available</p>
                  )}
                </div>
              )}

              {/* Wallet VIP Tiers Tab */}
              {activeTab === "wallet-vip" && (
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className=" font-bold text-[20px] text-white">
                      Wallet VIP Tiers
                    </h3>
                    <code className="px-3 py-1 rounded bg-black/30 text-[#e9af41] font-mono text-sm">
                      GET /third-party/station-wallet-vip/{selectedCode}/
                    </code>
                  </div>
                  
                  {walletVipTiers.length > 0 ? (
                    <div className="overflow-x-auto scrollbar-admin rounded-lg">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="bg-black rounded-t-[6px]">
                            <th className="px-4 py-3 text-left min-w-[120px]">
                              <span className=" font-bold text-[16px] text-white">Tier Name</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[140px]">
                              <span className=" font-bold text-[16px] text-white">Lifetime Deposit</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[130px]">
                              <span className=" font-bold text-[16px] text-white">Monthly Deposit</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[120px]">
                              <span className=" font-bold text-[16px] text-white">Upgrade Bonus</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[130px]">
                              <span className=" font-bold text-[16px] text-white">Monthly Loyalty</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[120px]">
                              <span className=" font-bold text-[16px] text-white">Birthday Bonus</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {walletVipTiers.map((tier, idx) => (
                            <tr key={idx} className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 py-3 text-[14px] text-white/80 font-bold">
                                {tier.name}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                RM {Number(tier.lifetime_deposit_required || 0).toLocaleString('en-MY')}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                RM {Number(tier.monthly_deposit || 0).toLocaleString('en-MY')}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                RM {Number(tier.upgrade_bonus || 0).toLocaleString('en-MY')}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                RM {Number(tier.monthly_loyalty_bonus || 0).toLocaleString('en-MY')}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                RM {Number(tier.birthday_bonus || 0).toLocaleString('en-MY')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-white/50">No wallet VIP tiers available for this station</p>
                  )}
                </div>
              )}

              {/* Floating Menus Tab */}
              {activeTab === "floating-menus" && (
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className=" font-bold text-[20px] text-white">
                      Floating Menus
                    </h3>
                    <code className="px-3 py-1 rounded bg-black/30 text-[#e9af41] font-mono text-sm">
                      GET /third-party/station-floating-menu/{selectedCode}/
                    </code>
                  </div>
                  
                  {floatingMenus.length > 0 ? (
                    <div className="overflow-x-auto scrollbar-admin rounded-lg">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="bg-black rounded-t-[6px]">
                            <th className="px-4 py-3 text-left min-w-[180px]">
                              <span className=" font-bold text-[16px] text-white">Display Text</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[250px]">
                              <span className=" font-bold text-[16px] text-white">URL</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[100px]">
                              <span className=" font-bold text-[16px] text-white">Order</span>
                            </th>
                            <th className="px-4 py-3 text-left min-w-[100px]">
                              <span className=" font-bold text-[16px] text-white">Icon</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {floatingMenus.map((menu, idx) => (
                            <tr key={idx} className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                {menu.display_text}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                <a 
                                  href={menu.url_slug} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#e9af41] hover:underline"
                                >
                                  {menu.url_slug}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-[14px] text-white/80">
                                {menu.display_order}
                              </td>
                              <td className="px-4 py-3">
                                {menu.icon ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img 
                                    src={menu.icon} 
                                    alt={menu.display_text}
                                    className="h-[32px] w-[32px] object-cover rounded"
                                  />
                                ) : (
                                  <span className="text-white/40 text-sm">No icon</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-white/50">No floating menus available for this station</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </LoadingState>
    </main>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function ExternalApiPage() {
  return (
    <AdminRouteGuard>
      <ExternalApiContent />
    </AdminRouteGuard>
  );
}
