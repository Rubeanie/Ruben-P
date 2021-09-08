import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({children}) {
  return (
    <div>
      <Navbar />
      <div className="scrollbar-custom">
        {children}
      </div>
      <Footer />
    </div>
  )
}