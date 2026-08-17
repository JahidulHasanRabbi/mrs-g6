import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRedeemLinkPayload,
  buildRedeemShareUrl,
  describeRedeemLinkError,
  getRedeemLinkStatus,
  mapRedeemLinkToForm,
  validateRedeemLinkForm,
} from "./redeemLinkUtils.mjs";

const validForm = {
  name: "Weekend Tokens",
  station: "2",
  stationUrl: "https://kgame99.com/login?a=1&b=2",
  rewardType: "1",
  amount: "10",
  quantity: "25",
  startDate: "2026-08-13",
  endDate: "2026-08-20",
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
      start_date: "2026-08-13",
      end_date: "2026-08-19",
    }),
    {
      name: "Merdeka BP",
      station: "2",
      stationUrl: "https://kgame99.com/",
      rewardType: "2",
      amount: "5",
      quantity: "8",
      startDate: "2026-08-13",
      endDate: "2026-08-19",
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
    startDate: "2026-08-20",
    endDate: "2026-08-19",
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
    start_date: "2026-08-13",
    end_date: "2026-08-20",
  });
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
