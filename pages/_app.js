import Layout from '../components/Layout';
import '../styles/globals.scss';
import Head from 'next/head';
import Signature from '../components/Signature';
import { useColor, useBackgroundColor } from '../lib/themes';
import { Analytics } from '@vercel/analytics/react';

function App({ Component, pageProps }) {
  return (
    <div className='App'>
      <Head>
        <link
          rel='icon'
          type='image/png'
          href='/favicon/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon/favicon-16x16.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/favicon/apple-touch-icon.png'
        />
        <link
          rel='mask-icon'
          href='/favicon/safari-pinned-tab.svg'
          color={useColor('--color-primary')}
        />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='icon' type='image/svg+xml' href='/favicon/favicon.svg' />
        <meta
          name='msapplication-TileColor'
          content={useColor('--color-primary')}
        />
        <meta name='theme-color' content={useBackgroundColor()} />
        <meta
          name='viewport'
          content='height=device-height, width=device-width, initial-scale=1.0, viewport-fit=cover'
        />
        <meta name='darkreader-lock' />
        <meta
          name='keywords'
          content='Ruben, Panzich, Rubeanie, Portfolio, About, Links, Contact, Artist, Developer'
        />
        <meta key='robots' name='robots' content='index,follow' />
        <meta key='googlebot' name='googlebot' content='index,follow' />
        <link rel='preconnect' href='https://api.sanity.com' crossorigin='' />
        <link rel='preconnect' href='https://cdn.sanity.io' crossorigin='' />
        <link rel='preconnect' href='https://res.cloudinary.com' />
        <link rel='preconnect' href='https://www.gstatic.com' />
        <link
          rel='prefetch'
          crossOrigin='anonymous'
          href='https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_wasm_wrapper.js'
        />
        <link
          rel='prefetch'
          crossOrigin='anonymous'
          href='https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_decoder.wasm'
        />
      </Head>
      <Signature />
      <div className='background-image' />
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </div>
  );
}

export default App;
