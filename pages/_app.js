import Layout from '../components/Layout'
import '../styles/globals.scss'
import { useGLTF, Loader } from '@react-three/drei'


function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Loader />
    </Layout>
  )
}

useGLTF.preload('/RP-Logo.gltf')

export default MyApp
