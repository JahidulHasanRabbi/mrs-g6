"use client";

/**
 * Sort indicator arrows — highlights gold when active.
 */
export function SortIcon({ active, direction }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 ml-0.5">
      <path
        d="M4 5L7 2L10 5"
        stroke={active && direction === "asc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={active && direction === "desc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Pagination with Previous / numbered pages / Next.
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 pt-4 pr-2 pb-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-['Times_New_Roman'] text-[13px] text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 italic"
      >
        Previous
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} className="font-['Times_New_Roman'] text-[13px] text-white/40 px-1">
            ...
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`font-['Times_New_Roman'] text-[13px] min-w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${
              currentPage === page
                ? "bg-[#e9af41] text-black font-bold"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-['Times_New_Roman'] text-[13px] text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 italic"
      >
        Next
      </button>
    </div>
  );
}

/**
 * Generic sortable data table.
 *
 * @param {Object}   props
 * @param {Array}    props.columns      - { key, label, minW?, align? }
 * @param {Array}    props.rows         - data rows
 * @param {string}   props.sortKey      - currently sorted column key
 * @param {string}   props.sortDir      - "asc" | "desc"
 * @param {Function} props.onSort       - (key) => void
 * @param {Function} props.renderCell   - (row, column) => ReactNode
 * @param {string}   props.emptyMessage - shown when rows is empty
 */
export function DataTable({
  columns,
  rows,
  sortKey,
  sortDir,
  onSort,
  renderCell,
  emptyMessage = "No records found.",
}) {
  return (
    <div className="overflow-x-auto scrollbar-admin rounded-lg">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-black">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.minW || ""} px-3 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors`}
                onClick={() => onSort(col.key)}
              >
                <div className={`flex items-center ${col.align === "right" ? "justify-end" : "justify-start"}`}>
                  <span className="font-['Times_New_Roman'] font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                    {col.label}
                  </span>
                  <SortIcon active={sortKey === col.key} direction={sortDir} />
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center font-['Times_New_Roman'] text-white/40"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
