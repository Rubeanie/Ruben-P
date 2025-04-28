import { Age } from '@/utils/common';
import HeroCanvas from '@/components/HeroCanvas';

export const metadata = {
  title: 'Home | Ruben Panzich',
  description:
    "I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
};

export default function Home() {
  return (
    <div className='page'>
      <HeroCanvas />
      <div
        className='hero-no-padding'>
        <div className='column'>
          <div className='layer'>
            <div className='column'>
              <h1 className='img-heading'>
                Ruben
                <br />
                Panzich
              </h1>
              <p>
                Freelance Creative Artist/Developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
