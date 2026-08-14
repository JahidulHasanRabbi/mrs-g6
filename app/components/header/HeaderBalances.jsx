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
    <div
      className="relative h-[42px] w-[114px] shrink-0 overflow-hidden min-[360px]:h-[47px] min-[360px]:w-[128px]"
      aria-label={`${value} ${label}`}
    >
      <img
        src={frame}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        draggable={false}
      />
      <div className="absolute inset-0 flex items-center justify-center p-[7px] min-[360px]:p-[10px]">
        <div className="flex w-[86px] items-center gap-[5px] min-[360px]:w-[94px] min-[360px]:gap-2">
          <div className="relative size-7 shrink-0 overflow-hidden min-[360px]:size-8">
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
                ? 'text-[11px] min-[360px]:text-[12px]'
                : 'text-[12px] min-[360px]:text-[14px]'
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

export default function HeaderBalances({
  themeId = THEME_IDS.DEFAULT,
  battlePoints,
  balance,
  className = '',
}) {
  const skin = getHeaderBalanceSkin(themeId);
  const formattedBattlePoints = formatValue(battlePoints, 0);
  const formattedBalance = formatValue(balance, 2);

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
        label="Tokens"
        value={formattedBalance}
        textColor={skin.textColor}
      />
    </div>
  );
}
