// Shared period-filter mapping for the World Cup admin dashboard + ranking
// tables, so both call `/worldcup/dashboard/kpi/` and
// `/worldcup/ranking/realtime/` with the same `period`/`from_date`/`to_date`
// query params per the selected filter.

export const PERIOD_OPTIONS = ["All", "Daily", "Monthly", "Yearly"];

export function periodFilterParams(period, range) {
  if (period === "Date" && range?.from && range?.to) {
    return { from_date: range.from, to_date: range.to };
  }
  if (period === "Daily") return { period: 1 };
  if (period === "Monthly") return { period: 2 };
  if (period === "Yearly") return { period: 3 };
  return {};
}
