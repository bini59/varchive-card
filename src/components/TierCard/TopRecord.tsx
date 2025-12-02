import type { TopRecord as TopRecordType } from '../../types/tier';

interface TopRecordProps {
  record: TopRecordType;
  rank: number;
}

const patternStyles: Record<string, { bg: string; text: string }> = {
  NM: { bg: 'bg-blue-600', text: 'text-blue-100' },
  HD: { bg: 'bg-orange-500', text: 'text-orange-100' },
  MX: { bg: 'bg-red-600', text: 'text-red-100' },
  SC: { bg: 'bg-purple-600', text: 'text-purple-100' },
};

const rankStyles: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
};

export function TopRecord({ record, rank }: TopRecordProps) {
  const isMaxCombo = record.maxCombo === 1;
  const pattern = patternStyles[record.pattern] || { bg: 'bg-gray-600', text: 'text-gray-100' };
  const rankColor = rankStyles[rank] || 'text-gray-500';

  return (
    <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      {/* Rank */}
      <div className={`text-2xl font-black w-8 ${rankColor}`}>
        {rank}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate text-sm">{record.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pattern.bg} ${pattern.text}`}>
            {record.pattern} {record.level}
          </span>

          <span className="text-xs text-gray-500">SC {record.floor}</span>
        </div>
      </div>

      {/* Score & Rating */}
      <div className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-base font-bold text-white">{record.score}%</span>
          {isMaxCombo && (
            <span className="text-[9px] px-1 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded font-bold">
              MC
            </span>
          )}
        </div>
        <p className="text-xs text-cyan-400 font-mono">{parseFloat(record.rating).toFixed(2)}</p>
      </div>
    </div>
  );
}
