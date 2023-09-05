import React from 'react';
import Head from 'next/head';
import { Age /* , Stats */ } from '../lib/common';
import CustomCanvas from '../components/CustomCanvas';

export default function Home() {
  return (
    <div className='page'>
      <Head>
        <title>Home | Ruben Panzich</title>
        <meta
          name='description'
          content="I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
        />
      </Head>
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
