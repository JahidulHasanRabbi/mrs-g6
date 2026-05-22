"use client";

/**
 * Skeleton primitives + page-shaped presets.
 *
 * Layout fidelity: pages pass column descriptors with a `type` so the skeleton
 * draws shapes that actually match the real cells:
 *
 *   columns={[
 *     { label: "Preview",      type: "image"   },
 *     { label: "Name",         type: "text"    },
 *     { label: "Location",     type: "badge"   },
 *     { label: "Link (Slug)",  type: "link"    },
 *     { label: "Active Until", type: "datetime"},
 *     { label: "Status",       type: "status"  },
 *     { label: "Actions",      type: "actions", count: 2 },
 *   ]}
 *
 * Backwards-compat: passing `columnLabels={["A","B"]}` still works — every cell
 * defaults to a text bar.
 *
 * Available cell types:
 *   text      — single text bar (~60-80% width)
 *   longText  — wider bar (~90%)
 *   number    — short right-aligned bar
 *   link      — gold-tinted text bar
 *   image     — 64x44 thumbnail square
 *   avatar    — 32x32 circle
 *   badge     — pill ~90px wide
 *   status    — pill with leading dot (~80px)
 *   datetime  — two stacked text bars (date + time)
 *   actions   — N button-shaped pills side by side (default 2)
 *   toggle    — switch-shaped pill
 */

const SHIMMER =
  "relative overflow-hidden bg-white/[0.06] " +
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] " +
  "before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent";

const GOLD_SHIMMER =
  "relative overflow-hidden bg-[#e9af41]/30 " +
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] " +
  "before:bg-gradient-to-r before:from-transparent before:via-[#e9af41]/30 before:to-transparent";

/* ---------- Primitives ---------- */

function Box({ className = "", style }) {
  return <div className={`rounded ${SHIMMER} ${className}`} style={style} />;
}

function Text({ lines = 1, width, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const w = width || (i === lines - 1 ? "70%" : "100%");
        return <div key={i} className={`h-3 rounded ${SHIMMER}`} style={{ width: w }} />;
      })}
    </div>
  );
}

function Circle({ size = 32, className = "" }) {
  return <div className={`rounded-full ${SHIMMER} ${className}`} style={{ width: size, height: size }} />;
}

function Pill({ width = 70, className = "" }) {
  return <div className={`h-5 rounded-full ${SHIMMER} ${className}`} style={{ width }} />;
}

/* ---------- Cells (layout-aware) ---------- */

function Cell({ type = "text", count = 2, align = "left" }) {
  switch (type) {
    case "image":
      return <div className={`h-14 w-24 rounded ${SHIMMER}`} />;
    case "avatar":
      return <Circle size={32} />;
    case "longText":
      return <div className={`h-3 w-[90%] rounded ${SHIMMER}`} />;
    case "number":
      return <div className={`h-3 w-12 rounded ${SHIMMER} ${align === "right" ? "ml-auto" : ""}`} />;
    case "link":
      return <div className="h-3 w-32 rounded bg-[#e9af41]/15 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#e9af41]/25 before:to-transparent" />;
    case "badge":
      return <div className={`h-6 w-20 rounded-full ${SHIMMER}`} />;
    case "status":
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04]">
          <span className={`w-1.5 h-1.5 rounded-full ${SHIMMER}`} />
          <span className={`h-3 w-12 rounded ${SHIMMER}`} />
        </div>
      );
    case "datetime":
      return (
        <div className="space-y-1.5">
          <div className={`h-3 w-20 rounded ${SHIMMER}`} />
          <div className={`h-2.5 w-14 rounded ${SHIMMER}`} />
        </div>
      );
    case "actions":
      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`h-8 w-16 rounded-md ${SHIMMER}`} />
          ))}
        </div>
      );
    case "toggle":
      return <div className={`h-6 w-11 rounded-full ${SHIMMER}`} />;
    case "text":
    default:
      // Deterministic varied widths — avoids SSR/CSR hydration mismatch
      // We can't seed by row here, so callers see the same width across rows;
      // TableRow injects a per-row seed below for variety.
      return <div className={`h-3 rounded ${SHIMMER}`} style={{ width: "75%" }} />;
  }
}

// Deterministic width variation by (rowIndex, colIndex) so rows look varied
// but server/client render identical markup. Stable across renders.
function varyWidth(row, col) {
  const widths = ["55%", "62%", "70%", "78%", "85%", "65%", "60%", "73%"];
  return widths[(row * 7 + col * 3) % widths.length];
}

