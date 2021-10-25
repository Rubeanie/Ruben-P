import Navbar from "./Navbar";
import Footer from "./Footer";
import { useGLTF, Loader } from '@react-three/drei'

export default function Layout({children}) {
  return (
    <div>
      <div>
        <Loader />
      </div>
      <div className="bg-colour">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  )
}