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

test("surfaces the API's own failure reason to the member", () => {
  assert.equal(
    describeRedeemFailure({ data: { details: "You have already redeemed this link" } }),
    "You have already redeemed this link",
  );
  assert.equal(
    describeRedeemFailure({ data: { details: { amount: ["Quota is full."] } } }),
    "Quota is full.",
  );
  assert.equal(describeRedeemFailure({ data: { detail: "Not found" } }), "Not found");
});

test("falls back to member-appropriate wording when the API says nothing useful", () => {
  assert.equal(
    describeRedeemFailure({}),
    "Could not redeem this reward. Please try again.",
  );
});
