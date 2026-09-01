"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";
import {
  ACCEPT_ATTR,
  ACCEPTED_EXTENSIONS,
  TEMPLATE_HEADERS,
  buildSequenceImport,
  buildTemplateCsv,
  downloadCsv,
  readSheetGrid,
  submitSequenceImport,
} from "../../../lib/sequenceImport";

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/** Trigger-button icon, so each page can style its own button to match its header. */
export function ImportIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="11" />
      <polyline points="9 14 12 11 15 14" />
    </svg>
  );
}

/**
 * Spreadsheet importer shared by the Smash Egg, Lucky Spin and Penalty Kick
 * sequence tables. Parses and validates the whole file up front, previews it,
 * then sends the resolved entries to the bulk import endpoint in one call.
 * The backend re-validates against live reward state, so its response —
 * success_count / failed_count / failed_rows — is shown even for rows the
 * client-side preview marked OK.
 */
export default function ImportSequenceModal({
  open,
  onClose,
  title = "Import Sequence",
  rewards = [],
  existingCount = 0,
  templateFilename = "sequence-template.csv",
  importFn,
  onImported,
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [applying, setApplying] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (open) return;
    setFileName("");
    setParsing(false);
    setParseError(null);
    setResult(null);
    setDragging(false);
    setApplying(false);
    setApiResult(null);
    setApiError(null);
  }, [open]);

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setResult(null);
    setApiResult(null);
    setApiError(null);
    setParsing(true);
    try {
      const grid = await readSheetGrid(file);
      setResult(buildSequenceImport(grid, rewards));
    } catch (error) {
      setParseError(error?.message || "Could not read that file.");
    } finally {
      setParsing(false);
    }
  };

  const pickFile = (event) => {
    handleFile(event.target.files?.[0]);
    // Reset so re-picking the same file after a fix still fires onChange.
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!applying) handleFile(event.dataTransfer.files?.[0]);
  };

  const entries = result?.entries || [];
  const canImport =
    !parsing && !applying && !apiResult && entries.length > 0 && !result?.errorCount && !result?.fatal;

  // Preview in the order the sequence will be created, not file order — the
  // hint above promises Position drives order. Rows whose position never parsed
  // sit at the end; the Row column still points back into the file.
  const previewRows = useMemo(() => {
    if (!result?.rows) return [];
    return [...result.rows].sort((a, b) => {
      if (a.position == null && b.position == null) return a.line - b.line;
      if (a.position == null) return 1;
      if (b.position == null) return -1;
      return a.position - b.position || a.line - b.line;
    });
  }, [result]);

  const handleImport = async () => {
    if (!canImport) return;
    setApplying(true);
    setApiError(null);
    try {
      const response = await submitSequenceImport(entries, importFn);
      setApiResult(response);
      onImported?.(response);
    } catch (error) {
      setApiError(error?.data?.detail || error?.data?.error || error?.message || "Import failed.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <ModalShell
      title={title}
      open={open}
      // Backdrop and Escape stay live in ModalShell, so block them mid-import.
      onClose={applying ? undefined : onClose}
      onSave={handleImport}
      saving={applying || parsing}
      saveLabel={applying ? "Importing..." : `Import ${entries.length || ""}`.trim()}
      showSave={canImport || applying}
      closeLabel={apiResult ? "Done" : "Close"}
      width="max-w-[760px]"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[10px] border border-[#f2cb7a]/30 bg-[#f2cb7a]/[0.06] px-4 py-3">
          <div className="min-w-0 text-[12px] leading-relaxed text-[#fbeed2]/80">
            <p>
              Columns: <span className="font-semibold text-[#f2cb7a]">{TEMPLATE_HEADERS.join(" · ")}</span>
              {" — "}
              <span className="text-white/60">Reward ID is optional and wins over the name when both are set.</span>
            </p>
            <p className="mt-1 text-white/50">Accepts {ACCEPTED_EXTENSIONS.join(", ")}. Row order is taken from Position, not from the file.</p>
          </div>
          <button
            type="button"
            onClick={() => downloadCsv(templateFilename, buildTemplateCsv(rewards))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-1.5 text-[12px] font-semibold text-[#eaad2c] transition-colors hover:bg-white/5"
          >
            <DownloadIcon />
            Download template
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!applying) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-[12px] border-2 border-dashed px-6 py-7 text-center transition-colors ${
            dragging ? "border-[#f2cb7a] bg-[#f2cb7a]/10" : "border-white/15 bg-white/[0.02]"
          }`}
        >
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#f2cb7a]/40 text-[#eaad2c]">
            <UploadIcon />
          </div>
          <p className="text-[13px] text-white/70">
            Drag a file here, or{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={applying}
              className="font-semibold text-[#eaad2c] underline decoration-dotted underline-offset-2 disabled:opacity-50"
            >
              browse
            </button>
          </p>
          {fileName && (
            <p className="mt-2 truncate text-[12px] text-[#fbeed2]">
              {parsing ? "Reading" : "Loaded"}: <span className="font-semibold">{fileName}</span>
            </p>
          )}
          <input ref={inputRef} type="file" accept={ACCEPT_ATTR} onChange={pickFile} className="hidden" />
        </div>

        {parseError && (
          <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">{parseError}</p>
        )}

        {result?.fatal && (
          <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">{result.fatal}</p>
        )}

        {result && !result.fatal && (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
              <span className="text-white/70">
                <span className="font-semibold text-white">{result.rows.length}</span> rows read
              </span>
              <span className="text-[#06b800]">
                <span className="font-semibold">{entries.length}</span> ready
              </span>
              {result.errorCount > 0 && (
                <span className="text-red-300">
                  <span className="font-semibold">{result.errorCount}</span> need fixing
                </span>
              )}
            </div>

            <div className="max-h-[280px] overflow-y-auto rounded-[10px] border border-white/10 scrollbar-admin">
              <table className="w-full">
                <thead className="sticky top-0 bg-gradient-to-b from-[#141828] to-[#333333] text-left">
                  <tr>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Row</th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Position</th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Reward</th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.line} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-2.5 text-[12px] text-white/40">{row.line}</td>
                      <td className="px-4 py-2.5 text-[12px] text-white">{row.position ? `#${row.position}` : row.rawPosition || "-"}</td>
                      <td className="px-4 py-2.5 text-[12px] text-white">{row.rewardName || row.rawId || "-"}</td>
                      <td className={`px-4 py-2.5 text-[12px] ${row.error ? "text-red-300" : "text-[#06b800]"}`}>
                        {row.error || "OK"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canImport && (
              <p className="rounded-[8px] border border-[#eaad2c]/40 bg-[#eaad2c]/10 px-4 py-3 text-[12px] text-[#fbeed2]">
                Importing replaces the entire sequence:{" "}
                {existingCount > 0
                  ? `all ${existingCount} existing position${existingCount === 1 ? "" : "s"} will be deleted`
                  : "there is nothing configured yet"}
                , then these {entries.length} position{entries.length === 1 ? "" : "s"} will be created.
              </p>
            )}

            {result.errorCount > 0 && (
              <p className="text-[12px] text-white/50">Fix every flagged row in the file and upload it again — nothing is imported while errors remain.</p>
            )}
          </>
        )}

        {applying && (
          <p className="text-[12px] text-white/60">Sending {entries.length} row{entries.length === 1 ? "" : "s"} to the server...</p>
        )}

        {apiError && (
          <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">{apiError}</p>
        )}

        {apiResult && (
          <div className="space-y-3 rounded-[10px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[13px] font-semibold text-[#fbeed2]">Import result</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px]">
              <span className="text-[#06b800]">
                <span className="font-semibold">{apiResult.success_count ?? 0}</span> saved
              </span>
              <span className={apiResult.failed_count ? "text-red-300" : "text-white/50"}>
                <span className="font-semibold">{apiResult.failed_count ?? 0}</span> failed
              </span>
            </div>

            {apiResult.failed_rows?.length > 0 && (
              <div className="max-h-[220px] overflow-y-auto rounded-[10px] border border-white/10 scrollbar-admin">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gradient-to-b from-[#141828] to-[#333333] text-left">
                    <tr>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Position</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Reward</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-[#fbeed2]">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiResult.failed_rows.map((row) => {
                      const source = entries[row.row_number - 1];
                      return (
                        <tr key={row.row_number} className="border-b border-white/5 last:border-b-0">
                          <td className="px-4 py-2.5 text-[12px] text-white">{source ? `#${source.position}` : "-"}</td>
                          <td className="px-4 py-2.5 text-[12px] text-white">{source?.rewardName || "-"}</td>
                          <td className="px-4 py-2.5 text-[12px] text-red-300">{row.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-[12px] text-white/50">The sequence table and import history below have been refreshed.</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
