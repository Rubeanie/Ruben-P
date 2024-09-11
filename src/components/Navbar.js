'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { RubenP } from '@/utils/icons';
import { useSpring, animated } from '@react-spring/web';
import { Squeeze as Hamburger } from 'hamburger-react';
import { addEffect } from '@react-three/fiber';
import Lenis from 'lenis';

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

const Navbar = () => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const pagesRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [blurAmount, setBlurAmount] = useState(1);

  const [springs, api] = useSpring(() => ({
    WebkitBackdropFilter: 'blur(1px)',
    backdropFilter: 'blur(1px)',
    config: {
      mass: 9,
      tension: 265,
      friction: 90,
      precision: 0.02,
      clamp: true
    }
  }));

  const updateNav = useCallback(() => {
    const shouldShowDropdown =
      logoRef.current.offsetWidth + pagesRef.current.offsetWidth + 136 >=
      navRef.current.offsetWidth;
    setShowDropdown(shouldShowDropdown);
  }, []);

  const handleScroll = useCallback(() => {
    const newBlurAmount = window.scrollY > 100 ? 4 : 1;
    setBlurAmount(newBlurAmount);
    document.documentElement.setAttribute(
      'data-nav-scrolled',
      window.scrollY > 100 ? 'true' : 'false'
    );
  }, []);

  const toggleDropdown = useCallback((open) => {
    setOpenDropdown(open);
    document.documentElement.setAttribute('data-nav-dropdown', open);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateNav);
    resizeObserver.observe(navRef.current);
    resizeObserver.observe(logoRef.current);
    resizeObserver.observe(pagesRef.current);
    window.addEventListener('scroll', handleScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateNav, handleScroll]);

  useEffect(() => {
    api.start({
      WebkitBackdropFilter: `blur(${openDropdown ? 7 : blurAmount}px)`,
      backdropFilter: `blur(${openDropdown ? 7 : blurAmount}px)`
    });
  }, [openDropdown, blurAmount]);

  useEffect(() => {
    if (!showDropdown && openDropdown) {
      toggleDropdown(false);
    }
  }, [showDropdown, openDropdown, toggleDropdown]);

  // Use lenis to control scrolling
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: false,
      syncTouch: true,
      syncTouch: true
    });
    const updateLenis = (time) => {
      if (!openDropdown) {
        lenis.raf(time);
      }
    };
    const removeEffect = addEffect(updateLenis);
    return () => {
      lenis.destroy();
      removeEffect();
    };
  }, [openDropdown]);

  return (
    <animated.nav style={springs}>
      <div className='container' ref={navRef}>
        <Link href='/' passHref title='Home' ref={logoRef}>
          <RubenP
            onClick={() => {
              toggleDropdown(false);
            }}
          />
        </Link>
        <div
          className={`row-fixed ${showDropdown ? 'hidden' : ''}`}
          ref={pagesRef}>
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
              toggleDropdown(false);
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
            toggle={toggleDropdown}
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
};

export default Navbar;
