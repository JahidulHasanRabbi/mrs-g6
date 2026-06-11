export const PERIOD_OPTIONS = ["Daily", "Monthly", "Yearly"];
export const KPI_PERIOD_OPTIONS = ["Daily"];

export function periodFilterParams(period, range) {
  if (period === "Date" && range?.from && range?.to) {
    return { from_date: range.from, to_date: range.to };
  }
  if (period === "Monthly") return { period: 2 };
  if (period === "Yearly") return { period: 3 };
  // Daily (the default) and any unknown value fall back to period=1 so the
  // API never receives an unscoped request.
  return { period: 1 };
}

export function kpiFilterParams(period, range) {
  if (period === "Date" && range?.from && range?.to) {
    return { from_date: range.from, to_date: range.to };
  }
  return { period: 1 };
}
