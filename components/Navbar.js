import Link from 'next/link'

const Navbar = () => {
  return (
    <nav>
      <div>
        <Link href="/" passHref>
          <a>Ruben</a>
        </Link>
      </div>
      <div>
      <Link href="/model" passHref>
          <a>Home</a>
        </Link>
        <Link href="/about" passHref>
          <a>About</a>
        </Link>
        <Link href="/contact" passHref>
          <a>Contact</a>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
