import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import Head from "next/head";
import Model from "../components/RP-Logo";
import { GetColor } from "../components/Style";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

function Logo() {
  const myMesh = React.useRef();
  const [active, setActive] = useState(false);

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

function Stars(props) {
  const ref = useRef();
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(5000), { radius: 1.5 })
  );
  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color={GetColor("--color-mid-ground")}
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
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
          camera={{ position: [0, 0, 2], fov: 80 }}
          style={{ width: "100%", height: "100%" }}
        >
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
          <Suspense fallback={null}>
            <Logo />
            <Stars />
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
