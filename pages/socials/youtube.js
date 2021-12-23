import Head from "next/head";
import Redirect from "../../components/Redirect";
import { BsYoutube } from "react-icons/bs";

export default function YoutubeLink() {
  return (
    <div className="page">
      <Head>
        <title>YouTube Channel</title>
      </Head>
      <hero>
        <Redirect
          name={"YouTube"}
          logo={<BsYoutube />}
          url={"https://www.youtube.com/channel/UCV3-uGgDO32_MTii2006g-Q"}
        />
      </hero>
    </div>
  );
}
