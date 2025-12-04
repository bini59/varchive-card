import type { TierInfo, TierCode } from '../../types/tier';
import { TIER_STYLES } from '../../types/tier';

interface TierBadgeProps {
  tier: TierInfo;
  tierPoint: number;
}

// Tiers that have MP4 video files
const VIDEO_TIERS: TierCode[] = ['BR', 'DM', 'GD', 'GM', 'IR', 'M', 'PT'];

// Text display for tiers without videos
const TEXT_TIERS: Record<string, string> = {
  AM: 'Amateur',
  BG: 'Beginner',
  SV: 'Silver',
};

export function TierBadge({ tier, tierPoint }: TierBadgeProps) {
  const style = TIER_STYLES[tier.code as TierCode] || TIER_STYLES.BG;
  const tierCode = tier.code as TierCode;
  const hasVideo = VIDEO_TIERS.includes(tierCode);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {/* Tier Badge */}
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${style.gradient} p-[2px] sm:p-[3px] shadow-lg ${style.glow}`}>
        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
          {hasVideo ? (
            <video
              src={`/image/tier/${tierCode}.mp4`}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className={`text-[10px] sm:text-xs font-black ${style.text} text-center px-1`}>
              {TEXT_TIERS[tierCode] || tierCode}
            </span>
          )}
        </div>
      </div>

      {/* Tier Info */}
      <div className="text-center">
        <p className={`text-base sm:text-lg font-bold ${style.text}`}>{tier.name}</p>
        <p className="text-xs sm:text-sm text-gray-400 font-mono">{tierPoint.toFixed(2)} TP</p>
      </div>
    </div>
  );
}
