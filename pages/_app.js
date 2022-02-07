import Layout from "../components/Layout";
import "../styles/globals.scss";
import Head from "next/head";
import Var from "../styles/abstracts/_colors.module.scss";
import Signature from "../components/Signature";
import { Loader } from "../components/Loader";
import Particles from "react-tsparticles";

const options = {
  fpsLimit: 30,
  background: {
    color: {
      value: Var.background_color,
    },
  },
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "repulse",
      },
    },
  },
  particles: {
    color: {
      value: Var.foreground_color,
    },
    links: {
      color: {
        value: Var.midground_color,
      },
      enable: true,
      opacity: 0.75,
    },
    move: {
      enable: true,
      outModes: {
        bottom: "out",
        left: "out",
        right: "out",
        top: "out",
      },
      speed: 1,
    },
    number: {
      density: {
        enable: true,
      },
      limit: 120,
      value: 80,
    },
    opacity: {
      value: 0.75,
    },
    size: {
      value: {
        min: 0.1,
        max: 3,
      },
    },
    detectRetina: true,
  },
};

function MyApp({ Component, pageProps }) {
  return (
    <div className="App">
      <Head>
        <link rel="icon" type="image/png" href="/favicon/RP-Logo-Apple.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="mask-icon" href="/favicon/RP-Logo.svg" color="#000000" />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />

        <meta name="msapplication-TileColor" content={Var.foreground_color} />
        <meta name="theme-color" content={Var.overlay_background_color} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />

        <meta key="robots" name="robots" content="index,follow" />
        <meta key="googlebot" name="googlebot" content="index,follow" />
      </Head>
      <Particles options={options} />
      <Signature />
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Loader />
    </div>
  );
}

export default MyApp;
