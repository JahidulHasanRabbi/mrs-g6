"use client";

function walletVipTierName(tier) {
  if (!tier) return "";
  return tier.name || tier.tier_name || tier.level || tier.vip_level || tier.title || tier.uuid || "";
}

function normalizeWalletVipName(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function displayWalletVipName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

export function uniqueWalletVipTierNames(tiers = []) {
  const seen = new Set();
  const names = [];

  for (const tier of Array.isArray(tiers) ? tiers : []) {
    const display = displayWalletVipName(walletVipTierName(tier));
    const key = normalizeWalletVipName(display);
    if (!display || !key || seen.has(key)) continue;
    seen.add(key);
    names.push(display);
  }

  return names;
}

export function uniqueWalletVipTierOptions(tiers = []) {
  return uniqueWalletVipTierNames(tiers).map((name) => ({
    value: name,
    label: name,
  }));
}
