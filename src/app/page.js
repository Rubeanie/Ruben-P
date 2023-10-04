import { Age } from '../lib/common';
import dynamic from 'next/dynamic'
import { Canvas } from '../components/RpLogo';

//const Canvas = dynamic(() => import('../components/RpLogo'), { ssr: false })

export const metadata = {
  title: 'Home | Ruben Panzich',
  description:
    "I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
};

export default function page() {
  return (
    <div className='page'>
      <Canvas />
      <div
        className='hero-no-padding'
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
