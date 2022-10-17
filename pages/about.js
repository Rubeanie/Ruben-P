import Head from "next/head";
import { AdvancedImage, lazyload, placeholder } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import {
  SiCplusplus,
  SiCsharp,
  SiHtml5,
  SiReact,
  SiCss3,
  SiSass,
  SiJavascript,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiAdobeaudition,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiBlender,
} from "react-icons/si";
import { 
  RpSubstanceSampler,
  RpSubstancePainter, 
  RpUnity,
} from "../components/Icons";
import Skill from "../components/Skill";
import { Module } from "../components/modules";

import { client } from "../lib/sanity";
import { PortableText } from "@portabletext/react";

const query = `*[_type == "page" && title == "About"][0] {
  _id,
  title,
  modules[]{
    _type == 'skills' => {
      _type,
      _key,
      skills[]->{
        name,
        "logo" : image.asset->url,
        textColor{
          hex
        },
        baseColor{
          hex
        },
        url
      }
    },
    _type == 'html' => {
      _type,
      _key,
      content[]
    }
  }
}
`;

export default function About({ data }) {
  const { modules = [] } = data
  console.log(data);
  console.log(modules);

  const cld = new Cloudinary({
    cloud: {
      cloudName: "ruben-p",
    },
  });

  const personalPhoto = cld.image(
    "Images/About/Personal-Photo.webp"
  );

  return (
    <div className="page">
      <Head>
        <title>About | Ruben Panzich</title>
        <meta
          name="description"
          content="More information about Ruben Panzich."
        />
        <meta key="robots" name="robots" content="index,follow" />
        <meta key="googlebot" name="googlebot" content="index,follow" />
      </Head>
      <hero className="about">
        <div className="row">
          <div className="flex-padding" style={{ flex: "40%" }}>
            <div className="column">
              <AdvancedImage
                cldImg={personalPhoto}
                className="photo"
                plugins={[
                  lazyload(),
                  placeholder({ mode: "predominant-color" }),
                  placeholder({ mode: "blur" }),
                ]}
              />
              <h2>
                -Ruben.P
                <br />▼
              </h2>
            </div>
          </div>
          <div className="flex-padding" style={{ flex: "60%" }}>
            <div className="column">
              <h1-image>ABOUT</h1-image>
            </div>
          </div>
        </div>
      </hero>
      <heros>
        <div className="column">
          {modules != null ? modules.map((module) => (
            <Module key={module._key} index={module._key} module={module} />
          )) : null}
        </div>
      </heros>
    </div>
  );
}

export const getStaticProps = async () => {
  const data = await client.fetch(query);
  return {
    props: { data } // will be passed to the page component as props
  };
};