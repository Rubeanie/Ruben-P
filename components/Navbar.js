import styled from 'styled-components'
import Link from 'next/link'

const StyledLink = styled.a`
  padding: var(--nav-padding);
`

const Navbar = () => {
  return (
    <nav>
      <div>
        <Link href="/" passHref>
          <StyledLink>Ruben</StyledLink>
        </Link>
      </div>
      <div>
      <Link href="/" passHref>
          <StyledLink>Home</StyledLink>
        </Link>
        <Link href="/about" passHref>
          <StyledLink>About</StyledLink>
        </Link>
        <Link href="/contact" passHref>
          <StyledLink>Contact</StyledLink>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
