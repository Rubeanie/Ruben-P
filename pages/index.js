import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import Head from "next/head";
import Model from "../components/RP-Logo";
import { GetColor } from "../components/Style";
import Image from "next/image";
import * as THREE from "three";
import {
  AdaptiveDpr,
  useProgress,
  OrbitControls,
  CameraShake,
  Environment,
  Html,
} from "@react-three/drei";

function Logo() {
  const { active, progress } = useProgress();
  const myMesh = React.useRef();

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime() / 3;
    //myMesh.current.rotation.y = a;
    let scale = window.screen.width / 600;
    if (scale > 1) {
      scale = 1;
    }
    myMesh.current.scale.set(scale, scale, scale);
  });

  return (
    <animated.mesh ref={myMesh}>
      <Model scale={[1, 1, 1]} />
    </animated.mesh>
  );
}

function Age() {
  let { AgeFromDate } = require("age-calculator");

  return new AgeFromDate(new Date("2004-07-26")).age;
}

export default function Home() {
  const { active, progress } = useProgress()
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
        className="layer"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 60 }}
          dpr={[0, 1]}
          style={{ width: "100%", height: "100%" }}
          /* frameloop="demand" */
        >
          <AdaptiveDpr pixelated />
          <ambientLight intensity={1} />
          <pointLight
            position={[-8, 1, 6]}
            color={GetColor("--color-mid-ground")}
            intensity={0.65}
          />
          <pointLight
            position={[0, 1, 8]}
            color={GetColor("--color-foreground")}
            intensity={0.65}
          />
          <pointLight
            position={[8, 1, 6]}
            color={GetColor("--color-mid-ground")}
            intensity={0.65}
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
                    opacity: progress > 70 ? 1 : 0,
                  }}
                >
                  <Image
                    src="/placeholders/Placeholder RP-Logo.webp"
                    alt="RP-Logo 3D model placeholder"
                    layout="fill"
                    priority={true}
                    placeholder="blur"
                    blurDataURL="/placeholders/Placeholder RP-Logo Low Res.webp"
                  />
                </div>
              </Html>
            }
          >
            <Logo />
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
