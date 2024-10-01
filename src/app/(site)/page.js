import { Age } from '@/utils/common';
import HeroCanvas from '@/components/HeroCanvas';

export const metadata = {
  title: 'Home | Ruben Panzich',
  description:
    "I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
};

export default function Home() {
  return (
    <>
      <HeroCanvas />
      <div className='hero-no-padding'>
        <div className='column'>
          <div className='layer'>
            <div className='column'>
              <h1>
                <span className='image-text'>
                  Ruben
                  <br />
                  Panzich
                </span>
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
    </>
  );
}
