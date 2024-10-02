import '@/styles/sanity.scss';
import Signature from '@/components/Signature';

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}) {
  return (
    <html lang='en'>
      <body style={{ margin: '0px' }}>
        <Preload />
        <Signature />
        <main>{children}</main>
      </body>
    </html>
  );
}
