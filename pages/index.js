import React, { Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { animated } from "@react-spring/three";
import Head from "next/head";
import Model from "../components/RP-Logo";
import { GetColor, StyleGenerator } from "../components/Style";

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
        <meta
          name="keywords"
          content="Ruben, Panzich, Portfolio, About, Links, Contact, Artist, Developer"
        />
      </Head>
      <hero>
        <div className="column">
          <div className="layer">
            <model>
              <Canvas
                colorManagement
                camera={{ position: [0, 0, 2], fov: 80 }}
                style={{ width: "90vw", height: "90vh" }}
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
                  <Age />
                  -year-old student
                  <br />
                  freelance creative artist/developer
                </p>
              </div>
            </div>
          </div>
        </div>
      </hero>
    </div>
  );
}
