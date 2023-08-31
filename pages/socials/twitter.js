import Head from "next/head";
import Redirect from "../../components/Redirect";
import { BsTwitter } from "react-icons/bs";

export default function TwitterLink() {
  return (
    <div className="page">
      <Head>
        <title>YouTube Channel</title>
      </Head>
      <div className="hero">
        <Redirect
          name={"Twitter"}
          logo={<BsTwitter />}
          url={"https://twitter.com/TwitchRubeanie"}
        />
      </div>
    </div>
  );
}
