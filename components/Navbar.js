import Link from 'next/link'
import Icon from './Icon'

const Navbar = () => {
  return (
    <div className='nav'>
      <div>
        <Link href="/" passHref>
        <a> <Icon className='svg'/> </a>
        </Link>
      </div>
      <div>
      <Link href="/about" passHref>
          <a className='button' >About</a>
        </Link>
        <Link href="/portfolio" passHref>
          <a className='button' >Portfolio</a>
        </Link>
        <Link href="/contact" passHref>
          <a className='button' >Contact</a>
        </Link>
      </div>
    </div>
  )
}

export default Navbar
