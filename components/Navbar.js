import React from 'react'
import Link from 'next/link'
import { RubenP } from './Icons'
import { Squeeze as Hamburger } from 'hamburger-react'

const navbarData = {
  pages: [
    {
      title: 'About',
      url: '/about',
    },
    {
      title: 'Portfolio',
      url: '/portfolio',
    },
    {
      title: 'Socials',
      url: '/socials',
    },
  ],
}

export default class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.navRef = React.createRef()
    this.logoRef = React.createRef()
    this.pagesRef = React.createRef()
    this.state = {
      setOpen: false,
      showDropdown: false,
      openDropdownInt: 0,
    }
    this.componentDidResize = this.componentDidResize.bind(this)
    this.componentDidRotate = this.componentDidRotate.bind(this)
    this.changeDropdown = this.changeDropdown.bind(this)
  }
  componentDidMount() {
    this.componentDidRotate(this)
    window.addEventListener('resize', this.componentDidResize)
    window.addEventListener('orientationchange', this.componentDidRotate)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.componentDidResize)
    window.removeEventListener('orientationchange', this.componentDidRotate)
  }
  componentDidResize(showDropdown) {
    this.setState(
      {
        showDropdown: false,
      },
      function () {
        this.setState({
          showDropdown:
            this.logoRef.current.offsetWidth +
              this.pagesRef.current.offsetWidth +
              68 >=
            this.navRef.current.offsetWidth,
        })
      },
    )
  }
  componentDidRotate(showDropdown) {
    setTimeout(() => {
      this.componentDidResize(this)
    }, 10)
  }
  changeDropdown(x) {
    this.setState(() => ({
      setOpen: x,
      openDropdown: x,
      openDropdownInt: x ? 1 : 0,
    }))
  }
  render() {
    return (
      <div className="navbar" ref={this.navRef}>
        <div
          className="dropdown"
          style={{
            transform: `translate(0, 50vh) scale(1, ${this.state.openDropdownInt})`,
            opacity: this.state.openDropdownInt,
          }}
        >
          <div
            className="column"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => {
              this.changeDropdown(false)
            }}
          >
            <Link href="/" passHref legacyBehavior>
              <a
                className="button"
                style={{
                  transform: `scale(${this.state.openDropdownInt}, ${this.state.openDropdownInt})`,
                }}
              >
                Home
              </a>
            </Link>
            {navbarData.pages.map((page) => (
              <Link
                key={`_${page.title}`}
                href={page.url}
                passHref
                legacyBehavior
              >
                <a
                  className="button"
                  style={{
                    transform: `scale(${this.state.openDropdownInt}, ${this.state.openDropdownInt})`,
                  }}
                >
                  {page.title}
                </a>
              </Link>
            ))}
          </div>
        </div>
        <div ref={this.logoRef}>
          <Link href="/" passHref legacyBehavior>
            <a
              onClick={() => {
                this.changeDropdown(false)
              }}
            >
              <RubenP className="logo" />
            </a>
          </Link>
        </div>
        <div ref={this.pagesRef} hidden={this.state.showDropdown}>
          {navbarData.pages.map((page) => (
            <Link key={page.title} href={page.url} passHref legacyBehavior>
              <a className="button">{page.title}</a>
            </Link>
          ))}
        </div>
        <div hidden={!this.state.showDropdown}>
          <Hamburger
            toggled={this.state.setOpen}
            toggle={this.changeDropdown}
            size={37.5}
            duration={0.15}
            distance="sm"
            color="var(--color-foreground)"
            easing="ease-out"
            rounded={true}
          />
        </div>
      </div>
    )
  }
}
