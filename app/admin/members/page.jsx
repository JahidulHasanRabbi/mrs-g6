"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { AdminRouteGuard } from "../../components/guards/AdminRouteGuard";
import ErrorDisplay from "../../components/ui/ErrorDisplay";
import { LoadingState } from "../../components/ui/LoadingState";
import * as adminApi from "../../api/adminApi";

export default function MembersPage() {
  return (
    <AdminRouteGuard>
      <MembersContent />
    </AdminRouteGuard>
  );
}

function MembersContent() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    // Filter members based on search query
    if (searchQuery.trim() === "") {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(member => 
        member.username?.toLowerCase().includes(query) ||
        member.phone_number?.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, members]);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getMembers();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeString;
    }
  };

  return (
    <div className="min-h-screen bg-[#07190d]">
      {/* Sidebar */}
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px]">
        <Sidebar activeItem="members" />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
            Member Management
          </h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by username or phone number..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
          />
        </div>

        {/* Members Table */}
        <LoadingState isLoading={isLoading}>
          <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Phone Number</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Username</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Current Tokens</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Last Check-in</th>
                    <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-gray-400">
                        {searchQuery ? 'No members found matching your search.' : 'No members found.'}
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((member) => (
                      <tr key={member.uuid} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-5 py-3 text-sm text-white">{member.phone_number || 'N/A'}</td>
                        <td className="px-5 py-3 text-sm text-white">{member.username || 'N/A'}</td>
                        <td className="px-5 py-3 text-sm text-white">{member.tier || 'N/A'}</td>
                        <td className="px-5 py-3 text-sm text-white">{member.current_tokens?.toLocaleString() || '0'}</td>
                        <td className="px-5 py-3 text-sm text-white">{formatDate(member.last_check_in)}</td>
                        <td className="px-5 py-3 text-sm text-white">{formatDateTime(member.last_login)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredMembers.length > 0 && (
              <div className="flex items-center justify-center border-t border-white/10 px-6 py-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <div className="flex items-center gap-1 px-2 text-sm text-white/70">
                    <span className="font-bold text-white">
                      {currentPage}
                    </span>
                    <span>/</span>
                    <span>
                      {totalPages || 1}
                    </span>
                  </div>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </LoadingState>

        {/* Results Summary */}
        {!isLoading && filteredMembers.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
            {searchQuery && ` (filtered from ${members.length} total)`}
          </div>
        )}
      </main>
    </div>
  );
}
