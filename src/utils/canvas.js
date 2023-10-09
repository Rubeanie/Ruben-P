/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import canvasStyles from '@/styles/utils/canvas.module.scss';
import { forwardRef, Suspense, useState, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from 'react-spring';
import { extend, createRoot, unmountComponentAtNode } from '@react-three/fiber';
import {
  ColorManagement as _ColorManagement,
  Group as _Group,
  Mesh as _Mesh,
  PointLight as _PointLight
} from 'three';
import { Preload, PerformanceMonitor } from '@react-three/drei';
import round from 'lodash/round';
import { Perf } from 'r3f-perf';

extend({
  ColorManagement: _ColorManagement,
  Group: _Group,
  Mesh: _Mesh,
  PointLight: _PointLight
});

const defaultProps = {
  gl: {
    precision: 'lowp',
    powerPreference: 'high-performance'
  },
  size: {
    width: 0,
    height: 0
  },
  camera: { fov: 75, near: 0.1, far: 1000, position: [0, 0, 6] },
  fallback: null
}

export const canvas = forwardRef((props, ref) => {
  const { gl, size, camera, fallback, styles, children } = { ...defaultProps, ...props };

  const [dpr, setDpr] = useState(0.9);
  const canvasRef = useRef(null);
  const [root, setRoot] = useState(null);
  const [perf, setPerf] = useState(null);
  const [render, setRender] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && size.width > 0 && size.height > 0) {
      const newRoot = root || createRoot(canvas);
      if (!root) setRoot(newRoot);

      newRoot.configure({
        gl: gl,
        size: size,
        dpr: dpr,
        camera: camera
      });

      setRender(true);
    }
  }, [dpr, gl, size]);

  useIsomorphicLayoutEffect(() => {
    if (render && size.width > 0 && size.height > 0) {
      root.render(
        <>
          {perf ? <Perf position={'bottom-right'} /> : null}
          <PerformanceMonitor
            ms={200}
            iterations={7}
            step={0.05}
            factor={1}
            onChange={({ factor }) => setDpr(round(0.5 + 0.5 * factor, 2))}
          />
          <Suspense fallback={fallback}>{children}</Suspense>
          <Preload all />
        </>
      );
    }
  }, [children, perf, render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    function performanceMonitor(enable) {
      setPerf(enable === true);
      return `Performance Monitor: ${enable}`;
    }
    window.performanceMonitor = performanceMonitor;
    return () => {
      if (canvas && root) {
        unmountComponentAtNode(canvas);
      }
    };
  }, []);

  return (
    <div ref={ref} className={styles}>
      <canvas ref={canvasRef} className={canvasStyles.canvas} />
    </div>
  );
});

canvas.displayName = 'Canvas';