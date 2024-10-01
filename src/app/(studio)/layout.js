import '@/styles/sanity.scss';
import Signature from '@/components/Signature';

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://www.gstatic.com' />
        <link rel='preconnect' href='https://api.sanity.com' />
        <link rel='preconnect' href='https://cdn.sanity.io' />
        <link rel='preconnect' href='https://res.cloudinary.com' />
      </head>
      <body style={{ margin: '0px' }}>
        <Preload />
        <Signature />
        <main>{children}</main>
      </body>
    </html>
  );
}
