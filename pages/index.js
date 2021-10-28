import React, { Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Effects,
  Loader,
  useTexture,
} from "@react-three/drei";
import { useSpring, animated, config } from "@react-spring/three";
import Head from "next/head";
import Model from "../components/RP-Logo";
import Var from "../styles/abstracts/_colors.module.scss";

function Logo() {
  const myMesh = React.useRef();
  const [active, setActive] = useState(false);

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    myMesh.current.rotation.y = a;
    let scale = Math.cbrt(window.innerWidth / 700) * 0.65;
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

export default function Home() {
  return (
    <div className="page">
      <Head>
        <title>Home</title>
        <meta
          name="description"
          content="Freelance creative developer / Ruben Panzich"
        />
      </Head>
      <hero>
        <div className="layer">
          <model>
            <Canvas
              colorManagement
              camera={{ position: [0, 0, 2], fov: 80 }}
              style={{ width: "90vw", height: "90vh" }}
            >
              <pointLight
                position={[0, 1, 8]}
                color={Var.forec}
                intensity={0.25}
              />
              <ambientLight intensity={0.5} color={Var.midc} />
              <Suspense fallback={null}>
                <Logo />
              </Suspense>
            </Canvas>
          </model>
        </div>
        <div className="layer">
          <div className="row">
            <div className="column">
              <h1-image>
                Ruben
                <br />
                Panzich
              </h1-image>
              <p>
                17-year-old student
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
