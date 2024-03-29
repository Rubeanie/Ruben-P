import Head from 'next/head';

export default function Portfolio() {
  return (
    <div className='page'>
      <Head>
        <title>Portfolio | Ruben Panzich</title>
        <meta name='description' content="Ruben Panzich's work portfolio." />
        <meta key='robots' name='robots' content='index,follow' />
        <meta key='googlebot' name='googlebot' content='index,follow' />
      </Head>
      <div className='hero'>
        <h1 className='img-heading'>Portfolio</h1>
        <p>Coming Soon...</p>
      </div>
    </div>
  );
}
