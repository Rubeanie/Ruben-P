import Head from 'next/head';

export default function Error() {
  return (
    <div className='page'>
      <Head>
        <title>Page cannot be found</title>
        <meta name='description' content='Error 404, page cannot be found.' />
        <meta key='robots' name='robots' content='noindex,follow' />
        <meta key='googlebot' name='googlebot' content='noindex,follow' />
      </Head>
      <div className='hero'>
        <div className='column'>
          <h2>Error</h2>
          <h1 className='img-heading'>404</h1>
          <p>This page could not be found.</p>
          <h2>Error</h2>
        </div>
      </div>
    </div>
  );
}
