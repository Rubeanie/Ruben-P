import { useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/globals.scss";
import Script from "next/script";
import Head from "next/head";
import Signature from "../components/Signature";
import { Loader } from "../components/Loader";
import { useRouter } from "next/router";
import * as gtag from "../components/Ga";
import { GetColor, StyleGenerator } from "../components/Style";

function App({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <div className="App">
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
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

        <meta
          name="msapplication-TileColor"
          content={GetColor("--color-foreground")}
        />
        <meta name="theme-color" content={GetColor("--color-background")} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />

        <meta key="robots" name="robots" content="index,follow" />
        <meta key="googlebot" name="googlebot" content="index,follow" />
      </Head>
      <StyleGenerator />
      <Signature />
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Loader />
    </div>
  );
}

export default App;
