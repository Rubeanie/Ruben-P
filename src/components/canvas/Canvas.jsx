'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';
import { WebGLRenderTarget } from 'three';

const STEP = 0.05;

// A 1x screen gains nothing from rendering denser than its own pixels.
const fit = (dpr) =>
  typeof window === 'undefined' ? dpr : Math.min(window.devicePixelRatio, dpr);

// Sentinel rendered inside the Suspense boundary: it only mounts once every
// suspending child in this boundary has resolved, so it signals "this canvas is
// loaded" — per instance, with no reliance on three's global loading manager
// (which would be shared across multiple canvases). Children with their own
// inner Suspense (e.g. the environment) load independently and don't gate it.
// The shaders compile off the main thread first, where the browser can, so the
// first frame doesn't stall the page waiting on them. Twice: drawn through the
// effects, into a render target, three builds each material a second program.
// Polled here rather than through compileAsync, whose timer can't be stopped and
// throws once an unmount has disposed the renderer.
function Ready({ onReady }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let live = true;
    const target = new WebGLRenderTarget(1, 1);
    gl.setRenderTarget(target);
    const materials = gl.compile(scene, camera);
    gl.setRenderTarget(null);
    gl.compile(scene, camera).forEach((m) => materials.add(m));
    const check = () => {
      if (!live) return;
      for (const m of materials)
        if (gl.properties.get(m).currentProgram?.isReady() !== false)
          materials.delete(m);
      if (materials.size) {
        setTimeout(check, 10);
        return;
      }
      target.dispose();
      onReady();
    };
    check();
    return () => {
      live = false;
      target.dispose();
    };
  }, [gl, scene, camera, onReady]);
  return null;
}

export default function Canvas({
  children,
  className,
  style,
  onReady,
  onOverload,
  frameloop,
  dprRange = [0.5, 1.1],
  ...props
}) {
  const containerRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [factor, setFactor] = useState(1);
  const [ready, setReady] = useState(false);
  const [min, max] = dprRange;
  const dpr = fit(Math.round((min + (max - min) * factor) * 100) / 100);
  // Nothing draws until the shaders are ready. Only watch frames while the
  // loop runs continuously.
  const loop = ready ? (frameloop ?? (onScreen ? 'always' : 'never')) : 'never';
  // At the 0.5 floor, tracked from the declines themselves: the monitor's
  // onChange stops firing once the factor reaches 0.
  const floor = useRef(false);
  const markReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ pointerEvents: 'none', ...style }}>
      <R3FCanvas
        gl={{ precision: 'lowp', powerPreference: 'high-performance' }}
        dpr={dpr}
        frameloop={loop}
        {...props}
        onCreated={(state) => {
          // R3F loses the context on unmount, while the canvas is still on
          // screen; Vivaldi and Helium then show one white frame. Released a
          // moment later the GPU memory still goes, without the flash.
          const lose = state.gl.forceContextLoss.bind(state.gl);
          state.gl.forceContextLoss = () => setTimeout(lose, 500);
          props.onCreated?.(state);
        }}>
        <Suspense fallback={null}>
          {children}
          <Ready onReady={markReady} />
        </Suspense>
        <Preload all />
        {loop === 'always' && (
          <PerformanceMonitor
            ms={200}
            iterations={7}
            step={STEP}
            // Only read on mount: a remount resumes from what it learned.
            factor={factor}
            onChange={({ factor }) => setFactor(factor)}
            onIncline={() => (floor.current = false)}
            onDecline={({ factor }) => {
              if (floor.current) onOverload?.();
              floor.current = factor < STEP / 2;
              if (floor.current) setFactor(0);
            }}
          />
        )}
      </R3FCanvas>
    </div>
  );
}
