export const metadata = {
  title: 'Page cannot be found',
  description: 'Error 404, page cannot be found.'
};

export default function NotFound() {
  return (
    <div className='page'>
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
