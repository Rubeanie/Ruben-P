import Navbar from './Navbar';
import Footer from './Footer';
import { Theme } from '../lib/themes';

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
      <Theme />
      <Footer />
    </div>
  );
}
