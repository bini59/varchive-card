import { toPng } from 'html-to-image';
import { createGIF } from 'gifshot';

export async function downloadCardAsImage(
  element: HTMLElement,
  filename: string = 'tier-card.png'
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('이미지 다운로드 실패:', error);
    throw error;
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

    const link = document.createElement('a');
    link.download = filename;
    link.href = gifDataUrl;
    link.click();
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
 * 비디오의 여러 프레임에서 카드 이미지 캡처
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

  // 비디오와 같은 크기로 캔버스 설정
  const videoWidth = video.videoWidth || video.clientWidth || 200;
  const videoHeight = video.videoHeight || video.clientHeight || 200;

  for (let i = 0; i < frameCount; i++) {
    // 매 프레임마다 새로운 캔버스 생성
    const frameCanvas = document.createElement('canvas');
    const frameCtx = frameCanvas.getContext('2d');
    if (!frameCtx) continue;

    frameCanvas.width = videoWidth;
    frameCanvas.height = videoHeight;
    frameCanvas.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:9999px;';

    try {
      const time = (i * interval) % duration;

      // 비디오 시간 설정 및 대기
      video.currentTime = time;
      await waitForVideoSeek(video);

      // 비디오 프레임을 캔버스에 그리기
      frameCtx.drawImage(video, 0, 0, videoWidth, videoHeight);

      // 비디오를 DOM에서 완전히 제거하고 캔버스로 교체
      videoParent.removeChild(video);
      videoParent.appendChild(frameCanvas);

      // 잠시 대기 (렌더링 안정화)
      await new Promise(r => setTimeout(r, 50));

      // 전체 카드 캡처
      const cardFrame = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });
      frames.push(cardFrame);
      console.log(`프레임 ${i} 캡처 성공, 크기: ${cardFrame.length}`);

      // 캔버스 제거하고 비디오 복원
      videoParent.removeChild(frameCanvas);
      videoParent.appendChild(video);
    } catch (frameError) {
      console.warn(`프레임 ${i} 캡처 실패:`, frameError);
      // 실패한 프레임은 건너뛰고 계속 진행
      if (frameCanvas.parentElement) {
        videoParent.removeChild(frameCanvas);
      }
      if (!video.parentElement) {
        videoParent.appendChild(video);
      }
    }
  }

  // 비디오 상태 복원
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
