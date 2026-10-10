'use client';

// Last resort when the root layout itself fails: it replaces the layout, so it
// carries its own html and body and cannot use the site's styles.
export default function GlobalError({ retry }) {
  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
        <main>
          <title>Something went wrong</title>
          <h1>Something went wrong</h1>
          <p>The page could not be loaded.</p>
          <button type='button' onClick={() => retry()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
