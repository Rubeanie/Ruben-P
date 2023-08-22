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
} from "../lib/icons";
import Skill from "../components/Skill";
import { AboutPageContent } from "../components/CMS"; 

export default function About() {
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
              <h1-img>ABOUT</h1-img>
            </div>
          </div>
        </div>
      </hero>
      <hero-content>
        <div className="column">
          <AboutPageContent />
          <div className="flex-box">
            <div className="item shadow">
              <Skill
                name={"C++"}
                logo={<SiCplusplus />}
                textColor={"#121212"}
                color={"#3b95cd"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"C#"}
                logo={<SiCsharp />}
                textColor={"#121212"}
                color={"#53BC50"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"HTML5"}
                logo={<SiHtml5 />}
                textColor={"#121212"}
                color={"#E35D38"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"React"}
                logo={<SiReact />}
                textColor={"#121212"}
                color={"#61DAFB"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"CSS3"}
                logo={<SiCss3 />}
                textColor={"#121212"}
                color={"#3880B6"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"SASS"}
                logo={<SiSass />}
                textColor={"#121212"}
                color={"#cc6699"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Javascript"}
                logo={<SiJavascript />}
                textColor={"#121212"}
                color={"#F7E454"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Next.js"}
                logo={<SiNextdotjs />}
                textColor={"#121212"}
                color={"#FFFFFF"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Typescript"}
                logo={<SiTypescript />}
                textColor={"#121212"}
                color={"#2C8BCC"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Node.js"}
                logo={<SiNodedotjs />}
                textColor={"#121212"}
                color={"#4D994D"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"After Effects"}
                logo={<SiAdobeaftereffects />}
                textColor={"#121212"}
                color={"#9999FF"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Premiere Pro"}
                logo={<SiAdobepremierepro />}
                textColor={"#121212"}
                color={"#9999FF"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Audition"}
                logo={<SiAdobeaudition />}
                textColor={"#121212"}
                color={"#9999FF"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Photoshop"}
                logo={<SiAdobephotoshop />}
                textColor={"#121212"}
                color={"#31a8ff"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Illustrator"}
                logo={<SiAdobeillustrator />}
                textColor={"#121212"}
                color={"#ff9a00"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Substance Painter"}
                logo={<RpSubstanceSampler />}
                textColor={"#121212"}
                color={"#8ad137"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Substance Sampler"}
                logo={<RpSubstancePainter />}
                textColor={"#121212"}
                color={"#8ad137"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Blender"}
                logo={<SiBlender />}
                textColor={"#121212"}
                color={"#DC872D"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"Unity"}
                logo={<RpUnity />}
                textColor={"#121212"}
                color={"#2d7b97"}
              />
            </div>
          </div>
        </div>
      </hero-content>
    </div>
  );
}