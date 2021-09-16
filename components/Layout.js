/* TODO: set up css custom scrollbar https://codepen.io/trstnpr/pen/abomLGa */

import Navbar from "./Navbar";
import Footer from "./Footer";
import { useGLTF, Loader } from '@react-three/drei'

export default function Layout({children}) {
  return (
    <div className="bg-colour">
      <Navbar />
      {children}
      <Footer />
      <Loader />
    </div>
  )
}

useGLTF.preload('/RP-Logo.gltf')