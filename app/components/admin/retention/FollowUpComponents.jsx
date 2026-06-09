"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PriorityBadge from "./PriorityBadge";
import { GRAD_DARK, GRAD_GOLD } from "./constants";

export const ACTION_TYPES = ["TG", "WA", "Bonus", "Event", "LiveChat", "Others"];
const PRIORITY_TYPES = ["High", "Medium", "Low"];

const ACTION_COLORS = {
  TG: { bg: "#173f73", color: "#64a1ff", ring: "#4188ff" },
  WA: { bg: "#07502a", color: "#9affc8", ring: "#84ebb4" },
  Bonus: { bg: "#5a4100", color: "#ffd36d", ring: "#eaad2c" },
  Event: { bg: "#43236f", color: "#e7c2ff", ring: "#d9acff" },
  LiveChat: { bg: "#07545a", color: "#8df5ff", ring: "#67e8f9" },
  Others: { bg: "#3b3b3b", color: "#d1d1d1", ring: "#a4a4a4" },
};

const PRIORITY_COLORS = {
  High: { bg: "#fb3748", color: "#ffffff" },
  Medium: { bg: "#ffe9bc", color: "#a86b00" },
  Low: { bg: "#84ebb4", color: "#179451" },
};

const STATUS_COLORS = {
  New: { bg: "#2a2a2a", color: "#a4a4a4" },
  "In Progress": { bg: "#3d2e00", color: "#eaad2c" },
  Snoozed: { bg: "#2a1a4a", color: "#d9acff" },
  Resolved: { bg: "#003920", color: "#84ebb4" },
};

function formatDisplayDate(value) {
  if (!value) return "-";
  const text = String(value).replace("T", " ");
  const [date = "", timeRaw = ""] = text.split(" ");
  const time = timeRaw ? timeRaw.slice(0, 5) : "";
  const [year, month, day] = date.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabel = months[Number(month) - 1] || month;
  return `${Number(day)} ${monthLabel} ${year}${time ? `, ${time}` : ""}`;
}

function entryAction(entry) {
  return entry?.action_type || entry?.action || "Others";
}

function entryRemark(entry) {
  return entry?.follow_up_remark || entry?.remark || entry?.note || "";
}

function currentDateTime() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function StatusBadge({ value }) {
  const palette = STATUS_COLORS[value];
  if (!palette) {
    return <span className="text-[12px] font-medium leading-[18px] text-white/60 whitespace-nowrap">-</span>;
  }
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[12px] font-semibold leading-[18px] whitespace-nowrap"
      style={{ backgroundColor: palette.bg, color: palette.color }}
    >
      {value}
    </span>
  );
}

export function ActionTypeChip({ type, picker = false, selected = false, onClick }) {
  const palette = ACTION_COLORS[type] || ACTION_COLORS.Others;
  const className = picker
    ? "min-w-[92px] rounded-[10px] border px-4 py-3 text-[12px] font-bold transition"
    : "rounded-[6px] px-2.5 py-1 text-[11px] font-bold whitespace-nowrap";
  const style = {
    backgroundColor: palette.bg,
    color: palette.color,
    borderColor: picker ? (selected ? palette.ring : "rgba(242,203,122,0.28)") : undefined,
    opacity: picker && !selected ? 0.65 : 1,
    boxShadow: picker && selected ? `0 0 0 2px ${palette.ring}, 0 0 18px ${palette.ring}55` : undefined,
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {type}
      </button>
    );
  }
  return (
    <span className={`inline-flex items-center ${className}`} style={style}>
      {type}
    </span>
  );
}

