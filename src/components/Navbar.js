'use client';

import { Component, createRef } from 'react';
import Link from 'next/link';
import { RubenP } from '../lib/icons';
import { Controller, animated, SpringRef } from '@react-spring/web';
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

export default class Navbar extends Component {
  constructor() {
    super();
    this.navRef = createRef();
    this.logoRef = createRef();
    this.pagesRef = createRef();
    this.state = {
      showDropdown: false,
      openDropdown: false
    };
    this.api = SpringRef();
    this.animations = new Controller({
      WebkitBackdropFilter: "blur(1px)",
      backdropFilter: "blur(1px)",
      ref: this.api,
      config: {
        mass: 9,
        tension: 265,
        friction: 90,
        precision: 0.02,
        clamp: true,
      }
    });
  }
  componentDidMount() {
    this.updateNav();
    window.addEventListener('resize', this.updateNav);
    window.addEventListener('orientationchange', this.updateNav);
    window.addEventListener('scroll', this.handleScroll);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateNav);
    window.removeEventListener('orientationchange', this.updateNav);
    window.removeEventListener('scroll', this.handleScroll);
  }
  updateNav = () => {
    setTimeout(() => {
      this.setState({ showDropdown: false }, () => {
        const state =
          this.logoRef.current.offsetWidth +
            this.pagesRef.current.offsetWidth +
            136 >=
          this.navRef.current.offsetWidth;
        this.setState({ showDropdown: state });
      });
    }, 10);
  };
  changeDropdown = (state) => {
    this.setState({ openDropdown: state }, () => {
      document.documentElement.setAttribute('data-nav-dropdown', state);
      this.handleScroll();
    });
  };
  handleScroll = () => {
    console.log(this.animations)
    if (this.state.openDropdown) {
      this.animations.start({ WebkitBackdropFilter: "blur(7px)", backdropFilter: "blur(7px)" });
    } else if (window.scrollY > 80) {
      this.animations.start({ WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)" });
        document.documentElement.setAttribute('data-nav-scrolled', "true");
    } else {
      this.animations.start({ WebkitBackdropFilter: "blur(1px)", backdropFilter: "blur(1px)" });
        document.documentElement.setAttribute('data-nav-scrolled', "false");
    }
  };
  render() {
    const { showDropdown, openDropdown } = this.state;

    return (
      <animated.nav style={ this.animations.springs }>
        <div className='container' ref={this.navRef}>
          <div className='dropdown'>
            <div
              className='column'
              onClick={() => {
                this.changeDropdown(false);
              }}>
              <Link href='/' passHref>
                <p>Home</p>
              </Link>
              {navbarData.pages.map((page) => (
                <Link key={`_${page.title}`} href={page.url} passHref>
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
          <div className='row-fixed' ref={this.pagesRef} hidden={showDropdown}>
            {navbarData.pages.map((page) => (
              <Link key={page.title} href={page.url} passHref>
                <p>{page.title}</p>
              </Link>
            ))}
          </div>
          <div hidden={!showDropdown}>
            <Hamburger
              toggled={openDropdown}
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
      </animated.nav>
    );
  }
}
