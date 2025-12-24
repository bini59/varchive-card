import { toPng } from 'html-to-image';
import { createGIF } from 'gifshot';

/**
 * 모바일 기기 감지
 */
function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * 적절한 pixelRatio 계산 (모바일에서는 낮추기)
 */
function getOptimalPixelRatio(): number {
  if (isMobile()) {
    // 모바일에서는 devicePixelRatio를 그대로 사용하되 최대 2로 제한
    return Math.min(window.devicePixelRatio || 1, 2);
  }
  return 2;
}

/**
 * html-to-image 공통 옵션
 */
function getImageOptions() {
  return {
    quality: 1,
    pixelRatio: getOptimalPixelRatio(),
    cacheBust: true,
    // 외부 폰트 인라인으로 포함
    includeQueryParams: true,
    // 스타일 복사 시 계산된 스타일 사용
    skipAutoScale: true,
  };
}

/**
 * 재시도 로직이 포함된 toPng
 */
async function toPngWithRetry(
  element: HTMLElement,
  maxRetries: number = 3
): Promise<string> {
  const options = getImageOptions();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 첫 시도 전에 약간의 대기 (리소스 로딩 보장)
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 100));
      }

      const dataUrl = await toPng(element, options);

      // 유효한 데이터인지 확인 (빈 이미지 체크)
      if (dataUrl && dataUrl.length > 1000) {
        return dataUrl;
      }

      // 너무 작은 이미지면 재시도
      lastError = new Error('생성된 이미지가 너무 작습니다');
    } catch (error) {
      lastError = error as Error;
      console.warn(`캡처 시도 ${attempt + 1} 실패:`, error);
    }

    // 재시도 전 대기 (점점 길게)
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
    }
  }

  throw lastError || new Error('이미지 캡처 실패');
}

/**
 * Data URL을 Blob으로 변환
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Web Share API로 공유 (모바일)
 */
async function shareImage(dataUrl: string, filename: string): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: blob.type });

    if (!navigator.canShare({ files: [file] })) {
      return false;
    }

    await navigator.share({
      files: [file],
      title: 'V-Archive Tier Card',
    });
    return true;
  } catch (error) {
    // 사용자가 공유 취소한 경우
    if ((error as Error).name === 'AbortError') {
      return true;
    }
    return false;
  }
}

/**
 * 새 탭에서 이미지 열기 (fallback)
 */
function openInNewTab(dataUrl: string): void {
  const newTab = window.open();
  if (newTab) {
    newTab.document.write(`
      <html>
        <head>
          <title>V-Archive Tier Card</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #111; }
            img { max-width: 100%; height: auto; }
            p { color: #888; text-align: center; padding: 20px; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div>
            <img src="${dataUrl}" alt="Tier Card" />
            <p>이미지를 길게 눌러 저장하세요</p>
          </div>
        </body>
      </html>
    `);
    newTab.document.close();
  }
}

/**
 * 데스크톱 다운로드
 */
function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function downloadCardAsImage(
  element: HTMLElement,
  filename: string = 'tier-card.png'
): Promise<void> {
  try {
    const video = element.querySelector('video');
    let dataUrl: string;

    if (video) {
      // 비디오가 있으면 캔버스로 교체 후 캡처
      dataUrl = await captureWithVideoAsCanvas(element, video);
    } else {
      // 재시도 로직이 포함된 캡처
      dataUrl = await toPngWithRetry(element);
    }

    if (isMobile()) {
      // 모바일: Web Share API 시도 → 실패 시 새 탭
      const shared = await shareImage(dataUrl, filename);
      if (!shared) {
        openInNewTab(dataUrl);
      }
    } else {
      // 데스크톱: 일반 다운로드
      downloadFile(dataUrl, filename);
    }
  } catch (error) {
    console.error('이미지 다운로드 실패:', error);
    throw error;
  }
}

/**
 * 비디오 프레임을 data URL로 변환
 */
function videoFrameToDataUrl(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('캔버스 컨텍스트 생성 실패');
  }

  // 비디오 실제 해상도 - 모바일에서 videoWidth가 0일 수 있음
  const videoWidth = video.videoWidth > 0 ? video.videoWidth : 340;
  const videoHeight = video.videoHeight > 0 ? video.videoHeight : 340;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // 비디오 프레임을 캔버스에 그리기
  ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

  // PNG data URL로 변환
  return canvas.toDataURL('image/png');
}

/**
 * 비디오를 img 태그로 교체한 후 캡처 (html-to-image에서 더 안정적)
 */
async function captureWithVideoAsCanvas(
  element: HTMLElement,
  video: HTMLVideoElement
): Promise<string> {
  const videoParent = video.parentElement;
  if (!videoParent) {
    throw new Error('비디오 부모 요소를 찾을 수 없습니다');
  }

  // 비디오 로드 확인
  await ensureVideoLoaded(video);

  // 비디오 프레임을 이미지 data URL로 변환
  const frameDataUrl = videoFrameToDataUrl(video);

  // img 태그 생성 (html-to-image에서 canvas보다 안정적)
  const img = document.createElement('img');
  img.src = frameDataUrl;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:9999px;';

  // 이미지 로드 대기
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    // 이미 로드된 경우
    if (img.complete) resolve();
  });

  // 비디오를 img로 교체
  videoParent.removeChild(video);
  videoParent.appendChild(img);

  // 렌더링 안정화 대기 - 모바일에서는 더 긴 대기 시간 필요
  const waitTime = isMobile() ? 300 : 150;
  await new Promise(r => setTimeout(r, waitTime));

  try {
    // 재시도 로직이 포함된 캡처
    const dataUrl = await toPngWithRetry(element);
    return dataUrl;
  } finally {
    // 비디오 복원
    videoParent.removeChild(img);
    videoParent.appendChild(video);
  }
}

