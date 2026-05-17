// Shared seed data for the User Access management surface. Both the list
// page and the edit page read from here so an edited row resolves the same
// way the list rendered it. Once the backend is wired up, swap this for
// adminApi calls and delete the mock generator.

import { ASSETS } from "../../../components/admin/retention/constants";

export const ROLE_OPTIONS = [
  "Retention",
  "Prize Moderator",
  "Game Master",
  "Lucky Spin Manager",
  "Supervisor Retention",
];

export const STATUS_OPTIONS = ["Active", "Suspended"];

const SEED_USERS = [
  { name: "Sarah Jenkins",  vip: "VIP 1", avatar: `${ASSETS}/avatar-1.jpg`, role: "Retention",            status: "Active"    },
  { name: "Marcus Henry",   vip: "VIP 2", avatar: `${ASSETS}/avatar-2.jpg`, role: "Prize Moderator",      status: "Active"    },
  { name: "David Chen",     vip: "VIP 3", avatar: `${ASSETS}/avatar-3.jpg`, role: "Game Master",          status: "Suspended" },
  { name: "Elena Rody",     vip: "VIP 2", avatar: `${ASSETS}/avatar-3.jpg`, role: "Lucky Spin Manager",   status: "Active"    },
  { name: "Adam Ron",       vip: "VIP 3", avatar: `${ASSETS}/avatar-4.jpg`, role: "Retention",            status: "Active"    },
  { name: "Omar Al-Farsi",  vip: "VIP 1", avatar: `${ASSETS}/avatar-4.jpg`, role: "Supervisor Retention", status: "Active"    },
  { name: "Samantha",       vip: "VIP 1", avatar: `${ASSETS}/avatar-5.jpg`, role: "Game Master",          status: "Suspended" },
];

export const USERS = Array.from({ length: 150 }, (_, i) => {
  const seed = SEED_USERS[i % SEED_USERS.length];
  return { ...seed, id: i + 1 };
});

export function findUserById(id) {
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) return null;
  return USERS.find((u) => u.id === numeric) || null;
}
