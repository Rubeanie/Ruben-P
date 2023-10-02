'use client';

import { Age } from '../lib/common';
import dynamic from 'next/dynamic'

const CustomCanvas = dynamic(() =>
  import('../components/CustomCanvas').then((mod) => mod.CustomCanvas), 
  { ssr: false }
);

export default function page() {
  return (
    <div className='page'>
      <CustomCanvas />
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
