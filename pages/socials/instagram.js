import Head from "next/head";
import Redirect from "../../components/Redirect";
import { BsInstagram } from "react-icons/bs";

export default function InstagramLink() {
  return (
    <div className="page">
      <Head>
        <title>Instagram Account</title>
      </Head>
      <hero>
        <Redirect
          name={"Instagram"}
          logo={<BsInstagram />}
          url={"https://www.instagram.com/rubeanie/"}
        />
      </hero>
    </div>
  );
}
