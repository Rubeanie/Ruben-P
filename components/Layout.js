import Navbar from "./Navbar";
import Footer from "./Footer";
import { useGLTF, Loader } from '@react-three/drei'
import Head from 'next/head'
import Var from '../styles/abstracts/_colors.module.scss'

export default function Layout({children}) {
  return (
    <div className="bg-colour">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon/RP-Logo-Apple.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />

        <link rel="mask-icon" href="/favicon/RP-Logo.svg" color="#000000" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />

        <link rel="manifest" href="/favicon/site.webmanifest" />

        <meta name="msapplication-TileColor" content={ Var.forec } />
        <meta name="theme-color" content={ Var.forec } />

      </Head>
      <Navbar />
      {children}
      <Footer />
      <Loader />
    </div>
  )
}