export function FollowUpCreateModal({
  memberName,
  onClose,
  onSubmit,
  fixedActionType = "",
  title = "Add Follow Up",
  showPriority = false,
  initialPriority = "High",
  initialNote = "",
  submitting = false,
  submitError = "",
}) {
  const [actionType, setActionType] = useState(fixedActionType);
  const [priority, setPriority] = useState(initialPriority || "High");
  const [note, setNote] = useState(initialNote);

  const noteRequired = actionType === "Others";
  const submitDisabled = submitting || !actionType || (showPriority && !priority) || (noteRequired && !note.trim());

  const handleSubmit = () => {
    if (submitDisabled) return;
    onSubmit({
      uuid: `fh-${Date.now()}`,
      action_type: actionType,
      priority: showPriority ? priority : undefined,
      note: actionType === "Others" ? note.trim() : note.trim(),
      follow_up_remark: [
        actionType ? `Action: ${actionType}` : "",
        showPriority && priority ? `Priority: ${priority}` : "",
        note.trim(),
      ].filter(Boolean).join(" | "),
      pic: "Sarah",
      datetime: currentDateTime(),
    });
  };

  return (
    <ModalOverlay onClose={onClose} zClass="z-[60]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <ModalTitle>{title} - {memberName}</ModalTitle>
        <CloseButton onClick={onClose} />
      </div>

      {/* Action — picker when no fixedActionType, confirmation chip when fixed */}
      {!fixedActionType ? (
        <div className="mt-5">
          <p className="mb-3 text-[12px] font-medium text-[#fbeed2]">Action</p>
          <div className="flex flex-wrap gap-2">
            {ACTION_TYPES.map((type) => (
              <ActionTypeChip
                key={type}
                type={type}
                picker
                selected={actionType === type}
                onClick={() => setActionType(type)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3">
          <p className="text-[12px] font-medium text-[#fbeed2]">Action:</p>
          <ActionTypeChip type={fixedActionType} />
        </div>
      )}

      {/* Priority picker */}
      {showPriority ? (
        <div className="mt-5">
          <p className="mb-3 text-[12px] font-medium text-[#fbeed2]">Priority</p>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_TYPES.map((type) => {
              const palette = PRIORITY_COLORS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPriority(type)}
                  className="rounded-[10px] border px-4 py-3 text-[12px] font-bold transition"
                  style={{
                    backgroundColor: priority === type ? palette.bg : "#15181f",
                    borderColor: priority === type ? palette.bg : "rgba(242,203,122,0.28)",
                    color: priority === type ? palette.color : "#f6dda6",
                    boxShadow: priority === type ? `0 0 0 2px ${palette.bg}, 0 0 18px ${palette.bg}55` : undefined,
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Note — only shown for "Others", required */}
      {noteRequired ? (
        <div className="mt-5">
          <p className="mb-2 text-[12px] font-medium text-[#fbeed2]">
            Note <span className="text-[#fb3748]">*</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[80px] w-full resize-none rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
          />
        </div>
      ) : null}

      {submitError ? (
        <p className="mt-4 text-[12px] text-[#fb3748]">{submitError}</p>
      ) : null}

      <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[8px] border border-[#d00416] px-5 py-2 text-[12px] font-medium text-[#d00416] transition hover:bg-[#d00416]/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          className="rounded-[8px] border border-[#f2cb7a] px-5 py-2 text-[12px] font-medium text-[#141828] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundImage: GRAD_GOLD }}
        >
          {submitting ? "Saving..." : "Confirm"}
        </button>
      </div>
    </ModalOverlay>
  );
}

export function AlertViewModal({ member, onClose, onSnooze }) {
  const name = member?.full_name || member?.username || "Member";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex justify-end">
        <CloseButton onClick={onClose} />
      </div>
      <div className="mt-1 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <ModalTitle className="mb-0">{name}</ModalTitle>
          <StatusBadge value={member?.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-white/60">
          <span>{member?.vip_level || "-"}</span>
          <span>-</span>
          <PriorityBadge value={member?.priority} />
          <span>-</span>
          <span>PIC: {member?.retention || "-"}</span>
        </div>
      </div>
      <div className="mt-5">
        <p className="border-b border-white/10 pb-3 text-[12px] font-medium text-[#fbeed2]">Followup Details</p>
        <div className="mt-4 rounded-[10px] border border-[#f2cb7a]/20 bg-[#090b10] p-4 shadow-[0_0_14px_rgba(222,162,32,0.08)]">
          <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3">
            <DetailLabel>Last Action:</DetailLabel>
            <div>{member?.last_action ? <ActionTypeChip type={member.last_action} /> : <DetailValue>-</DetailValue>}</div>
            <DetailLabel>By:</DetailLabel>
            <DetailValue>{member?.last_action_by || "-"}</DetailValue>
            <DetailLabel>Date:</DetailLabel>
            <DetailValue>{formatDisplayDate(member?.last_action_at)}</DetailValue>
            <DetailLabel>Phone:</DetailLabel>
            <DetailValue>{member?.phone_number || "-"}</DetailValue>
            <DetailLabel>Daily Sales:</DetailLabel>
            <DetailValue>{member?.daily_sales ?? "-"}</DetailValue>
            <DetailLabel>Daily Win/Loss:</DetailLabel>
            <DetailValue>{member?.daily_win_loss ?? "-"}</DetailValue>
            {member?.remark ? (
              <>
                <DetailLabel>Remark:</DetailLabel>
                <DetailValue>{member.remark}</DetailValue>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onSnooze}
          className="rounded-[8px] border border-[#d9acff] px-4 py-2 text-[12px] font-medium text-[#d9acff] transition hover:bg-[#d9acff]/10"
          style={{ backgroundImage: GRAD_DARK }}
        >
          Snooze - lower to Low
        </button>
        {/* TODO: wire to API
        <button type="button">Resolve</button>
        */}
      </div>
    </ModalOverlay>
  );
}

export function AlertHistorySection({ memberName, history, loading = false, error = "" }) {
  const [open, setOpen] = useState(true);
  const [detail, setDetail] = useState(null);
  const [fullOpen, setFullOpen] = useState(false);
  const visible = history.slice(0, 5);

  return (
    <>
      <section className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4">
          <h2 className="text-[16px] font-bold text-white">Followup Status</h2>
          <ChevronIcon open={open} />
        </button>
        <div className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="mt-4 flex flex-col gap-2">
              {loading ? (
                <p className="py-4 text-center text-[12px] text-white/40">Loading followup history...</p>
              ) : error ? (
                <p className="py-4 text-center text-[12px] text-[#fb3748]">{error}</p>
              ) : visible.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-white/30">No followup history yet.</p>
              ) : (
                visible.map((entry) => (
                  <HistoryRow key={entry.uuid} entry={entry} onClick={() => setDetail(entry)} compact />
                ))
              )}
            </div>
            {history.length > 5 ? (
              <button
                type="button"
                onClick={() => setFullOpen(true)}
                className="mt-3 text-[12px] text-[#eaad2c] underline-offset-2 hover:underline"
              >
                See More
              </button>
            ) : null}
          </div>
        </div>
      </section>
      {detail ? <AlertHistoryDetailModal entry={detail} onClose={() => setDetail(null)} /> : null}
      {fullOpen ? (
        <AlertHistoryFullModal
          memberName={memberName}
          history={history}
          onClose={() => setFullOpen(false)}
          onSelect={(entry) => setDetail(entry)}
        />
      ) : null}
    </>
  );
}

export function AlertHistoryDetailModal({ entry, onClose }) {
  const remark = entryRemark(entry);
  return (
    <ModalOverlay onClose={onClose} zClass="z-[70]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <ModalTitle>Follow Up Detail</ModalTitle>
        <CloseButton onClick={onClose} />
      </div>
      <div className="mt-5 grid grid-cols-[80px_1fr] gap-3">
        <DetailLabel>Action:</DetailLabel>
        <div><ActionTypeChip type={entryAction(entry)} /></div>
        <DetailLabel>By:</DetailLabel>
        <DetailValue>{entry.pic}</DetailValue>
        <DetailLabel>Date:</DetailLabel>
        <DetailValue>{formatDisplayDate(entry.datetime)}</DetailValue>
        <DetailLabel>Note:</DetailLabel>
        <DetailValue>{remark || "-"}</DetailValue>
      </div>
    </ModalOverlay>
  );
}

function AlertHistoryFullModal({ memberName, history, onClose, onSelect }) {
  return (
    <ModalOverlay onClose={onClose} zClass="z-[60]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <ModalTitle>Followup Status - {memberName}</ModalTitle>
        <CloseButton onClick={onClose} />
      </div>
      <div className="mt-4 flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1 scrollbar-admin">
        {history.map((entry) => (
          <HistoryRow key={entry.uuid} entry={entry} onClick={() => onSelect(entry)} />
        ))}
      </div>
    </ModalOverlay>
  );
}

function HistoryHeader() {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
      <p className="text-[12px] font-medium text-[#fbeed2]">Follow Up History</p>
    </div>
  );
}

function HistoryList({ history }) {
  if (!history.length) {
    return <p className="py-6 text-center text-[12px] text-white/30">No follow ups yet.</p>;
  }
  return (
    <div className="mt-3 flex flex-col gap-2">
      {history.map((entry) => (
        <HistoryRow key={entry.uuid} entry={entry} />
      ))}
    </div>
  );
}

function HistoryRow({ entry, onClick, compact = false }) {
  const Wrapper = onClick ? "button" : "div";
  const action = entryAction(entry);
  const remark = entryRemark(entry);
  const palette = ACTION_COLORS[action] || ACTION_COLORS.Others;
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full rounded-[10px] border px-3 py-3 text-left shadow-[0_0_14px_rgba(222,162,32,0.08)] transition ${onClick ? "cursor-pointer hover:bg-white/5 hover:shadow-[0_0_18px_rgba(222,162,32,0.18)]" : ""}`}
      style={{ backgroundColor: "#090b10", borderColor: "rgba(242,203,122,0.18)", borderLeftColor: palette.ring, borderLeftWidth: 3 }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ActionTypeChip type={action} />
        <span className="text-[12px] font-medium text-white">{entry.pic}</span>
        <span className="text-[11px] text-white/50">- {formatDisplayDate(entry.datetime)}</span>
      </div>
      {remark ? (
        <p className={`mt-1 pl-1 text-[12px] italic text-white/60 ${compact ? "truncate" : "text-white/70"}`}>
          {remark}
        </p>
      ) : null}
    </Wrapper>
  );
}

function ModalOverlay({ children, onClose, zClass = "z-50" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 ${zClass} flex items-center justify-center px-4`} style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[16px] bg-[#05060a] p-6 shadow-[0_0_3px_0_#dea220]">
        {children}
      </div>
    </div>,
    document.body
  );
}

function ModalTitle({ children, className = "" }) {
  return (
    <h2
      className={`bg-clip-text text-transparent font-bold ${className}`}
      style={{
        backgroundImage: GRAD_GOLD,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: "22px",
        lineHeight: "33px",
        letterSpacing: "-1.5px",
      }}
    >
      {children}
    </h2>
  );
}

function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[6px] p-1 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f6dda6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DetailLabel({ children }) {
  return <span className="text-[12px] text-white/50">{children}</span>;
}

function DetailValue({ children }) {
  return <span className="text-[13px] text-white">{children}</span>;
}
