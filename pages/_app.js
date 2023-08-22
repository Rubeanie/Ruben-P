import { useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/globals.scss";
import Script from "next/script";
import Head from "next/head";
import Signature from "../components/Signature";
import { useRouter } from "next/router";
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
          />
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
          <link
            rel="mask-icon"
            href="/favicon/safari-pinned-tab.svg"
            color={GetColor("--color-foreground")}
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
          <meta
            name="msapplication-TileColor"
            content={GetColor("--color-foreground")}
          />
          <meta name="theme-color" content={GetBackgroundColor()} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
          />
          <meta name="darkreader-lock" />
          <meta
            name="keywords"
            content="Ruben, Panzich, Rubeanie, Portfolio, About, Links, Contact, Artist, Developer"
          />
          <meta key="robots" name="robots" content="index,follow" />
          <meta key="googlebot" name="googlebot" content="index,follow" />\
        </Head>
        <Signature />
        <div className="background-image"  />
        <Layout>
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </div>
    );
}

export default App;
