import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Age } from '../lib/common';

//TODO: Implement placeholder transition - Stop model rotation before load - use model as a child - look at example website

const CustomCanvas = dynamic(
  async () => {
    const component = await import('../components/CustomCanvas');
    return component.CustomCanvas;
  },
  { ssr: false }
);

export default function Home() {
  return (
    <div className='page'>
      <Head>
        <title>Home | Ruben Panzich</title>
        <meta
          name='description'
          content="I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
        />
        <link
          rel='prefetch'
          crossOrigin='anonymous'
          href='https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/Placeholder%20RP-Logo.webp'
        />
      </Head>
      <CustomCanvas />
      <div
        className='hero-no-padding mobile'
        style={{ width: '100%', height: '100%', zIndex: 1 }}>
        <div className='column'>
          <div className='layer'>
            <div className='column'>
              <h1 className='img-heading'>
                Ruben
                <br />
                Panzich
              </h1>
              <p>
                <Age />
                -year-old student
                <br />
                freelance creative artist/developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
