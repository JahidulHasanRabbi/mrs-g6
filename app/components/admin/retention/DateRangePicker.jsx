"use client";

// Thin wrapper around the shared admin RangePicker so existing retention
// call-sites (pic-dashboard, PeriodToggle) keep working with the same
// `{fromDate, toDate, onApply}` API. The actual UI — preset rail, two-month
// calendar, single Apply — lives in app/components/admin/RangePicker.jsx.

import RangePicker from "../RangePicker";

export default function DateRangePicker({ fromDate, toDate, onApply }) {
  return <RangePicker fromDate={fromDate} toDate={toDate} onApply={onApply} />;
}
