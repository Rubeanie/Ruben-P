import Head from "next/head";
import Redirect from "../../components/Redirect";
import { FaSteam } from "react-icons/fa";

export default function SteamLink() {
  return (
    <div className="page">
      <Head>
        <title>Steam Profile</title>
      </Head>
      <hero>
        <Redirect
          name={"Steam"}
          logo={<FaSteam />}
          url={"https://steamcommunity.com/id/Rubeanie/"}
        />
      </hero>
    </div>
  );
}
