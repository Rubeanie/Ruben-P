import Head from "next/head";
import Redirect from "../../components/Redirect";
import { FaDiscord } from "react-icons/fa";

export default function DiscordLink() {
  return (
    <div className="page">
      <Head>
        <title>YouTube Channel</title>
      </Head>
      <hero>
        <Redirect
          name={"Discord"}
          logo={<FaDiscord />}
          url={"https://discord.gg/B98bJGU"}
        />
      </hero>
    </div>
  );
}
