import Layout from "../components/Layout";
import "../styles/globals.scss";
import Head from "next/head";
import Signature from "../components/Signature";
import { GetColor, GetBackgroundColor } from "../lib/themes";
import { Analytics } from '@vercel/analytics/react';

function App({ Component, pageProps }) {
  return (
    <div className="App">
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon/apple-touch-icon.png"
        ></link>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        ></link>
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        ></link>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        ></link>
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color={GetColor("--color-foreground")}
        ></link>
        <link rel="manifest" href="/site.webmanifest" ></link>
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" ></link>
        <meta
          name="msapplication-TileColor"
          content={GetColor("--color-foreground")}
        ></meta>
        <meta name="theme-color" content={GetBackgroundColor()} ></meta>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        ></meta>
        <meta name="darkreader-lock" ></meta>
        <meta
          name="keywords"
          content="Ruben, Panzich, Rubeanie, Portfolio, About, Links, Contact, Artist, Developer"
        ></meta>
        <meta key="robots" name="robots" content="index,follow" ></meta>
        <meta key="googlebot" name="googlebot" content="index,follow" ></meta>
        <link rel="preconnect" href="https://api.sanity.com" ></link>
        <link rel="preconnect" href="https://res.cloudinary.com" ></link>
        <link rel="preconnect" href="https://www.gstatic.com" ></link>
      </Head>
      <Signature />
      <div className="background-image" />
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </div>
  );
}

export default App;
