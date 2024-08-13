'use client';

import { Component, createRef } from 'react';
import Link from 'next/link';
import { RubenP } from '@/utils/icons';
import { Controller, animated, SpringRef } from '@react-spring/web';
import { Squeeze as Hamburger } from 'hamburger-react';

const navbarData = {
  navigation: [
    {
      title: 'About',
      icon: <p>About</p>,
      url: '/about'
    },
    {
      title: 'Portfolio',
      icon: <p>Portfolio</p>,
      url: '/portfolio'
    },
    {
      title: 'Socials',
      icon: <p>Socials</p>,
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
      WebkitBackdropFilter: 'blur(1px)',
      backdropFilter: 'blur(1px)',
      ref: this.api,
      config: {
        mass: 9,
        tension: 265,
        friction: 90,
        precision: 0.02,
        clamp: true
      }
    });
  }
  componentDidMount() {
    this.resizeObserver = new ResizeObserver(this.updateNav);
    this.resizeObserver.observe(this.navRef.current);
    this.resizeObserver.observe(this.logoRef.current);
    this.resizeObserver.observe(this.pagesRef.current);
    window.addEventListener('scroll', this.handleScroll);
    this.handleScroll();
  }
  componentWillUnmount() {
    this.resizeObserver.disconnect();
    window.removeEventListener('scroll', this.handleScroll);
  }
  updateNav = () => {
    const state = this.logoRef.current.offsetWidth +
          this.pagesRef.current.offsetWidth +
          136 >=
        this.navRef.current.offsetWidth;
    this.setState(
      { showDropdown: state }, () => {
        if(!state) {
          this.changeDropdown(false);
        }
      }
    );
  };
  changeDropdown = (state) => {
    this.setState({ openDropdown: state }, () => {
      document.documentElement.setAttribute('data-nav-dropdown', state);
    });
  };
  handleScroll = () => {
    if (this.state.openDropdown) {
      this.animations.start({
        WebkitBackdropFilter: 'blur(7px)',
        backdropFilter: 'blur(7px)'
      });
    } else if (window.scrollY > 80) {
      this.animations.start({
        WebkitBackdropFilter: 'blur(4px)',
        backdropFilter: 'blur(4px)'
      });
      document.documentElement.setAttribute('data-nav-scrolled', 'true');
    } else {
      this.animations.start({
        WebkitBackdropFilter: 'blur(1px)',
        backdropFilter: 'blur(1px)'
      });
      document.documentElement.setAttribute('data-nav-scrolled', 'false');
    }
  };
  render() {
    const { showDropdown, openDropdown } = this.state;

    return (
      <animated.nav style={this.animations.springs}>
        <div className='container' ref={this.navRef}>
          <Link href='/' passHref title='Home' ref={this.logoRef}>
            <RubenP
              onClick={() => {
                this.changeDropdown(false);
              }}
            />
          </Link>
          <div
            className={`row-fixed ${showDropdown ? 'hidden' : ''}`}
            ref={this.pagesRef}>
            {navbarData.navigation.map((link) => (
              <Link key={link.title} href={link.url} passHref>
                {link.icon}
              </Link>
            ))}
          </div>
          <div className='dropdown'>
            <div
              className='column'
              onClick={() => {
                this.changeDropdown(false);
              }}>
              <Link href='/' passHref>
                <p>Home</p>
              </Link>
              {navbarData.navigation.map((link) => (
                <Link key={`dropdown_${link.title}`} href={link.url} passHref>
                  {link.icon}
                </Link>
              ))}
            </div>
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
              label='Show menu'
            />
          </div>
        </div>
      </animated.nav>
    );
  }
}
