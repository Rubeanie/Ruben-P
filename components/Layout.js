import Navbar from "./Navbar";
import Footer from "./Footer";
import { Scrollbar } from "react-scrollbars-custom";

export default function Layout({children}) {
  return (
    <div>
      <Scrollbar className="ul" style={{ position: "" }}>
        <Navbar />
        {children}
        <Footer />
      </Scrollbar>
    </div>
  )
}