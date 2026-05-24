"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SEED_BANNERS = [
  {
    id: "b1",
    title: "BECOME TOP 10 PLAYERS",
    subtitle: "Join a country to start earning XP and climbing the ranks!",
    label: "Exclusive Rewards",
    section: "Real-time Rankings",
    description: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others.",
    image: null,
  },
  {
    id: "b2",
    title: "BECOME TOP 10 PLAYERS",
    subtitle: "Join a country to start earning XP and climbing the ranks!",
    label: "Exclusive Rewards",
    section: "Real-time Rankings",
    description: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others.",
    image: null,
  },
  {
    id: "b3",
    title: "BECOME TOP 10 PLAYERS",
    subtitle: "Join a country to start earning XP and climbing the ranks!",
    label: "Exclusive Rewards",
    section: "Real-time Rankings",
    description: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others.",
    image: null,
  },
];

const SEED_REWARDS = [
  { id: "r1", name: "1st Place", quantity: 20, itemType: "Top Country", country: "Brazil",    description: "This prize will be given to the winner",  image: null },
  { id: "r2", name: "4th Place", quantity: 5,  itemType: "Top Country", country: "Argentina", description: "Special mention for commitment",          image: null },
  { id: "r3", name: "3rd Place", quantity: 10, itemType: "Top Country", country: "USA",       description: "Recognized for significant achievements", image: null },
  { id: "r4", name: "2nd Place", quantity: 15, itemType: "Top Country", country: "Germany",   description: "Awarded for outstanding performance",     image: null },
  { id: "r5", name: "5th Place", quantity: 3,  itemType: "Top Country", country: "England",   description: "Participation recognition",               image: null },
  { id: "r6", name: "1st Place", quantity: 20, itemType: "Top Country", country: "Brazil",    description: "This prize will be given to the winner",  image: null },
  { id: "r7", name: "6th Place", quantity: 1,  itemType: "Top Country", country: "Japan",     description: "Honorable mention for effort",            image: null },
];

const SEED_PLAYERS = [
  { id: "p1", name: "Messi_fan",   country: "Brazil",    totalPoints: 3096, countryRank: 560, globalRank: 1500, totalPrediction: 9,  totalWin: 34, winningStreak: 12 },
  { id: "p2", name: "Ronaldo_fan", country: "Argentina", totalPoints: 2785, countryRank: 450, globalRank: 1200, totalPrediction: 10, totalWin: 29, winningStreak: 15 },
  { id: "p3", name: "Messi_fan",   country: "Brazil",    totalPoints: 3096, countryRank: 560, globalRank: 1500, totalPrediction: 9,  totalWin: 34, winningStreak: 12 },
  { id: "p4", name: "Pele_fan",    country: "Portugal",  totalPoints: 4200, countryRank: 720, globalRank: 2000, totalPrediction: 8,  totalWin: 37, winningStreak: 10 },
];

const SEED_COUNTRIES = [
  { id: "c1", rank: 1, country: "Brazil",    totalPoints: 743400, totalUsers: 187 },
  { id: "c2", rank: 2, country: "Argentina", totalPoints: 612850, totalUsers: 154 },
  { id: "c3", rank: 3, country: "Japan",     totalPoints: 549000, totalUsers: 132 },
  { id: "c4", rank: 4, country: "Germany",   totalPoints: 458600, totalUsers: 121 },
  { id: "c5", rank: 5, country: "USA",       totalPoints: 397250, totalUsers: 109 },
  { id: "c6", rank: 6, country: "Portugal",  totalPoints: 348900, totalUsers: 88  },
  { id: "c7", rank: 7, country: "France",    totalPoints: 287000, totalUsers: 73  },
];

const SEED_MATCHES = [
  { id: "m1", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "",       status: "Ongoing"  },
  { id: "m2", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "",       status: "Ongoing"  },
  { id: "m3", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "",       status: "Upcoming" },
  { id: "m4", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "",       status: "Upcoming" },
  { id: "m5", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "",       status: "Upcoming" },
  { id: "m6", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "Brazil", status: "Ended"    },
  { id: "m7", matchNo: 3, team1: "Brazil", team2: "Germany", date: "2026-06-12", time: "15:00", predictionA: 30, predictionB: 70, winner: "Brazil", status: "Ended"    },
];

const Ctx = createContext(null);

function nextId(prefix, items) {
  let n = items.length + 1;
  while (items.some((i) => i.id === `${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

export function WorldCupSettingsProvider({ children }) {
  const [banners, setBanners] = useState(SEED_BANNERS);
  const [rewards, setRewards] = useState(SEED_REWARDS);
  const [players, setPlayers] = useState(SEED_PLAYERS);
  const [countries, setCountries] = useState(SEED_COUNTRIES);
  const [matches, setMatches] = useState(SEED_MATCHES);

  const upsertBanner = useCallback((draft) => {
    setBanners((list) => {
      if (draft.id && list.some((b) => b.id === draft.id)) {
        return list.map((b) => (b.id === draft.id ? { ...b, ...draft } : b));
      }
      return [...list, { ...draft, id: draft.id || nextId("b", list) }];
    });
  }, []);
  const archiveBanner = useCallback((id) => {
    setBanners((list) => list.filter((b) => b.id !== id));
  }, []);

  const upsertReward = useCallback((draft) => {
    setRewards((list) => {
      if (draft.id && list.some((r) => r.id === draft.id)) {
        return list.map((r) => (r.id === draft.id ? { ...r, ...draft } : r));
      }
      return [...list, { ...draft, id: draft.id || nextId("r", list) }];
    });
  }, []);
  const archiveReward = useCallback((id) => {
    setRewards((list) => list.filter((r) => r.id !== id));
  }, []);

  const upsertPlayer = useCallback((draft) => {
    setPlayers((list) => {
      if (draft.id && list.some((p) => p.id === draft.id)) {
        return list.map((p) => (p.id === draft.id ? { ...p, ...draft } : p));
      }
      return [...list, { ...draft, id: draft.id || nextId("p", list) }];
    });
  }, []);
  const archivePlayer = useCallback((id) => {
    setPlayers((list) => list.filter((p) => p.id !== id));
  }, []);

  const upsertCountry = useCallback((draft) => {
    setCountries((list) => {
      if (draft.id && list.some((c) => c.id === draft.id)) {
        return list.map((c) => (c.id === draft.id ? { ...c, ...draft } : c));
      }
      return [...list, { ...draft, id: draft.id || nextId("c", list) }];
    });
  }, []);
  const archiveCountry = useCallback((id) => {
    setCountries((list) => list.filter((c) => c.id !== id));
  }, []);

  const upsertMatch = useCallback((draft) => {
    setMatches((list) => {
      if (draft.id && list.some((m) => m.id === draft.id)) {
        return list.map((m) => (m.id === draft.id ? { ...m, ...draft } : m));
      }
      return [...list, { ...draft, id: draft.id || nextId("m", list) }];
    });
  }, []);
  const archiveMatch = useCallback((id) => {
    setMatches((list) => list.filter((m) => m.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      banners, rewards, players, countries, matches,
      upsertBanner, archiveBanner,
      upsertReward, archiveReward,
      upsertPlayer, archivePlayer,
      upsertCountry, archiveCountry,
      upsertMatch, archiveMatch,
    }),
    [banners, rewards, players, countries, matches, upsertBanner, archiveBanner, upsertReward, archiveReward, upsertPlayer, archivePlayer, upsertCountry, archiveCountry, upsertMatch, archiveMatch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorldCupSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorldCupSettings must be used within WorldCupSettingsProvider");
  return ctx;
}
