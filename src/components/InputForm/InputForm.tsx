import { useState } from 'react';
import type { ButtonType } from '../../types/tier';

interface InputFormProps {
  onSubmit: (nickname: string, button: ButtonType) => void;
  isLoading: boolean;
}

const BUTTON_OPTIONS: ButtonType[] = [4, 5, 6, 8];

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [nickname, setNickname] = useState('');
  const [selectedButton, setSelectedButton] = useState<ButtonType>(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim(), selectedButton);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      {/* Nickname Input */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-400 mb-2">
          닉네임
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="V-ARCHIVE 닉네임 입력"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Button Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          버튼
        </label>
        <div className="grid grid-cols-4 gap-2">
          {BUTTON_OPTIONS.map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => setSelectedButton(btn)}
              className={`py-3 rounded-xl font-bold text-lg transition-all ${
                selectedButton === btn
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-900 text-gray-500 border border-gray-700 hover:border-gray-600 hover:text-gray-300'
              }`}
              disabled={isLoading}
            >
              {btn}B
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!nickname.trim() || isLoading}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:shadow-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            불러오는 중...
          </span>
        ) : '카드 생성'}
      </button>
    </form>
  );
}
