// Pré-carga compartilhada da sequência de câmera (259 frames .webp).
// Singleton de módulo: tanto o IntroLoader (barra de progresso real) quanto o
// CinematicAct (renderização) consomem as MESMAS imagens, carregadas uma vez.

export const FRAME_COUNT = 259;

const framePath = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(3, '0')}.webp`;

export const frameImages: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);

let loadPromise: Promise<void> | null = null;
let loadedCount = 0;
const listeners = new Set<(loaded: number, total: number) => void>();

/** Inscreve um ouvinte de progresso; dispara imediatamente com o estado atual. */
export function onFramesProgress(cb: (loaded: number, total: number) => void) {
  listeners.add(cb);
  cb(loadedCount, FRAME_COUNT);
  return () => {
    listeners.delete(cb);
  };
}

export function framesReady() {
  return loadedCount >= FRAME_COUNT;
}

/** Carrega todos os frames com fila de concorrência. Idempotente. */
export function loadFrames(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const concurrency = 24;
    const queue = [...Array(FRAME_COUNT).keys()];

    const worker = async () => {
      while (queue.length > 0) {
        const i = queue.shift()!;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => {
            frameImages[i] = img;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = framePath(i);
        });
        loadedCount++;
        listeners.forEach((l) => l(loadedCount, FRAME_COUNT));
      }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));
  })();

  return loadPromise;
}
