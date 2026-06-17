// Shared placeholder data for the Deposit & Referrer leaderboards.
//
// These leaderboards render this mock data whenever the backend returns nothing
// (the endpoints may not exist yet). Both the list pages AND the edit forms
// import from here so that clicking "Edit" on a mock row can pre-fill the form
// from the same source — otherwise the edit form would fetch a non-existent
// `mock-*` uuid from the API and show empty fields.

export const MOCK_BANNERS = [
  { uuid: "mock-b1", description: "Join a country to start earning XP and climbing the ranks!", terms_condition: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others." },
  { uuid: "mock-b2", description: "Complete daily challenges to boost your XP and unlock exclusive rewards.", terms_condition: "Engage with friends through multiplayer events and see your collective progress on the leaderboard." },
  { uuid: "mock-b3", description: "Participate in weekly tournaments for a chance to win prizes and gain extra recognition.", terms_condition: "Track your achievements and milestones in your profile to showcase your journey." },
  { uuid: "mock-b4", description: "Join a country to start earning XP and climbing the ranks!", terms_condition: "Live leaderboard allows players to get real-time updates on their rankings and see where they stand among others." },
];

export const MOCK_REWARDS = [
  { uuid: "mock-r1", reward_name: "1st Place", quantity: 20, item_type_display: "Top Country", image: null },
  { uuid: "mock-r2", reward_name: "4th Place", quantity: 5, item_type_display: "Top Country", image: null },
  { uuid: "mock-r3", reward_name: "3rd Place", quantity: 10, item_type_display: "Top Country", image: null },
  { uuid: "mock-r4", reward_name: "2nd Place", quantity: 15, item_type_display: "Top Country", image: null },
  { uuid: "mock-r5", reward_name: "5th Place", quantity: 3, item_type_display: "Top Country", image: null },
  { uuid: "mock-r6", reward_name: "1st Place", quantity: 20, item_type_display: "Top Country", image: null },
  { uuid: "mock-r7", reward_name: "6th Place", quantity: 1, item_type_display: "Top Country", image: null },
];

export const MOCK_DEPOSIT_PLAYERS = [
  { uuid: "mock-p1", player_name: "Messi_fan", rank: 560, total_deposit: 3096 },
  { uuid: "mock-p2", player_name: "Ronaldo_fan", rank: 450, total_deposit: 2785 },
  { uuid: "mock-p3", player_name: "Messi_fan", rank: 560, total_deposit: 3096 },
  { uuid: "mock-p4", player_name: "Pele_fan", rank: 720, total_deposit: 4200 },
];

export const MOCK_REFERRER_PLAYERS = [
  { uuid: "mock-p1", player_name: "Messi_fan", rank: 560, new_member: 3096 },
  { uuid: "mock-p2", player_name: "Ronaldo_fan", rank: 450, new_member: 2785 },
  { uuid: "mock-p3", player_name: "Messi_fan", rank: 560, new_member: 3096 },
  { uuid: "mock-p4", player_name: "Pele_fan", rank: 720, new_member: 4200 },
];

// True for placeholder rows that have no backend record to fetch.
export function isMockUuid(uuid) {
  return typeof uuid === "string" && uuid.startsWith("mock-");
}
