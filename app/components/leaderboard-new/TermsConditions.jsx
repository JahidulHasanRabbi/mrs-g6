"use client";

export default function TermsConditions({ terms = [], color = "#ff8c00" }) {
  const rows = Array.isArray(terms) ? terms.filter(Boolean) : [];

  return (
    <div
      className="w-full min-h-[180px] rounded-2xl px-6 py-8 flex flex-col gap-8"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(35,31,20,0.7)",
        border: "1px solid rgba(255,246,223,0.15)",
      }}
    >
      <h3
        className="text-base font-bold text-[#fff6df]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Terms &amp; Conditions
      </h3>

      <div className="flex flex-col gap-4">
        {rows.map((text, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span
              className="text-sm shrink-0"
              style={{ color, fontFamily: "var(--font-inter)" }}
            >
              {String(i + 1).padStart(2, "0")}.
            </span>
            <p
              className="text-sm text-[#ddc1ae] flex-1"
              style={{ fontFamily: "var(--font-inter)", lineHeight: "22.75px" }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}