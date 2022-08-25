import Navbar from "./Navbar";
import Footer from "./Footer";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
      <ThemeSwitcher />
      <Footer />
    </div>
  );
}
