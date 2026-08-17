// Pin the zone before anything reads a Date: the date formatter renders in
// local time, so an unpinned TZ would make these assertions machine-dependent.
// +08:00 matches the offset the API returns.
process.env.TZ = "Asia/Kuala_Lumpur";

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildKpiDateRange,
  formatRedeemLinkDateTime,
  buildRedeemLinkPayload,
  buildRedeemShareUrl,
  describeRedeemLinkError,
  fromDateTimeLocalInput,
  getRedeemLinkStatus,
  mapRedeemLinkToForm,
  toDateTimeLocalInput,
  validateRedeemLinkForm,
} from "./redeemLinkUtils.mjs";

const validForm = {
  name: "Weekend Tokens",
  station: "2",
  stationUrl: "https://kgame99.com/login?a=1&b=2",
  rewardType: "1",
  amount: "10",
  quantity: "25",
  startDate: "2026-08-13T08:00",
  endDate: "2026-08-20T23:59",
};

test("maps API labels back to integer form choices for a full PUT", () => {
  assert.deepEqual(
    mapRedeemLinkToForm({
      name: "Merdeka BP",
      station: "KGAME99",
      station_url: "https://kgame99.com/",
      reward_type: "BATTLE POINT",
      amount: 5,
      quantity: 8,
      start_date: "2026-08-13T08:00:00+08:00",
      end_date: "2026-08-19T23:59:59+08:00",
    }),
    {
      name: "Merdeka BP",
      station: "2",
      stationUrl: "https://kgame99.com/",
      rewardType: "2",
      amount: "5",
      quantity: "8",
      startDate: "2026-08-13T08:00",
      endDate: "2026-08-19T23:59",
    },
  );
});

test("validates required values, positive integers, URL schemes, and date order", () => {
  assert.deepEqual(validateRedeemLinkForm(validForm), {});
  assert.deepEqual(validateRedeemLinkForm({
    ...validForm,
    name: " ",
    stationUrl: "kgame99.com",
    amount: "0",
    quantity: "1.5",
    startDate: "2026-08-20T10:00",
    endDate: "2026-08-19T10:00",
  }), {
    name: "Campaign name is required.",
    stationUrl: "Station URL must start with http:// or https://.",
    amount: "Amount must be a whole number of at least 1.",
    quantity: "Quantity must be a whole number of at least 1.",
    endDate: "End date cannot be earlier than start date.",
  });
});

test("builds the documented integer API payload", () => {
  assert.deepEqual(buildRedeemLinkPayload(validForm), {
    name: "Weekend Tokens",
    station: 2,
    station_url: "https://kgame99.com/login?a=1&b=2",
    reward_type: 1,
    amount: 10,
    quantity: 25,
    // TZ is pinned to +08:00, so 08:00 local is midnight UTC.
    start_date: "2026-08-13T00:00:00.000Z",
    end_date: "2026-08-20T15:59:00.000Z",
  });
});

test("round-trips an API instant through the datetime-local input unchanged", () => {
  const apiValue = "2026-08-13T08:30:00+08:00";
  const forInput = toDateTimeLocalInput(apiValue);
  assert.equal(forInput, "2026-08-13T08:30");
  // Back out to an instant: the same moment the API sent, to the minute.
  assert.equal(
    new Date(fromDateTimeLocalInput(forInput)).getTime(),
    new Date(apiValue).getTime(),
  );
});

test("datetime-local conversions ignore missing and unparseable values", () => {
  assert.equal(toDateTimeLocalInput(null), "");
  assert.equal(toDateTimeLocalInput(""), "");
  assert.equal(toDateTimeLocalInput("not a date"), "");
  assert.equal(fromDateTimeLocalInput(""), "");
  assert.equal(fromDateTimeLocalInput("not a date"), "");
});

test("a local wall clock is sent as a zoned instant, not a bare string", () => {
  // +08:00 admin types 00:00 on the 1st -> 16:00Z on the previous day.
  assert.equal(fromDateTimeLocalInput("2026-08-01T00:00"), "2026-07-31T16:00:00.000Z");
});

test("extracts useful messages from all live API error envelope shapes", () => {
  assert.equal(describeRedeemLinkError({ data: { details: "Already archived" } }), "Already archived");
  assert.equal(
    describeRedeemLinkError({ data: { details: { station_url: ["Enter a valid URL."], amount: ["Minimum is 1."] } } }),
    "Enter a valid URL. Minimum is 1.",
  );
  assert.equal(describeRedeemLinkError({ data: { detail: "Not found" } }), "Not found");
  assert.equal(describeRedeemLinkError({ message: "Network failed" }), "Network failed");
});

