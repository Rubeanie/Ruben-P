/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export default function Model(props) {
  const group = useRef();
  const { nodes, materials } = useGLTF(
    "https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/RP-Logo.glb"
  );
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        geometry={nodes["RP_-_Logo002"].geometry}
        material={materials.Abstract}
      />
    </group>
  );
}

useGLTF.preload(
  "https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/RP-Logo.glb"
);
