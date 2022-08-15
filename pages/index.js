import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  RefObject,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  addEffect,
  addAfterEffect,
} from "@react-three/fiber";
import { animated } from "@react-spring/three";
import Head from "next/head";
import { Instances, Model } from "../components/RP-Logo";
import { GetColor } from "../components/Style";
import Image from "next/image";
import {
  useProgress,
  Preload,
  OrbitControls,
  CameraShake,
  Environment,
  AdaptiveDpr,
  Html,
} from "@react-three/drei";
import { a, useTransition, useSpring } from "@react-spring/three";

import StatsImpl from "stats.js";

/* function Stats({ showPanel = 0, className, parent }) {
  const [stats] = useState(() => new StatsImpl());
  useEffect(() => {
    const node = (parent && parent.current) || document.body;

    stats.showPanel(showPanel);
    node.appendChild(stats.dom);

    if (className) stats.dom.classList.add(className);

    const begin = addEffect(() => stats.begin());
    const end = addAfterEffect(() => stats.end());

    return () => {
      node.removeChild(stats.dom);
      begin();
      end();
    };
  }, [parent]);
  return null;
} */

function FrameLimiter({ limit = 60 }) {
  const { invalidate, clock, advance } = useThree();
  useEffect(() => {
    let delta = 0;
    const interval = 1 / limit;
    const update = () => {
      requestAnimationFrame(update);
      delta += clock.getDelta();

      if (delta > interval) {
        invalidate();
        delta = delta % interval;
      }
    };

    update();
  }, []);

  return null;
}

/* 
TODO: Add transition animation, scroll animation, more performance increases, use react spring more, more optimization and remove unneeded packages and libraries
*/

function Logo() {
  const { active, progress } = useProgress();
  const myMesh = React.useRef();

  /* const { scale } = useSpring({
    to: {
      scale: window.screen.width / 600,
    },
    from: { scale: 0 },
    config: { mass: 5, tension: 500, friction: 150 },
  }); */

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime() / 3;
    myMesh.current.rotation.y = a;
    let scale = window.screen.width / 600;
    if (scale > 1) {
      scale = 1;
    }
    myMesh.current.scale.set(scale, scale, scale);
  });

  return (
    <animated.mesh ref={myMesh} /*scale={scale} opacity={opacity} */>
      <Instances>
        <Model scale={[1, 1, 1]} />
      </Instances>
    </animated.mesh>
  );
}

function Age() {
  let { AgeFromDate } = require("age-calculator");

  return new AgeFromDate(new Date("2004-07-26")).age;
}

export default function Home() {
  const { active, progress } = useProgress();
  const [height, setHeight] = useState(0);
  const updateDimensions = () => {
    setHeight(window.innerHeight);
  };
  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  return (
    <div className="page">
      <Head>
        <title>Home | Ruben Panzich</title>
        <meta
          name="description"
          content="I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
        />
      </Head>
      <div
        className="row layer"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 60, near: 0.5, far: 6 }}
          dpr={[0, 1]}
          frameloop="demand"
        >
          <pointLight
            position={[-8, 1, 6]}
            color={GetColor("--color-mid-ground")}
            intensity={1.15}
          />
          <pointLight
            position={[0, 1, 8]}
            color={GetColor("--color-foreground")}
            intensity={1}
          />
          <pointLight
            position={[8, 1, 6]}
            color={GetColor("--color-mid-ground")}
            intensity={1.15}
          />
          <Suspense
            fallback={
              <Html center className="placeholder">
                <div
                  className="column"
                  style={{
                    height: `calc(361.1867px/(841 / ${height}))`,
                    maxHeight: `calc(59.7347vw/(841 / ${height}))`,
                    width: `calc(520px/(841 / ${height}))`,
                    maxWidth: `calc(86vw/(841 / ${height}))`,
                    transition: "opacity 0.5s",
                    opacity: progress < 70 ? 1 : 0,
                  }}
                >
                  <Image
                    src="/placeholders/Placeholder RP-Logo.webp"
                    alt="RP-Logo 3D model placeholder"
                    layout="fill"
                    priority
                    placeholder="blur"
                    blurDataURL="/placeholders/Placeholder RP-Logo Low Res.webp"
                  />
                </div>
              </Html>
            }
          >
            <Logo />
            {/* <Stats /> */}
            <FrameLimiter limit={30} />
            <AdaptiveDpr pixelated />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
      <hero style={{ width: "100%", height: "100%", zIndex: 1 }}>
        <div className="column">
          <div className="layer">
            <div className="column">
              <h1-image>
                Ruben
                <br />
                Panzich
              </h1-image>
              <p>
                <Age />
                -year-old student
                <br />
                freelance creative artist/developer
              </p>
            </div>
          </div>
        </div>
      </hero>
    </div>
  );
}
