import { Component, createRef } from 'react';
import Link from 'next/link';
import { RubenP } from '../lib/icons';
import { Squeeze as Hamburger } from 'hamburger-react';

//TODO: Implement body html data

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

export default class navbar extends Component {
  constructor() {
    super();
    this.navRef = createRef();
    this.logoRef = createRef();
    this.pagesRef = createRef();
    this.state = {
      setOpen: false,
      showDropdown: false,
      openDropdownInt: 0
    };
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
  componentDidResize = () => {
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
  componentDidRotate = () => {
    setTimeout(() => {
      this.componentDidResize();
    }, 10);
  }
  changeDropdown = (state) => {
    this.setState(() => ({
      setOpen: state,
      openDropdown: state,
      openDropdownInt: state ? 1 : 0
    }));
    if (state) {
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
