import React from 'react';
import Link from 'next/link';
import { RubenP } from '../lib/icons';
import { Squeeze as Hamburger } from 'hamburger-react';

const navbarData = {
  pages: [
    {
      title: 'About',
      url: '/about'
    },
    {
      title: 'Portfolio',
      url: '/portfolio'
    },
    {
      title: 'Socials',
      url: '/socials'
    }
  ]
};

export default class navbar extends React.Component {
  constructor() {
    super();
    this.navRef = React.createRef();
    this.logoRef = React.createRef();
    this.pagesRef = React.createRef();
    this.state = {
      setOpen: false,
      showDropdown: false,
      openDropdownInt: 0
    };
    this.componentDidResize = this.componentDidResize.bind(this);
    this.componentDidRotate = this.componentDidRotate.bind(this);
    this.changeDropdown = this.changeDropdown.bind(this);
  }
  componentDidMount() {
    this.componentDidRotate();
    window.addEventListener('resize', this.componentDidResize);
    window.addEventListener('orientationchange', this.componentDidRotate);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.componentDidResize);
    window.removeEventListener('orientationchange', this.componentDidRotate);
  }
  componentDidResize() {
    this.setState(
      {
        showDropdown: false
      },
      function () {
        this.setState({
          showDropdown:
            this.logoRef.current.offsetWidth +
              this.pagesRef.current.offsetWidth +
              136 >=
            this.navRef.current.offsetWidth
        });
      }
    );
  }
  componentDidRotate() {
    setTimeout(() => {
      this.componentDidResize();
    }, 10);
  }
  changeDropdown(x) {
    this.setState(() => ({
      setOpen: x,
      openDropdown: x,
      openDropdownInt: x ? 1 : 0
    }));
    if (x) {
      document.documentElement.style.setProperty('--color-overlay-alpha', 0.6);
      document.body.classList.add('no-scroll');
    } else {
      document.documentElement.style.setProperty(
        '--color-overlay-alpha',
        0.325
      );
      document.body.classList.remove('no-scroll');
    }
  }
  render() {
    return (
      <nav>
        <div className='container' ref={this.navRef}>
          <div
            className='dropdown'
            style={{
              transform: `translate(0, 50vh) scale(1, ${this.state.openDropdownInt})`,
              opacity: this.state.openDropdownInt
            }}>
            <div
              className='column'
              style={{ justifyContent: 'flex-start' }}
              onClick={() => {
                this.changeDropdown(false);
              }}>
              <Link
                href='/'
                passHref
                style={{
                  transform: `scale(${this.state.openDropdownInt}, ${this.state.openDropdownInt})`
                }}>
                <p>Home</p>
              </Link>
              {navbarData.pages.map((page) => (
                <Link
                  key={`_${page.title}`}
                  href={page.url}
                  passHref
                  style={{
                    transform: `scale(${this.state.openDropdownInt}, ${this.state.openDropdownInt})`
                  }}>
                  <p>{page.title}</p>
                </Link>
              ))}
            </div>
          </div>
          <Link href='/' passHref title='Home' ref={this.logoRef}>
            <RubenP
              onClick={() => {
                this.changeDropdown(false);
              }}
            />
          </Link>
          <div
            className='row-fixed'
            ref={this.pagesRef}
            hidden={this.state.showDropdown}>
            {navbarData.pages.map((page) => (
              <Link key={page.title} href={page.url} passHref>
                <p>{page.title}</p>
              </Link>
            ))}
          </div>
          <div hidden={!this.state.showDropdown}>
            <Hamburger
              toggled={this.state.setOpen}
              toggle={this.changeDropdown}
              size={37.5}
              duration={0.3}
              distance='sm'
              color='var(--color-primary)'
              easing='ease-out'
              rounded={true}
            />
          </div>
        </div>
      </nav>
    );
  }
}
