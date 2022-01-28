import Head from "next/head";
import Social from "../../components/Social";
import Var from "../../styles/abstracts/_colors.module.scss";
import { BsTwitch, BsYoutube, BsSpotify, BsInstagram, BsTwitter, BsGithub } from "react-icons/bs";
import { FaSteam, FaDiscord, FaWpforms } from "react-icons/fa";

export default function links() {
  return (
    <div className="page">
      <Head>
        <title>Socials</title>
        <meta key="robots" name="robots" content="noindex,follow" />
        <meta key="googlebot" name="googlebot" content="noindex,follow" />
      </Head>
      <hero>
        <div className="column">
          <h2>Socials</h2>
          <a href="/socials/youtube" target="_blank">
            <Social
              name={"YouTube"}
              logo={<BsYoutube />}
              username={"@Rubeanie"}
              textColor={Var.backc}
              color={"#c4302b"}
            />
          </a>
          <a href="/socials/twitch" target="_blank">
            <Social
              name={"Twitch"}
              logo={<BsTwitch />}
              username={"@Rubeanie"}
              textColor={Var.backc}
              color={"#6441a5"}
            />
          </a>
          <a href="/socials/discord" target="_blank">
            <Social
              name={"Discord"}
              logo={<FaDiscord />}
              username={"discord.gg/B98bJGU"}
              textColor={Var.backc}
              color={"#5865f2"}
            />
          </a>
          <a href="/socials/twitter" target="_blank">
            <Social
              name={"Twitter"}
              logo={<BsTwitter />}
              username={"@TwitchRubeanie"}
              textColor={Var.backc}
              color={"#1da1f2"}
            />
          </a>
          <a href="/socials/instagram" target="_blank">
            <Social
              name={"Instagram"}
              logo={<BsInstagram />}
              username={"@rubeanie"}
              textColor={Var.backc}
              color={"#f09433"}
            />
          </a>
          <a href="/socials/spotify" target="_blank">
            <Social
              name={"Spotify"}
              logo={<BsSpotify />}
              username={"@ruben"}
              textColor={Var.backc}
              color={"#1DB954"}
            />
          </a>
          <a href="/socials/steam" target="_blank">
            <Social
              name={"Steam"}
              logo={<FaSteam />}
              username={"@rubeanie"}
              textColor={Var.backc}
              color={"#66c0f4"}
            />
          </a>
          <a href="/socials/github" target="_blank">
            <Social
              name={"Github"}
              logo={<BsGithub />}
              username={"@Rubeanie"}
              textColor={Var.backc}
              color={"#e1e8ed"}
            />
          </a>
          <a href="/contact" passHref>
            <Social
              name={"Contact"}
              logo={<FaWpforms />}
              username={"Information"}
              textColor={Var.backc}
              color={Var.forec}
            />
          </a>
        </div>
      </hero>
    </div>
  );
}
