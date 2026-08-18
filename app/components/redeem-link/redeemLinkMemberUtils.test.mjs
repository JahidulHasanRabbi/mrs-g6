import test from "node:test";
import assert from "node:assert/strict";

import {
  describeRedeemFailure,
  describeReward,
  readRedeemParams,
  safeStationUrl,
} from "./redeemLinkMemberUtils.mjs";

test("describes each reward type in its own units", () => {
  assert.equal(describeReward({ reward_type: "TOKEN", amount: 30 }), "30 Tokens");
  assert.equal(describeReward({ reward_type: "BATTLE POINT", amount: 250 }), "250 Battle Points");
  assert.equal(describeReward({ reward_type: "FREE CREDIT", amount: 25 }), "RM 25 Free Credit");
});

test("singularises a reward of one and groups thousands", () => {
  assert.equal(describeReward({ reward_type: "TOKEN", amount: 1 }), "1 Token");
  assert.equal(describeReward({ reward_type: "BATTLE POINT", amount: 1 }), "1 Battle Point");
  assert.equal(describeReward({ reward_type: "TOKEN", amount: 2000 }), "2,000 Tokens");
});

// A reward type added on the backend must still show its amount rather than
// rendering as an empty or broken string.
test("keeps the amount visible for an unknown reward type", () => {
  assert.equal(describeReward({ reward_type: "MYSTERY BOX", amount: 5 }), "5 MYSTERY BOX");
  assert.equal(describeReward({}), "0");
  assert.equal(describeReward(null), "0");
});

test("reads both share-link params from the query string", () => {
  const params = new URLSearchParams("o=https%3A%2F%2Fn1gang.net%2F&reward=abc-123");
  assert.deepEqual(readRedeemParams(params), {
    linkUuid: "abc-123",
    origin: "https://n1gang.net/",
  });
  assert.deepEqual(readRedeemParams(new URLSearchParams("")), { linkUuid: "", origin: "" });
});

test("accepts http(s) station URLs and adds a scheme to a bare host", () => {
  assert.equal(safeStationUrl("https://kgame99.com/login"), "https://kgame99.com/login");
  assert.equal(safeStationUrl("n1gang.net"), "https://n1gang.net/");
  assert.equal(safeStationUrl("http://ep369.com/"), "http://ep369.com/");
});

// The origin arrives from the query string, so a non-http scheme must never be
// turned into something navigable.
test("rejects non-http schemes and unusable values", () => {
  assert.equal(safeStationUrl("javascript:alert(1)"), "");
  assert.equal(safeStationUrl("data:text/html,<script>"), "");
  assert.equal(safeStationUrl(""), "");
  assert.equal(safeStationUrl(null), "");
});

// Every documented 400 reason is restated for a member. "Quota is full" in
// particular must read as "run out", not as an admin quota setting.
test("restates each API failure reason in member-facing language", () => {
  const cases = [
    ["You have already redeemed this link", "You have already claimed this reward."],
    ["Redeem link quota is full", "This reward has run out. All of them have been claimed."],
    ["Redeem link is no longer available", "This reward is no longer available."],
    ["Redeem link has not started yet", "This reward isn't available yet. Please check back later."],
    ["Redeem link has expired", "This reward has ended."],
    ["Redeem Link: abc-123 does not exist", "This reward link is not valid."],
  ];
  for (const [raw, expected] of cases) {
    assert.equal(describeRedeemFailure({ data: { details: raw } }), expected, raw);
  }
});

// These name internal configuration, so the raw text must never reach a member.
test("hides FREE CREDIT setup problems behind a support message", () => {
  assert.equal(
    describeRedeemFailure({ data: { details: "Member is not linked to a station" } }),
    "We couldn't verify your account for this reward. Please contact support.",
  );
  assert.equal(
    describeRedeemFailure({ data: { details: "No promotion code configured for this station" } }),
    "This reward isn't ready yet. Please try again later or contact support.",
  );
});

test("reads the reason out of a field-keyed details object too", () => {
  assert.equal(
    describeRedeemFailure({ data: { details: { amount: ["Redeem link quota is full"] } } }),
    "This reward has run out. All of them have been claimed.",
  );
});

// An unrecognised backend string is admin-authored text of unknown wording, so
// it is replaced rather than shown raw.
test("falls back to the generic message for unknown or missing reasons", () => {
  assert.equal(describeRedeemFailure({}), "Could not redeem this reward. Please try again.");
  assert.equal(
    describeRedeemFailure({ data: { detail: "IntegrityError at /redemption/" } }),
    "Could not redeem this reward. Please try again.",
  );
});
