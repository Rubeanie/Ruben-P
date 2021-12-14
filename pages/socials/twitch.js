import Head from "next/head";
import Redirect from "../../components/Redirect";
import { BsTwitch } from "react-icons/bs";

export default function TwitchLink() {
  return (
    <div className="page">
      <Head>
        <title>Twitch Channel</title>
      </Head>
      <hero>
        <Redirect
          name={"Twitch"}
          logo={<BsTwitch />}
          url={"https://www.twitch.tv/Rubeanie"}
        />
      </hero>
    </div>
  );
}
