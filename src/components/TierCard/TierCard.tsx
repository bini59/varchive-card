import { forwardRef } from 'react';
import type { TierResponse, ButtonType, TierCode } from '../../types/tier';
import { TIER_STYLES } from '../../types/tier';
import { TierBadge } from './TierBadge';
import { TopRecord } from './TopRecord';

interface TierCardProps {
  data: TierResponse;
  nickname: string;
  button: ButtonType;
}

export const TierCard = forwardRef<HTMLDivElement, TierCardProps>(
  ({ data, nickname, button }, ref) => {
    const top3Records = data.topList.slice(0, 3);
    const style = TIER_STYLES[data.tier.code as TierCode] || TIER_STYLES.BG;

    return (
      <div
        ref={ref}
        className={`w-full max-w-[420px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl`}
      >
        {/* Top Border Gradient */}
        <div className={`h-1 bg-gradient-to-r ${style.gradient}`} />

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-1">Player</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{nickname}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${style.gradient} text-gray-900`}>
                  {button}B
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  TOP50: {data.top50sum.toFixed(2)}
                </span>
              </div>
            </div>
            <TierBadge tier={data.tier} tierPoint={data.tierPoint} />
          </div>

          {/* Next Tier Progress */}
          {data.next && (
            <div className="mb-4 sm:mb-5">
              <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-1">
                <span>Next: {data.next.name}</span>
                <span>{data.next.rating - data.tierPoint > 0
                  ? `${(data.next.rating - data.tierPoint).toFixed(2)} TP needed`
                  : 'Achieved!'
                }</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${style.gradient} transition-all duration-500`}
                  style={{
                    width: `${Math.min(100, ((data.tierPoint - data.tier.rating) / (data.next.rating - data.tier.rating)) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-3 sm:mb-4" />

          {/* Top 3 Records */}
          <div className="space-y-2">
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
              Top 3 Performance
            </h3>
            {top3Records.map((record, index) => (
              <TopRecord key={index} record={record} rank={index + 1} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-[9px] sm:text-[10px] text-gray-600">V-ARCHIVE TIER CARD</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600">v-archive.net</p>
          </div>
        </div>
      </div>
    );
  }
);

TierCard.displayName = 'TierCard';
