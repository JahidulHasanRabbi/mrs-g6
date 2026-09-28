import { THEME_IDS } from '../../config/themes';
import { getHeaderBalanceSkin } from './headerBalanceAssets';

function formatValue(value, fractionDigits) {
  const amount = Number(String(value ?? 0).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return fractionDigits ? '0.00' : '0';

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function BalanceItem({ frame, icon, iconKind, label, value, textColor }) {
  const usesCompactType = value.length > 8;

  return (
    // Three tiers: the widest only from 420px, where the header still has room
    // for the profile avatar beside two chips.
    <div
      className="relative h-[38px] w-[100px] shrink-0 overflow-hidden min-[360px]:h-[42px] min-[360px]:w-[114px] min-[420px]:h-[47px] min-[420px]:w-[128px]"
      aria-label={`${value} ${label}`}
    >
      <img
        src={frame}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        draggable={false}
      />
      <div className="absolute inset-0 flex items-center justify-center p-[5px] min-[360px]:p-[7px] min-[420px]:p-[10px]">
        <div className="flex w-[76px] items-center gap-[4px] min-[360px]:w-[86px] min-[360px]:gap-[5px] min-[420px]:w-[94px] min-[420px]:gap-2">
          <div className="relative size-6 shrink-0 overflow-hidden min-[360px]:size-7 min-[420px]:size-8">
            <img
              src={icon}
              alt=""
              aria-hidden="true"
              className={
                iconKind === 'battlePoint'
                  ? 'pointer-events-none absolute left-[-6.45%] top-[-3.02%] h-[111.95%] w-[112.9%] max-w-none select-none'
                  : 'pointer-events-none absolute inset-0 h-full w-full select-none object-cover'
              }
              draggable={false}
            />
          </div>
          <span
            className={`shrink-0 whitespace-nowrap font-['Times_New_Roman'] font-bold leading-normal ${
              usesCompactType
                ? 'text-[10px] min-[360px]:text-[11px] min-[420px]:text-[12px]'
                : 'text-[11px] min-[360px]:text-[12px] min-[420px]:text-[14px]'
            }`}
            style={{ color: textColor }}
          >
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

// King Rewards (Figma 664:1379): two translucent pills in one navy panel.
export function GlassBalances({ skin, battlePoints, balance, className = '', font = 'var(--font-barlow), sans-serif', growOnWide = true }) {
  const pill = (icon, value, label) => (
    <div
      className="flex items-center gap-1 overflow-hidden rounded-[8px] bg-[rgba(255,255,255,0.3)] p-1"
      aria-label={`${value} ${label}`}
    >
      <img src={icon} alt="" aria-hidden="true" className="size-[19px] shrink-0 object-contain" draggable={false} />
      <span
        className={`whitespace-nowrap text-[10px] font-semibold ${growOnWide ? 'min-[420px]:text-[11px]' : ''}`}
        style={{ fontFamily: font, color: skin.textColor }}
      >
        {value}
      </span>
    </div>
  );
  return (
    <div
      className={`flex items-center gap-1 rounded-[12px] bg-[#003d89] p-1 ${className}`}
      style={{ boxShadow: 'inset 0 4px 16px rgba(255,255,255,0.15)' }}
    >
      {pill(skin.battlePoint, battlePoints, 'Battle Points')}
      {pill(skin.token, balance, 'KR Coins')}
    </div>
  );
}

export default function HeaderBalances({
  themeId = THEME_IDS.DEFAULT,
  battlePoints,
  balance,
  className = '',
}) {
  const skin = getHeaderBalanceSkin(themeId);
  const formattedBattlePoints = formatValue(battlePoints, 0);
  const formattedBalance = formatValue(balance, 2);

  if (skin.glass) {
    return (
      <GlassBalances
        skin={skin}
        battlePoints={formattedBattlePoints}
        balance={formattedBalance}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <BalanceItem
        frame={skin.frame}
        icon={skin.battlePoint}
        iconKind="battlePoint"
        label="Battle Points"
        value={formattedBattlePoints}
        textColor={skin.textColor}
      />
      <BalanceItem
        frame={skin.frame}
        icon={skin.token}
        iconKind="token"
        label="KR Coins"
        value={formattedBalance}
        textColor={skin.textColor}
      />
    </div>
  );
}
