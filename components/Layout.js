import Navbar from "./Navbar";
import Footer from "./Footer";
import Scrollbar from "./scrollbar";

export default function Layout({children}) {
  return (
    <div>
      <Navbar />
        <Scrollbar>
          {children}
        </Scrollbar>
      <Footer />
    </div>
  )
}