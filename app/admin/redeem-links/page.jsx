"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import RedeemLinksTable from "../../components/admin/redeem-links/RedeemLinksTable";
import RedeemLinkHistoryModal, { REDEEM_LINK_HISTORY_PAGE_SIZE } from "../../components/admin/redeem-links/RedeemLinkHistoryModal";
import RedeemLinkKpiGrid from "../../components/admin/redeem-links/RedeemLinkKpiGrid";
import { buildKpiDateRange, buildRedeemShareUrl, describeRedeemLinkError } from "../../components/admin/redeem-links/redeemLinkUtils.mjs";
import PeriodToggle from "../../components/admin/retention/PeriodToggle";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../components/admin/ui/Toast";
import * as adminApi from "../../api/adminApi";

const PAGE_SIZE = 7;
const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";

function AddIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// useSearchParams (via the date range + PeriodToggle) needs a Suspense
// boundary during prerender, so the page body lives in a child component.
export default function RedeemLinksPage() {
  return (
    <Suspense>
      <RedeemLinksContent />
    </Suspense>
  );
}

function RedeemLinksContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [links, setLinks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(null);

  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [period, setPeriod] = useState("Daily");
  const [kpi, setKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const copyTimerRef = useRef(null);
  const historyRequestRef = useRef(0);
  const kpiRequestRef = useRef(0);

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";
  const kpiRange = useMemo(
    () => buildKpiDateRange(period, fromDate, toDate),
    [period, fromDate, toDate],
  );

  // Picking a predefined period clears any explicit range from the URL,
  // otherwise the range would silently keep overriding the toggle.
  const handlePeriodChange = useCallback((nextPeriod) => {
    setPeriod(nextPeriod);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("from");
    next.delete("to");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const requestId = ++kpiRequestRef.current;
    setKpiLoading(true);
    adminApi.getRedeemLinkKpi(kpiRange)
      .then((data) => {
        if (kpiRequestRef.current !== requestId) return;
        setKpi(data || {});
      })
      .catch((error) => {
        if (kpiRequestRef.current !== requestId) return;
        setKpi({});
        toast.error("Failed to load redeem link stats", { description: describeRedeemLinkError(error) });
      })
      .finally(() => {
        if (kpiRequestRef.current === requestId) setKpiLoading(false);
      });
  }, [kpiRange, toast]);

  const loadLinks = useCallback(async (nextPage) => {
    setLoading(true);
    try {
      const data = await adminApi.getRedeemLinks({ page: nextPage, page_size: PAGE_SIZE });
      const rows = Array.isArray(data) ? data : data?.results || [];
      setLinks(rows);
      setTotal(Number(data?.count ?? rows.length));
    } catch (error) {
      toast.error("Failed to load redeem links", { description: describeRedeemLinkError(error) });
      setLinks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLinks(page);
  }, [loadLinks, page]);

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  useEffect(() => {
    if (!historyTarget?.uuid) return;
    const requestId = ++historyRequestRef.current;
    setHistoryLoading(true);
    setHistoryError("");
    setHistoryRows([]);

    adminApi.getRedeemLinkHistory(historyTarget.uuid, {
      page: historyPage,
      page_size: REDEEM_LINK_HISTORY_PAGE_SIZE,
    }).then((data) => {
      if (historyRequestRef.current !== requestId) return;
      const rows = Array.isArray(data) ? data : data?.results || [];
      setHistoryRows(rows);
      setHistoryTotal(Number(data?.count ?? rows.length));
    }).catch((error) => {
      if (historyRequestRef.current !== requestId) return;
      const message = describeRedeemLinkError(error);
      setHistoryError(message);
      setHistoryTotal(0);
      toast.error("Failed to load redemption history", { description: message });
    }).finally(() => {
      if (historyRequestRef.current === requestId) setHistoryLoading(false);
    });

    return () => {
      if (historyRequestRef.current === requestId) historyRequestRef.current += 1;
    };
  }, [historyPage, historyTarget, toast]);

  const handleCopy = async (link) => {
    try {
      const shareUrl = buildRedeemShareUrl(window.location.origin, link.station_url, link.uuid);
      await navigator.clipboard.writeText(shareUrl);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedUuid(link.uuid);
      copyTimerRef.current = setTimeout(() => setCopiedUuid(null), 1800);
    } catch (error) {
      toast.error("Failed to copy link", { description: error?.message || "Clipboard access is unavailable." });
    }
  };

  const openHistory = (link) => {
    historyRequestRef.current += 1;
    setHistoryRows([]);
    setHistoryTotal(0);
    setHistoryError("");
    setHistoryPage(1);
    setHistoryTarget(link);
  };

  const closeHistory = () => {
    historyRequestRef.current += 1;
    setHistoryTarget(null);
    setHistoryRows([]);
    setHistoryError("");
  };

  const confirmArchive = async () => {
    if (!archiveTarget?.uuid || archiving) return;
    setArchiving(true);
    try {
      await adminApi.archiveRedeemLink(archiveTarget.uuid);
      toast.success("Redeem link archived");
      setArchiveTarget(null);
      if (links.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadLinks(page);
      }
    } catch (error) {
      toast.error("Failed to archive redeem link", { description: describeRedeemLinkError(error) });
    } finally {
      setArchiving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
        <span className="text-[12px] font-medium leading-[18px] text-white">OVERVIEW</span>
        <PeriodToggle
          period={period}
          onPeriodChange={handlePeriodChange}
          fromDate={fromDate}
          toDate={toDate}
        />
      </div>

      <RedeemLinkKpiGrid kpi={kpi} loading={kpiLoading} />

      <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Redeem Links
          </h2>
          <button
            type="button"
            onClick={() => router.push("/admin/redeem-links/add")}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90"
            style={{ backgroundImage: GOLD_BG }}
          >
            <AddIcon />
            Add Redeem Link
          </button>
        </div>

        <div className="px-2 pb-2">
          {loading ? (
            <div className="px-6 py-12 text-center text-[13px] text-white/50">Loading redeem links...</div>
          ) : (
            <RedeemLinksTable
              links={links}
              copiedUuid={copiedUuid}
              onCopy={handleCopy}
              onHistory={openHistory}
              onEdit={(link) => router.push(`/admin/redeem-links/add?id=${link.uuid}`)}
              onArchive={setArchiveTarget}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
          <p className="text-[10px] text-white/80">Showing {start} to {end} of {total} Results</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <RedeemLinkHistoryModal
        open={Boolean(historyTarget)}
        link={historyTarget}
        rows={historyRows}
        loading={historyLoading}
        error={historyError}
        page={historyPage}
        total={historyTotal}
        onPageChange={setHistoryPage}
        onClose={closeHistory}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archive redeem link?"
        message={archiveTarget ? `Archive ${archiveTarget.name}? This campaign will disappear from the active list and cannot be restored here.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        loading={archiving}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
