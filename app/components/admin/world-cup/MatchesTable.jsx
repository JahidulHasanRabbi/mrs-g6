"use client";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";
const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 3 3-11 11H7.5v-3l11-11Z" />
    </svg>
  );
}

const STATUS_STYLES = {
  Closed:   { bg: "#0f3e16", border: "#3ad26a", color: "#3ad26a" },
  Upcoming: { bg: "#3a2810", border: "#eaad2c", color: "#eaad2c" },
  Settled:  { bg: "#2a2a2a", border: "#9a9a9a", color: "#d6d6d6" },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      {status}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const [, year, mm, dd] = match;
  const yy = year.slice(-2);
  return `${dd}.${mm}.${yy}`;
}

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [hRaw, mRaw] = hhmm.split(":");
  const h = parseInt(hRaw, 10);
  const m = (mRaw ?? "00").padStart(2, "0");
  if (Number.isNaN(h)) return hhmm;
  const suffix = h >= 12 ? "pm" : "am";
  const hh = ((h + 11) % 12) + 1;
  return `${String(hh).padStart(2, "0")}.${m}${suffix}`;
}

export default function MatchesTable({ matches = [], onEdit }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Match No.</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Team 1</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Team 2</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Date</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Time</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Prediction</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Winner</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Status</th>
              <th className="px-5 py-4 text-right text-[13px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No matches yet. Click "Add Match" to create one.
                </td>
              </tr>
            ) : (
              matches.map((m) => (
                <tr key={m.id} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{m.matchNo}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.team1}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.team2}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{formatDate(m.date)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{formatTime(m.time)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.predictionA} : {m.predictionB}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.winner || "-"}</td>
                  <td className="px-5 py-5"><StatusPill status={m.status} /></td>
                  <td className="px-5 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit?.(m)}
                      className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-3 py-1.5 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
                      style={{ backgroundImage: GOLD_BG }}
                    >
                      <EditIcon />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
