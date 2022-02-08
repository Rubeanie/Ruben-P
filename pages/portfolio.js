import Head from "next/head";
import Analytics from "../components/Ga";

export default function Portfolio() {
  return (
    <div className="page">
      <Head>
        <title>Portfolio | Ruben Panzich</title>
        <meta name="description" content="Ruben Panzich's work portfolio" />
        <meta key="robots" name="robots" content="index,follow" />
        <meta key="googlebot" name="googlebot" content="index,follow" />
      </Head>
      <Analytics />
      <hero>
        <h1-image>Portfolio</h1-image>
        <p>Coming Soon...</p>
      </hero>
    </div>
  );
}
