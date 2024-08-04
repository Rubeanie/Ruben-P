import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: 'Page cannot be found',
  description: 'Error 404, page cannot be found.'
};

export default function NotFound() {
  return (
    <>
      <div className='background-image' />
      <Navbar />
      <div className='page'>
        <div className='hero-no-padding'>
          <div className='column'>
            <h2 style={{ marginBlockEnd: '0px' }}>Error</h2>
            <h1 className='img-heading'>404</h1>
            <p>This page could not be found.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
