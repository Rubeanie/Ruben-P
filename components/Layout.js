import Navbar from "./Navbar";
import Footer from "./Footer";
import ThemeSwitcher from "./ThemeSwitcher";
import Div100vh from "react-div-100vh";

export default function Layout({ children }) {
  return (
    <Div100vh>
      <Navbar />
      {children}
      <ThemeSwitcher />
      <Footer />
    </Div100vh>
  );
}
