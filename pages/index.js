import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import Head from "next/head";
import Model from "../components/RP-Logo";
import { GetColor } from "../components/Style";
import Image from "next/image";
import * as THREE from "three";
import {
  AdaptiveDpr,
  OrbitControls,
  CameraShake,
  Environment,
  Html,
} from "@react-three/drei";

function Logo() {
  const myMesh = React.useRef();

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
  return (
    <div className="page">
      <Head>
        <title>Home | Ruben Panzich</title>
        <meta
          name="description"
          content="I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
        />
      </Head>
      <div className="layer" style={{ width: "100%", height: "100%" }}>
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
                <div style={{ height: "56vh", width: "56vw", zIndex: 1 }}>
                  <Image
                    src="/placeholders/Placeholder RP-Logo.webp"
                    alt="RP-Logo 3D model placeholder"
                    width={575.88}
                    height={400}
                  />
                </div>
              </Html>
            }
          >
            <Logo />
          </Suspense>
        </Canvas>
      </div>
      <hero>
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
