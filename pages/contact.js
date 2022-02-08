import Head from "next/head";
import Analytics from "../components/Ga";

export default function Contact() {
  return (
    <div className="page">
      <Head>
        <title>Contact | Ruben Panzich</title>
        <meta
          name="description"
          content="How to get in contact with Ruben Panzich"
        />
        <meta key="robots" name="robots" content="index,follow" />
        <meta key="googlebot" name="googlebot" content="index,follow" />
      </Head>
      <Analytics />
      <hero>
        <h1-image>CONTACT</h1-image>
        <p>Coming Soon...</p>
      </hero>
    </div>
  );
}
