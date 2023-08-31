import Head from "next/head";
import Redirect from "../../components/Redirect";
import { BsSpotify } from "react-icons/bs";

export default function SpotifyLink() {
  return (
    <div className="page">
      <Head>
        <title>Spotify Profile</title>
      </Head>
      <div className="hero">
        <Redirect
          name={"Spotify"}
          logo={<BsSpotify />}
          url={"https://open.spotify.com/user/rubeanie?si=87761d3bc88f4fcc"}
        />
      </div>
    </div>
  );
}
