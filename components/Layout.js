import Navbar from "./Navbar";
import Footer from "./Footer";
import 'react-'

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