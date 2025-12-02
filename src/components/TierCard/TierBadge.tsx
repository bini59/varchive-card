import type { TierInfo, TierCode } from '../../types/tier';
import { TIER_STYLES } from '../../types/tier';

interface TierBadgeProps {
  tier: TierInfo;
  tierPoint: number;
}

export function TierBadge({ tier, tierPoint }: TierBadgeProps) {
  const style = TIER_STYLES[tier.code as TierCode] || TIER_STYLES.BG;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Tier Badge */}
      <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${style.gradient} p-[3px] shadow-lg ${style.glow}`}>
        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
          <span className={`text-xl font-black ${style.text}`}>
            {tier.code}
          </span>
        </div>
      </div>

      {/* Tier Info */}
      <div className="text-center">
        <p className={`text-lg font-bold ${style.text}`}>{tier.name}</p>
        <p className="text-sm text-gray-400 font-mono">{tierPoint.toFixed(2)} TP</p>
      </div>
    </div>
  );
}
