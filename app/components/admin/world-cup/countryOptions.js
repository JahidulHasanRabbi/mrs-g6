"use client";

import { LEADERBOARD_COUNTRY_MAP, MATCH_COUNTRY_MAP } from "../../../lib/worldcupCountries";

export function normalizeCountryOptions(response) {
  const data = response?.results ?? response;
  let rows = [];

  if (Array.isArray(data)) {
    rows = data;
  } else if (Array.isArray(data?.tiers)) {
    rows = data.tiers.flatMap((tier) => tier.countries ?? []);
  } else if (Array.isArray(data?.countries)) {
    rows = data.countries;
  }

  const normalized = rows
    .map((country) => {
      const id = country.id ?? country.country ?? country.uuid;
      const name = country.name ?? country.country_name;
      if (id == null || !name) return null;
      return { ...country, id, name };
    })
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized.sort((a, b) => Number(a.id) - Number(b.id));
  }

  return Object.entries(LEADERBOARD_COUNTRY_MAP).map(([id, country]) => ({
    id: Number(id),
    name: country.name,
    tier: country.tier,
  }));
}

export function normalizeMatchCountryOptions(response) {
  const data = response?.results ?? response;
  const rows = Array.isArray(data) ? data : [];
  const normalized = rows
    .map((country) => {
      const id = country.id ?? country.country;
      const name = country.name ?? country.country_name;
      if (id == null || !name) return null;
      return { ...country, id, name };
    })
    .filter(Boolean);

  if (normalized.length > 0) return normalized;

  return Object.entries(MATCH_COUNTRY_MAP).map(([id, country]) => ({
    id: Number(id),
    name: country.name,
  }));
}
