import { THEME_IDS } from '../../config/themes';

const BASE = '/assets/header-balances';

export const HEADER_BALANCE_SKINS = Object.freeze({
  [THEME_IDS.DEFAULT]: {
    frame: `${BASE}/default/frame.png`,
    battlePoint: `${BASE}/default/bp.png`,
    token: `${BASE}/default/kr.png`,
    textColor: '#f9d063',
  },
  [THEME_IDS.ACEBET77]: {
    frame: `${BASE}/acebet77/frame.png`,
    battlePoint: `${BASE}/acebet77/bp.png`,
    token: `${BASE}/acebet77/kr.png`,
    textColor: '#f9d063',
  },
  [THEME_IDS.UBETCLUB]: {
    frame: `${BASE}/ubetclub/frame.png`,
    battlePoint: `${BASE}/ubetclub/bp.png`,
    token: `${BASE}/ubetclub/kr.png`,
    textColor: '#f9d063',
  },
  [THEME_IDS.EP369]: {
    frame: `${BASE}/ep369/frame.png`,
    battlePoint: `${BASE}/ep369/bp.png`,
    token: `${BASE}/ep369/kr.png`,
    textColor: '#f9d063',
  },
  [THEME_IDS.KGAME99]: {
    frame: `${BASE}/kgame99/frame.png`,
    battlePoint: `${BASE}/kgame99/bp.png`,
    token: `${BASE}/kgame99/kr.png`,
    textColor: '#012550',
  },
  [THEME_IDS.LV918]: {
    frame: `${BASE}/lv918/frame.png`,
    battlePoint: `${BASE}/lv918/bp.png`,
    token: `${BASE}/lv918/kr.png`,
    textColor: '#9d4398',
  },
  [THEME_IDS.N1GANG]: {
    frame: `${BASE}/n1gang/frame.png`,
    battlePoint: `${BASE}/n1gang/bp.png`,
    token: `${BASE}/n1gang/kr.png`,
    textColor: '#f9d063',
  },
});

export function getHeaderBalanceSkin(themeId) {
  return HEADER_BALANCE_SKINS[themeId] || HEADER_BALANCE_SKINS[THEME_IDS.DEFAULT];
}
