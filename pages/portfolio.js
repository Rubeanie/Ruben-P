import Head from "next/head";

export default function Portfolio() {
  return (
    <div className="page">
      <Head>
        <title>Portfolio | Ruben Panzich</title>
        <meta name="description" content="Ruben Panzich's work portfolio." />
        <meta key="robots" name="robots" content="index,follow" />
        <meta key="googlebot" name="googlebot" content="index,follow" />
      </Head>
      <hero>
        <h1-img>Portfolio</h1-img>
        <p>Coming Soon...</p>
      </hero>
    </div>
  );
}
