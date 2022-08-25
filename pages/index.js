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
import { Model } from "../components/RP-Logo";
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
import { a, useTransition, useSpring, config } from "@react-spring/three";
import { Age, FPSLimiter, Stats } from "../components/HomeComponents"

/* 
TODO: scroll animation, more performance increases, use react spring more, more optimization and remove unneeded packages and libraries
*/

function Logo() {
  const { active, progress } = useProgress();
  const myMesh = React.useRef();

  const { transparency } = useSpring({
    config: { mass: 5, tension: 500, friction: 100 },

    to: {
      transparency: 1,
    },
    from: { transparency: 0 },
  });

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
          concurrent={"true"}
          gl={{
            powerPreference: "high-performance",
            stencil: false,
          }}
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
                    position: "relative",
                    opacity: progress < 70 ? 1 : 0,
                  }}
                >
                  <Image
                    src="https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/Placeholder%20RP-Logo.webp"
                    alt="RP-Logo 3D model placeholder"
                    layout="fill"
                    priority={true}
                    placeholder="blur"
                    blurDataURL="https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/Placeholder%20RP-Logo.webp"
                  />
                </div>
              </Html>
            }
          >
            <Logo />
            {/* <Stats /> */}
            <FPSLimiter limit={30} />
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
