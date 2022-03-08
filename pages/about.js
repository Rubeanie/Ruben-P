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
} from "react-icons/si";
import Skill from "../components/Skill";

export default function About() {
  const cld = new Cloudinary({
    cloud: {
      cloudName: "ruben-p",
    },
  });

  const personalPhoto = cld.image(
    "v1642990790/Images/About/Personal-Photo.webp"
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
          <h2>HELLO WORLD</h2>
          <p>
            My name is Ruben Panzich, I am a student currently attending year 12
            at Hale school, I am doing ATAR and have already achieved a: <br />{" "}
            &quot;Certificate IV in Digital and Interactive Games&quot;
          </p>
          <h2>My Story</h2>
          <p>
            Ever since I was a little boy, I’ve been obsessed with video games.
            This passion has propelled me into the wonderful world of stem where
            I have been taken to many places ranging from school to university.
            Since I’ve begun this journey I’ve learnt about Unity, design, 3D
            modeling, coding and many other skills, during this journey a lot of
            these skills have been given time to flourish in the subject AIT,
            leading me to the point I am now.
          </p>
          <h2>My Skills</h2>
          <div className="flex-box">
            <div className="item shadow">
              <Skill
                name={"C++"}
                logo={<SiCplusplus />}
                textColor={"#121212"}
                color={"#0180cd"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"C#"}
                logo={<SiCsharp />}
                textColor={"#121212"}
                color={"#239120"}
              />
            </div>
            <div className="item shadow">
              <Skill
                name={"C#"}
                logo={<SiHtml5 />}
                textColor={"#121212"}
                color={"#e34f26"}
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
                color={"#1572b6"}
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
                color={"#f7df1e"}
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
                color={"#007acc"}
              />
            </div>
          </div>
        </div>
      </heros>
    </div>
  );
}
