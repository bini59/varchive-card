export interface TierInfo {
  rating: number;
  name: string;
  code: string;
}

export interface TopRecord {
  name: string;
  button: number;
  pattern: string;
  level: number;
  floor: string;
  maxRating: string;
  score: string;
  maxCombo: number;
  rating: string;
  updatedAt: string;
}

export interface TierResponse {
  success: boolean;
  top50sum: number;
  tierPoint: number;
  tier: TierInfo;
  next: TierInfo;
  topList: TopRecord[];
}

export interface TierErrorResponse {
  success: false;
  errorCode: number;
  message: string;
}

export type ButtonType = 4 | 5 | 6 | 8;

export type TierCode = 'GM' | 'M' | 'DM' | 'PT' | 'GD' | 'SV' | 'BR' | 'IR' | 'AM' | 'BG';

export const TIER_STYLES: Record<TierCode, {
  gradient: string;
  border: string;
  text: string;
  glow: string;
}> = {
  GM: {
    gradient: 'from-red-600 via-orange-500 to-yellow-400',
    border: 'border-red-400',
    text: 'text-red-400',
    glow: 'shadow-red-500/50',
  },
  M: {
    gradient: 'from-purple-600 via-violet-500 to-purple-400',
    border: 'border-purple-400',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/50',
  },
  DM: {
    gradient: 'from-cyan-400 via-blue-400 to-cyan-300',
    border: 'border-cyan-300',
    text: 'text-cyan-300',
    glow: 'shadow-cyan-400/50',
  },
  PT: {
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    border: 'border-teal-300',
    text: 'text-teal-300',
    glow: 'shadow-teal-400/50',
  },
  GD: {
    gradient: 'from-yellow-400 via-amber-400 to-yellow-300',
    border: 'border-yellow-400',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-400/50',
  },
  SV: {
    gradient: 'from-gray-300 via-slate-300 to-gray-200',
    border: 'border-gray-300',
    text: 'text-gray-300',
    glow: 'shadow-gray-300/50',
  },
  BR: {
    gradient: 'from-amber-700 via-orange-700 to-amber-600',
    border: 'border-amber-600',
    text: 'text-amber-500',
    glow: 'shadow-amber-600/50',
  },
  IR: {
    gradient: 'from-slate-500 via-gray-500 to-slate-400',
    border: 'border-slate-400',
    text: 'text-slate-400',
    glow: 'shadow-slate-500/50',
  },
  AM: {
    gradient: 'from-stone-600 via-stone-500 to-stone-400',
    border: 'border-stone-400',
    text: 'text-stone-400',
    glow: 'shadow-stone-500/50',
  },
  BG: {
    gradient: 'from-neutral-600 via-neutral-500 to-neutral-400',
    border: 'border-neutral-400',
    text: 'text-neutral-400',
    glow: 'shadow-neutral-500/50',
  },
};