function TableRow({ cols, rowIndex = 0, dense = false }) {
  return (
    <tr className="border-b border-[rgba(240,240,240,0.2)]">
      {cols.map((c, i) => (
        <td
          key={i}
          className={`px-3 ${dense ? "py-3" : c.type === "image" || c.type === "avatar" ? "py-3" : "py-4"} ${c.align === "right" ? "text-right" : ""}`}
        >
          {c.type === "number" || c.align === "right" ? (
            <div className="flex justify-end">
              <Cell type={c.type} count={c.count} align="right" />
            </div>
          ) : c.type === "text" || !c.type ? (
            <div className={`h-3 rounded ${SHIMMER}`} style={{ width: varyWidth(rowIndex, i) }} />
          ) : (
            <Cell type={c.type} count={c.count} />
          )}
        </td>
      ))}
    </tr>
  );
}

/* ---------- Page chrome ---------- */

/**
 * Header bar that mirrors text-4xl h1 + gold CTA button on the right.
 * Sizes match the real chrome so the title placeholder doesn't look like a tiny pill.
 */
function PageHeader({ withCta = true, ctaWidth = 170, titleWidth = 360 }) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div className={`h-10 rounded-md ${SHIMMER}`} style={{ width: titleWidth }} />
      {withCta && (
        <div
          className={`h-10 rounded-md ${GOLD_SHIMMER}`}
          style={{ width: ctaWidth }}
        />
      )}
    </div>
  );
}

/* ---------- Presets ---------- */

/**
 * Generic table page: header → optional filter row → table card → pagination strip.
 *
 * @param {Object} props
 * @param {string[]} [props.columnLabels] - legacy: just labels, every cell is text
 * @param {Array<{label:string,type?:string,count?:number,align?:string}>} [props.columns] - rich descriptors
 * @param {number} [props.rows=6]
 * @param {boolean} [props.withFilters=true]
 * @param {boolean} [props.withCta=true]
 * @param {boolean} [props.withHeader=true]
 * @param {boolean} [props.withCard=true]
 * @param {number} [props.titleWidth] - override header title width to match the real page title length
 */
