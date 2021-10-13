import Navbar from "./Navbar";
import Footer from "./Footer";
import { useGLTF, Loader } from '@react-three/drei'
import Head from 'next/head'

export default function Layout({children}) {
  return (
    <div className="bg-colour">
      <Head>
        <link rel="apple-touch-icon" href="/favicon/RP-Logo-Apple.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon/favicon.png" />
        <link rel="mask-icon" href="/favicon/RP-Logo.svg" color="#000000" />
      </Head>
      <Navbar />
      {children}
      <Footer />
      <Loader />
    </div>
  )
}