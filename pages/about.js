import Head from "next/head";
import Image from "next/image";

export default function About() {
  return (
    <div className="page">
      <Head>
        <title>About</title>
        <meta name="description" content="More about me." />
      </Head>
      <hero>
        <div className="row">
          <div className="flex-padding" style={{ flex: "33%" }}>
            <div className="column">
              <Image
                src={
                  "https://res.cloudinary.com/ruben-p/image/upload/v1642990790/Images/About/Personal-Photo.webp"
                }
                alt="A photo of Ruben Panzich"
                width={"100%"}
              />
              <h2>
                -Ruben.P
                <br />▼
              </h2>
            </div>
          </div>
          <div className="flex-padding" style={{ flex: "66%" }}>
            <div className="column">
              <h1-image>ABOUT</h1-image>
            </div>
          </div>
        </div>
      </hero>
      <heros>
        <div className="row">
          <div className="column">
            <p>
              Hi! <br /> My name is Ruben Panzich, I am a student currently
              attending year 11 at Hale school, my subjects include: <br /> AIT
              (ATAR) <br /> Engineering (ATAR) <br /> Maths applications (ATAR){" "}
              <br />
              English (ATAR) <br /> Economics (ATAR) <br /> Cert IV in Game
              Development
            </p>
            <h2>My Story</h2>
            <p>
              Ever since I was a little boy, I’ve been obsessed with video
              games. This passion has propelled me into the wonderful world of
              stem where I have been taken to many places ranging from school to
              university. Since I’ve begun this journey I’ve learnt about Unity,
              design, 3D modeling, coding and many other skills, during this
              journey a lot of these skills have been given time to flourish in
              the subject AIT, leading me to the point I am now. Currently as of
              2021 a Hale student.
            </p>
          </div>
        </div>
      </heros>
    </div>
  );
}
