import { THEME_IDS } from '../../config/themes';

const BASE = '/assets/header-balances';

export const HEADER_BALANCE_SKINS = Object.freeze({
  [THEME_IDS.DEFAULT]: {
    frame: `${BASE}/default/frame.webp`,
    battlePoint: `${BASE}/default/bp.webp`,
    token: `${BASE}/default/kr.webp`,
    textColor: '#f9d063',
  },
  [THEME_IDS.ACEBET77]: {
    frame: `${BASE}/acebet77/frame.webp`,
    battlePoint: `${BASE}/acebet77/bp.webp`,
    token: `${BASE}/acebet77/kr.webp`,
    textColor: '#f9d063',
  },
  [THEME_IDS.UBETCLUB]: {
    frame: `${BASE}/ubetclub/frame.webp`,
    battlePoint: `${BASE}/ubetclub/bp.webp`,
    token: `${BASE}/ubetclub/kr.webp`,
    textColor: '#f9d063',
  },
  [THEME_IDS.EP369]: {
    frame: `${BASE}/ep369/frame.webp`,
    battlePoint: `${BASE}/ep369/bp.webp`,
    token: `${BASE}/ep369/kr.webp`,
    textColor: '#f9d063',
  },
  [THEME_IDS.KGAME99]: {
    frame: `${BASE}/kgame99/frame.webp`,
    battlePoint: `${BASE}/kgame99/bp.webp`,
    token: `${BASE}/kgame99/kr.webp`,
    textColor: '#012550',
  },
  [THEME_IDS.LV918]: {
    frame: `${BASE}/lv918/frame.webp`,
    battlePoint: `${BASE}/lv918/bp.webp`,
    token: `${BASE}/lv918/kr.webp`,
    textColor: '#9d4398',
  },
  [THEME_IDS.N1GANG]: {
    frame: `${BASE}/n1gang/frame.webp`,
    battlePoint: `${BASE}/n1gang/bp.webp`,
    token: `${BASE}/n1gang/kr.webp`,
    textColor: '#f9d063',
  },
});

export function getHeaderBalanceSkin(themeId) {
  return HEADER_BALANCE_SKINS[themeId] || HEADER_BALANCE_SKINS[THEME_IDS.DEFAULT];
}
