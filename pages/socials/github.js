import Head from "next/head";
import Redirect from "../../components/Redirect";
import { BsGithub } from "react-icons/bs";

export default function DiscordLink() {
  return (
    <div className="page">
      <Head>
        <title>YouTube Channel</title>
      </Head>
      <hero>
        <Redirect
          name={"Github"}
          logo={<BsGithub />}
          url={"https://github.com/Rubeanie"}
        />
      </hero>
    </div>
  );
}
