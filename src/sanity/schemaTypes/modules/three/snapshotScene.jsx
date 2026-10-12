import { createRoot } from 'react-dom/client';
import { aspectOf } from '@/components/Modules/ThreeScene/aspects';
import { ThemeContext } from '@/components/ThemeContext';
import { DEFAULT_THEME_URL, loadThemeImage } from '@/lib/themes';

const WIDTH = 1600;
const LOAD_TIMEOUT = 20000;
// Render time to outlast the model's Bounds fit (about a second), then frames
// with a still camera: a heavy model's first frames can stall past any fixed
// wait, so the fit is watched rather than timed.
const SETTLE_S = 1.2;
const STILL_FRAMES = 20;

// A theme environment follows the visitor's page, unknown here: it reflects a
// grey with a hint of the default theme photo, brightness-normalised the same
// way the site does a theme.
const THEME_HINT = 0.3;

async function neutralTheme() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#777';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  try {
    ctx.globalAlpha = THEME_HINT;
    ctx.drawImage(await loadThemeImage(DEFAULT_THEME_URL), 0, 0, 512, 256);
  } catch {
    // Grey alone still reads as neutral.
  }
  return { theme: { url: canvas.toDataURL() } };
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// Renders the real Scene offscreen at a fixed density and returns the first
// settled frame as an image, transparency intact. Rejects if the model has not
// loaded in time.
export default async function snapshotScene({ aspectRatio, ...scene }) {
  // Three stays out of the Studio bundle until a poster is asked for.
  const [{ default: Scene }, { useProgress }] = await Promise.all([
    import('@/components/canvas/Scene'),
    import('@react-three/drei')
  ]);

  // Inside the viewport but invisible: the canvas pauses once it leaves it.
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${WIDTH}px`,
    aspectRatio: aspectOf(aspectRatio),
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1
  });
  document.body.appendChild(container);
  const root = createRoot(container);

  const theme = await neutralTheme();
  const deadline = Date.now() + LOAD_TIMEOUT;
  const failed = new Error('The 3D model could not be loaded.');

  try {
    // The store's getter: the scene swaps in its own camera after creation.
    let three;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(failed), LOAD_TIMEOUT);
      root.render(
        <ThemeContext.Provider value={theme}>
          <Scene
            {...scene}
            orbitControls={false}
            dpr={1}
            onCreated={(state) => (three = state.get)}
            gl={{
              powerPreference: 'high-performance',
              preserveDrawingBuffer: true
            }}
            onReady={() => {
              clearTimeout(timeout);
              resolve();
            }}
          />
        </ThemeContext.Provider>
      );
    });

    // Ready means the model is in; the environment loads in its own Suspense.
    while (useProgress.getState().active) {
      if (Date.now() > deadline) throw failed;
      await frame();
    }

    const start = three().clock.elapsedTime;
    let pose = '';
    for (let still = 0; still < STILL_FRAMES;) {
      if (Date.now() > deadline) throw failed;
      await frame();
      const next = three().camera.matrixWorld.elements.join();
      still = next === pose ? still + 1 : 0;
      pose = next;
      if (three().clock.elapsedTime - start < SETTLE_S) still = 0;
    }

    const canvas = container.querySelector('canvas');
    // Browsers that cannot encode webp hand back a PNG instead.
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.9)
    );
    if (!blob) throw new Error('The scene could not be captured.');
    return blob;
  } finally {
    root.unmount();
    container.remove();
  }
}
