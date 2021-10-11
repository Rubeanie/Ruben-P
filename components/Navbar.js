import Link from 'next/link'
import Icon from './Icon'

const Navbar = () => {
  return (
    <nav>
      <div>
        <Link href="/" passHref>
          <Icon className="svg"/>
        </Link>
      </div>
      <div>
      <Link href="/about" passHref>
          <a>About</a>
        </Link>
        <Link href="/portfolio" passHref>
          <a>Portfolio</a>
        </Link>
        <Link href="/contact" passHref>
          <a>Contact</a>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
