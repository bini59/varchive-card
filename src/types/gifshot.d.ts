declare module 'gifshot' {
  interface GifShotOptions {
    images?: string[];
    video?: string | string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (progress: number) => void;
  }

  interface GifShotResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image?: string;
  }

  function createGIF(
    options: GifShotOptions,
    callback: (result: GifShotResult) => void
  ): void;

  export { createGIF, GifShotOptions, GifShotResult };
}