/**
 * 비디오가 포함된 카드를 GIF로 다운로드
 */
export async function downloadCardAsGif(
  element: HTMLElement,
  filename: string = 'tier-card.gif',
  options: {
    frameCount?: number;
    frameDuration?: number;
  } = {}
): Promise<void> {
  const { frameCount = 30, frameDuration = 1 } = options;

  const video = element.querySelector('video');

  if (!video) {
    return downloadCardAsImage(element, filename.replace('.gif', '.png'));
  }

  try {
    // 비디오 메타데이터 로드 대기
    await ensureVideoLoaded(video);

    const frames = await captureVideoFrames(element, video, frameCount);

    if (frames.length === 0) {
      throw new Error('프레임을 캡처하지 못했습니다');
    }

    const gifDataUrl = await createGifFromFrames(frames, frameDuration);

    if (isMobile()) {
      // 모바일: Web Share API 시도 → 실패 시 새 탭
      const shared = await shareImage(gifDataUrl, filename);
      if (!shared) {
        openInNewTab(gifDataUrl);
      }
    } else {
      // 데스크톱: 일반 다운로드
      downloadFile(gifDataUrl, filename);
    }
  } catch (error) {
    console.error('GIF 다운로드 실패:', error);
    throw error;
  }
}

/**
 * 비디오 메타데이터 로드 확인
 */
function ensureVideoLoaded(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (video.readyState >= 2 && video.duration > 0) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('비디오 로드 타임아웃'));
    }, 5000);

    const onLoaded = () => {
      clearTimeout(timeout);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('error', onError);
      resolve();
    };

    const onError = () => {
      clearTimeout(timeout);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('error', onError);
      reject(new Error('비디오 로드 실패'));
    };

    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('error', onError);
  });
}

/**
 * 비디오의 여러 프레임에서 카드 이미지 캡처 (img 태그 사용으로 안정적)
 */
async function captureVideoFrames(
  element: HTMLElement,
  video: HTMLVideoElement,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];

  // duration이 유효한지 확인
  const duration = isFinite(video.duration) && video.duration > 0
    ? video.duration
    : 2;
  const interval = duration / frameCount;

  // 비디오 상태 저장
  const wasPlaying = !video.paused;
  video.pause();

  // 비디오의 부모 요소
  const videoParent = video.parentElement;
  if (!videoParent) {
    throw new Error('비디오 부모 요소를 찾을 수 없습니다');
  }

  // 비디오를 먼저 DOM에서 제거
  videoParent.removeChild(video);

  for (let i = 0; i < frameCount; i++) {
    try {
      // 비디오 시간 설정 및 대기
      video.currentTime = (i * interval) % duration;
      await waitForVideoSeek(video);

      // 비디오 프레임을 이미지 data URL로 변환
      const frameDataUrl = videoFrameToDataUrl(video);

      // img 태그 생성 (html-to-image에서 canvas보다 안정적)
      const img = document.createElement('img');
      img.src = frameDataUrl;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:9999px;';

      // 이미지 로드 대기
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        if (img.complete) resolve();
      });

      // img를 DOM에 추가
      videoParent.appendChild(img);

      // 렌더링 안정화 대기 - 모바일에서는 더 긴 대기 시간
      const waitTime = isMobile() ? 200 : 100;
      await new Promise(r => setTimeout(r, waitTime));

      // 전체 카드 캡처 (개선된 옵션 사용)
      const cardFrame = await toPng(element, getImageOptions());
      frames.push(cardFrame);

      // img 제거
      videoParent.removeChild(img);
    } catch (frameError) {
      console.warn(`프레임 ${i} 캡처 실패:`, frameError);
      // img가 DOM에 있으면 제거
      const existingImg = videoParent.querySelector('img');
      if (existingImg) {
        videoParent.removeChild(existingImg);
      }
    }
  }

  // 비디오 복원
  videoParent.appendChild(video);
  if (wasPlaying) {
    video.play().catch(() => {});
  }

  return frames;
}

/**
 * 비디오 seek 완료 대기
 */
function waitForVideoSeek(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };

    video.addEventListener('seeked', onSeeked);

    // 타임아웃 fallback
    setTimeout(() => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    }, 300);
  });
}

/**
 * 이미지 프레임들로 GIF 생성
 */
function createGifFromFrames(
  frames: string[],
  frameDuration: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (frames.length === 0) {
      reject(new Error('프레임이 없습니다'));
      return;
    }

    // gifshot에 직접 전달 (크기는 자동 감지)
    createGIF(
      {
        images: frames,
        gifWidth: 352,  // 고정 크기 사용
        gifHeight: 578,
        frameDuration: frameDuration,
        interval: 0.05,
        numWorkers: 2,

      },
      (result) => {
        if (result.error) {
          reject(new Error(result.errorMsg || 'GIF 생성 실패'));
        } else if (result.image) {
          resolve(result.image);
        } else {
          reject(new Error('GIF 생성 결과가 없습니다'));
        }
      }
    );
  });
}

/**
 * 비디오가 있는지 확인
 */
export function hasVideo(element: HTMLElement): boolean {
  return element.querySelector('video') !== null;
}
