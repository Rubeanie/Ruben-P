import React, {
  Suspense,
  useState,
  useEffect,
} from "react";
import {
  Canvas,
  useFrame,
} from "@react-three/fiber";
import { animated } from "@react-spring/three";
import Head from "next/head";
import { Model } from "../lib/rpLogo";
import { GetColor } from "../lib/themes";
import Image from "next/image";
import {
  useProgress,
  OrbitControls,
  Html,
} from "@react-three/drei";
import { Age, FPSLimiter, Stats } from "../lib/common";

/* 
TODO: scroll animation, more performance increases, use react spring more, more optimization and remove unneeded packages and libraries
*/

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
    <animated.mesh ref={myMesh} >
      <Model scale={[1, 1, 1]} />
    </animated.mesh>
  );
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
          gl={{
            powerPreference: "high-performance",
            stencil: false,
          }}
          camera={{ position: [0, 0, 3], fov: 60, near: 0.5, far: 6 }}
          dpr={[0, 1]}
          /* frameloop="demand" */
          
        >
          <pointLight
            position={[-8, 1, 6]}
            color={GetColor("--color-mid-ground")}
            intensity={110}
            distance={70}
          ></pointLight>
          <pointLight
            position={[0, 1, 8]}
            color={GetColor("--color-foreground")}
            intensity={85}
            distance={80}
          />
          <pointLight
            position={[8, 1, 6]}
            color={GetColor("--color-mid-ground")}
            intensity={110}
            distance={70}
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
                    position: "relative",
                    opacity: progress < 70 ? 1 : 0,
                  }}
                >
                  <Image
                    src="https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/Placeholder%20RP-Logo.webp"
                    alt="RP-Logo 3D model placeholder"
                    fill={true}
                    priority={true}
                  />
                </div>
              </Html>
            }
          >
            <Logo />
            {/* <Stats /> */}
            {/* <FPSLimiter limit={30} /> */}
          </Suspense>
        </Canvas>
      </div>
      <hero style={{ width: "100%", height: "100%", zIndex: 1 }}>
        <div className="column">
          <div className="layer">
            <div className="column">
              <h1-img>
                Ruben
                <br />
                Panzich
              </h1-img>
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
