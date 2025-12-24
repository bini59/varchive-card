import { useState, useRef } from 'react';
import { InputForm } from './components/InputForm/InputForm';
import { TierCard } from './components/TierCard/TierCard';
import { fetchTierData } from './services/api';
import { downloadCardAsImage, downloadCardAsGif } from './utils/downloadImage';
import type { TierResponse, ButtonType } from './types/tier';

function App() {
  const [tierData, setTierData] = useState<TierResponse | null>(null);
  const [nickname, setNickname] = useState('');
  const [button, setButton] = useState<ButtonType>(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (inputNickname: string, inputButton: ButtonType) => {
    setIsLoading(true);
    setError(null);
    setTierData(null);

    try {
      const data = await fetchTierData(inputNickname, inputButton);
      setTierData(data);
      setNickname(inputNickname);
      setButton(inputButton);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPng = async () => {
    if (cardRef.current) {
      try {
        await downloadCardAsImage(cardRef.current, `${nickname}-${button}B-tier-card.png`);
      } catch {
        setError('이미지 다운로드에 실패했습니다.');
      }
    }
  };

  const handleDownloadGif = async () => {
    if (cardRef.current) {
      setIsDownloading(true);
      try {
        await downloadCardAsGif(
          cardRef.current,
          `${nickname}-${button}B-tier-card.gif`,
          { frameCount: 20, frameDuration: 1 }
        );
      } catch {
        setError('GIF 다운로드에 실패했습니다.');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // 비디오 티어 목록
  const VIDEO_TIERS = ['BR', 'DM', 'GD', 'GM', 'IR', 'M', 'PT', 'SV'];
  const showGifButton = tierData && VIDEO_TIERS.includes(tierData.tier.code);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-8 sm:py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Card Maker - V Archive
        </h1>
      </div>

      {/* Input Form */}
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Error Message */}
      {error && (
        <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {tierData && (
        <div className="mt-10 flex flex-col items-center gap-5">
          <TierCard
            ref={cardRef}
            data={tierData}
            nickname={nickname}
            button={button}
          />
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPng}
              className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              PNG
            </button>
            {showGifButton && (
              <button
                onClick={handleDownloadGif}
                disabled={isDownloading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GIF
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-gray-600 text-xs">
        <p>Data from V-ARCHIVE · Not affiliated with NEOWIZ</p>
      </footer>
    </div>
  );
}

export default App;