function TablePage({
  columnLabels,
  columns,
  rows = 6,
  withFilters = true,
  withCta = true,
  withHeader = true,
  withCard = true,
  titleWidth,
  ctaWidth,
  bare = false,
}) {
  const cols =
    columns ??
    (columnLabels ?? Array.from({ length: 6 })).map((label) => ({
      label: typeof label === "string" ? label : "",
      type: "text",
    }));

  const wrapper = withCard
    ? "rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
    : "";

  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare
    ? "" // when embedded inside an existing page's <main>, don't double the padding
    : "min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10";

  return (
    <Wrapper className={wrapperCls}>
      {withHeader && !bare && <PageHeader withCta={withCta} titleWidth={titleWidth} ctaWidth={ctaWidth} />}

      <div className={wrapper}>
        {withFilters && (
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4">
            <div className={`h-9 w-64 rounded-md ${SHIMMER}`} />
            <div className={`h-9 w-40 rounded-md ${SHIMMER}`} />
            <div className={`h-9 w-32 rounded-md ${SHIMMER}`} />
            <div className="ml-auto flex gap-2">
              <div className={`h-9 w-9 rounded-md ${SHIMMER}`} />
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-admin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-black">
                {cols.map((c, i) => (
                  <th
                    key={i}
                    className={`px-3 py-3 ${c.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {c.label ? (
                      <span className="font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                        {c.label}
                      </span>
                    ) : (
                      <div className={`h-3 w-24 rounded ${SHIMMER}`} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} rowIndex={i} cols={cols} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
          <div className={`h-7 w-16 rounded ${SHIMMER}`} />
          <div className={`h-7 w-7 rounded ${SHIMMER}`} />
          <div className={`h-7 w-7 rounded ${SHIMMER}`} />
          <div className={`h-7 w-7 rounded ${SHIMMER}`} />
          <div className={`h-7 w-16 rounded ${SHIMMER}`} />
        </div>
      </div>
    </Wrapper>
  );
}

/**
 * Form page: header → grouped label/input pairs → action row.
 */
function FormPage({ fields = 5, withHeader = true, withFileField = false, bare = false }) {
  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare ? "" : "min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10";
  return (
    <Wrapper className={wrapperCls}>
      {withHeader && !bare && <PageHeader />}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 max-w-3xl">
        <div className="space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i}>
              <div className={`h-3 w-32 mb-2 rounded ${SHIMMER}`} />
              <div className={`h-10 w-full rounded ${SHIMMER}`} />
            </div>
          ))}
          {withFileField && (
            <div>
              <div className={`h-3 w-28 mb-2 rounded ${SHIMMER}`} />
              <div className={`h-40 w-full rounded ${SHIMMER}`} />
            </div>
          )}
        </div>
        <div className="mt-8 flex gap-3">
          <div className={`h-10 w-32 rounded-md ${GOLD_SHIMMER}`} />
          <div className={`h-10 w-24 rounded-md ${SHIMMER}`} />
        </div>
      </div>
    </Wrapper>
  );
}

/**
 * Dashboard page: header → stat-card grid → chart placeholder.
 */
function Dashboard({ cards = 4, withChart = true, withHeader = true, bare = false }) {
  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare ? "" : "min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10";
  return (
    <Wrapper className={wrapperCls}>
      {withHeader && !bare && <PageHeader withCta={false} titleWidth={320} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 h-[130px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className={`h-3 w-24 rounded ${SHIMMER}`} />
              <Circle size={28} />
            </div>
            <div className={`h-8 w-36 rounded ${SHIMMER}`} />
            <div className={`h-2.5 w-20 rounded ${SHIMMER}`} />
          </div>
        ))}
      </div>
      {withChart && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-5">
            <div className={`h-4 w-40 rounded ${SHIMMER}`} />
            <div className={`h-8 w-32 rounded ${SHIMMER}`} />
          </div>
          {/* Chart placeholder with vertical bars to suggest a bar chart */}
          <div className="h-[280px] w-full rounded relative overflow-hidden bg-white/[0.02] p-4">
            <div className="absolute inset-4 flex items-end justify-between gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${SHIMMER}`}
                  style={{ height: `${30 + ((i * 17) % 60)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

/**
 * Card-grid page: header → uniform image-cards (frames, banners thumbnails, floating menus).
 */
function CardGrid({ cards = 8, columns = 4, withHeader = true, bare = false }) {
  const cls =
    columns === 3 ? "lg:grid-cols-3" : columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4";
  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare ? "" : "min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10";
  return (
    <Wrapper className={wrapperCls}>
      {withHeader && !bare && <PageHeader />}
      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${cls}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className={`h-44 w-full ${SHIMMER}`} />
            <div className="p-4 space-y-2">
              <div className={`h-4 w-3/4 rounded ${SHIMMER}`} />
              <div className={`h-3 w-1/2 rounded ${SHIMMER}`} />
              <div className="flex gap-2 pt-3">
                <div className={`h-8 w-16 rounded ${SHIMMER}`} />
                <div className={`h-8 w-20 rounded ${SHIMMER}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/**
 * Tabbed page: header → tab strip → table body.
 */
function TabbedPage({ tabs = 4, columns, columnLabels, rows = 6, bare = false, withHeader = true }) {
  const cols =
    columns ??
    (columnLabels ?? Array.from({ length: 5 })).map((label) => ({
      label: typeof label === "string" ? label : "",
      type: "text",
    }));
  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare ? "" : "min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10";
  return (
    <Wrapper className={wrapperCls}>
      {withHeader && !bare && <PageHeader withCta={false} titleWidth={300} />}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: tabs }).map((_, i) => (
          <div
            key={i}
            className={`h-10 w-36 rounded-md ${i === 0 ? GOLD_SHIMMER : SHIMMER}`}
          />
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-black">
                {cols.map((c, i) => (
                  <th key={i} className="px-3 py-3 text-left">
                    {c.label ? (
                      <span className="font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                        {c.label}
                      </span>
                    ) : (
                      <div className={`h-3 w-24 rounded ${SHIMMER}`} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} rowIndex={i} cols={cols} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Wrapper>
  );
}

/**
 * Detail page: header → 2-column info grid → related table.
 * Used for member detail, PIC detail, etc.
 */
function DetailPage({ withRelatedTable = true, infoFields = 8, bare = false }) {
  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare ? "" : "min-h-screen xl:admin-content-pl pr-10 pt-10 pb-10";
  return (
    <Wrapper className={wrapperCls}>
      {!bare && <PageHeader titleWidth={400} />}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Circle size={56} />
          <div className="flex-1 space-y-2">
            <div className={`h-5 w-48 rounded ${SHIMMER}`} />
            <div className={`h-3 w-32 rounded ${SHIMMER}`} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
          {Array.from({ length: infoFields }).map((_, i) => (
            <div key={i}>
              <div className={`h-2.5 w-20 mb-2 rounded ${SHIMMER}`} />
              <div className={`h-4 w-28 rounded ${SHIMMER}`} />
            </div>
          ))}
        </div>
      </div>
      {withRelatedTable && (
        <TablePage bare withHeader={false} withFilters={false} rows={5} columns={[
          { label: "", type: "text" },
          { label: "", type: "text" },
          { label: "", type: "status" },
          { label: "", type: "datetime" },
        ]} />
      )}
    </Wrapper>
  );
}

const Skeleton = {
  Box,
  Text,
  Circle,
  Pill,
  Cell,
  TableRow,
  PageHeader,
  TablePage,
  FormPage,
  Dashboard,
  CardGrid,
  TabbedPage,
  DetailPage,
};

export default Skeleton;
export { Box, Text, Circle, Pill, Cell, TableRow, PageHeader, TablePage, FormPage, Dashboard, CardGrid, TabbedPage, DetailPage, SHIMMER, GOLD_SHIMMER };
