import type { TierResponse, TierErrorResponse, ButtonType } from '../types/tier';

// 개발: Vite 프록시 사용 (/api -> https://v-archive.net/api)
// 배포: 별도 프록시 서버 필요
const API_BASE_URL = '/api/archive';

export async function fetchTierData(
  nickname: string,
  button: ButtonType
): Promise<TierResponse> {
  const encodedNickname = encodeURIComponent(nickname);
  const url = `${API_BASE_URL}/${encodedNickname}/tier/${button}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: TierErrorResponse = await response.json();
    throw new Error(errorData.message || '데이터를 불러오는데 실패했습니다.');
  }

  const data: TierResponse = await response.json();
  return data;
}