test("maps availability reasons to readable status metadata", () => {
  assert.deepEqual(getRedeemLinkStatus(null), { label: "Available", tone: "success" });
  assert.deepEqual(getRedeemLinkStatus("Redeem link has not started yet"), { label: "Scheduled", tone: "info" });
  assert.deepEqual(getRedeemLinkStatus("Redeem link has expired"), { label: "Expired", tone: "warning" });
  assert.deepEqual(getRedeemLinkStatus("Redeem link quota is full"), { label: "Quota Full", tone: "danger" });
  assert.deepEqual(getRedeemLinkStatus("Redeem link is no longer available"), { label: "Archived", tone: "neutral" });
});

test("builds a share URL only from the supplied current origin and encodes parameters", () => {
  assert.equal(
    buildRedeemShareUrl(
      "https://staging-member.example.com/admin/redeem-links",
      "https://kgame99.com/login?a=1&b=two words",
      "14978c8a-f27f-40a5-ba97-dfbecfd835bb",
    ),
    "https://staging-member.example.com/?o=https%3A%2F%2Fkgame99.com%2Flogin%3Fa%3D1%26b%3Dtwo+words&reward=14978c8a-f27f-40a5-ba97-dfbecfd835bb",
  );
});

test("Daily reports on yesterday, not today", () => {
  assert.deepEqual(
    buildKpiDateRange("Daily", "", "", new Date(2026, 7, 17)),
    { from_date: "2026-08-16", to_date: "2026-08-16" },
  );
});

test("Daily rolls back across month and year boundaries", () => {
  assert.deepEqual(
    buildKpiDateRange("Daily", "", "", new Date(2026, 8, 1)),
    { from_date: "2026-08-31", to_date: "2026-08-31" },
  );
  assert.deepEqual(
    buildKpiDateRange("Daily", "", "", new Date(2026, 0, 1)),
    { from_date: "2025-12-31", to_date: "2025-12-31" },
  );
});

test("Monthly spans the current calendar month, including leap February", () => {
  assert.deepEqual(
    buildKpiDateRange("Monthly", "", "", new Date(2026, 7, 17)),
    { from_date: "2026-08-01", to_date: "2026-08-31" },
  );
  assert.deepEqual(
    buildKpiDateRange("Monthly", "", "", new Date(2024, 1, 10)),
    { from_date: "2024-02-01", to_date: "2024-02-29" },
  );
});

test("Yearly spans the current calendar year", () => {
  assert.deepEqual(
    buildKpiDateRange("Yearly", "", "", new Date(2026, 7, 17)),
    { from_date: "2026-01-01", to_date: "2026-12-31" },
  );
});

test("an explicit picker range overrides the selected period", () => {
  assert.deepEqual(
    buildKpiDateRange("Yearly", "2026-03-01", "2026-03-15", new Date(2026, 7, 17)),
    { from_date: "2026-03-01", to_date: "2026-03-15" },
  );
});

// The endpoint rejects a half-filled range with 400, so a lone bound must fall
// back to the period default rather than being forwarded.
test("a half-filled range falls back to the period default", () => {
  assert.deepEqual(
    buildKpiDateRange("Daily", "2026-03-01", "", new Date(2026, 7, 17)),
    { from_date: "2026-08-16", to_date: "2026-08-16" },
  );
  assert.deepEqual(
    buildKpiDateRange("Daily", "", "2026-03-15", new Date(2026, 7, 17)),
    { from_date: "2026-08-16", to_date: "2026-08-16" },
  );
});

// TZ is pinned to Asia/Kuala_Lumpur (+08:00) by the runner below, matching the
// offset the API returns, so these assertions are stable across machines.
test("renders API timestamps as dd/mm/yyyy hh:mm", () => {
  assert.equal(formatRedeemLinkDateTime("2026-08-10T08:00:00+08:00"), "10/08/2026 08:00");
  assert.equal(formatRedeemLinkDateTime("2026-10-01T07:59:59+08:00"), "01/10/2026 07:59");
});

test("zero-pads single-digit days, months, and times", () => {
  assert.equal(formatRedeemLinkDateTime("2026-01-05T09:07:00+08:00"), "05/01/2026 09:07");
  assert.equal(formatRedeemLinkDateTime("2026-01-05T00:00:00+08:00"), "05/01/2026 00:00");
});

test("keeps a 4-digit year and 24-hour clock rather than am/pm", () => {
  assert.equal(formatRedeemLinkDateTime("2026-12-31T23:45:00+08:00"), "31/12/2026 23:45");
});

test("falls back gracefully for missing and unparseable values", () => {
  assert.equal(formatRedeemLinkDateTime(null), "-");
  assert.equal(formatRedeemLinkDateTime(""), "-");
  assert.equal(formatRedeemLinkDateTime(undefined), "-");
  assert.equal(formatRedeemLinkDateTime("not a date"), "not a date");
});
