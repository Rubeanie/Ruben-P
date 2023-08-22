import React from "react";
import Link from "next/link";
import { RubenP } from "../lib/icons";
import { Squeeze as Hamburger } from "hamburger-react";

const navbarData = {
  pages: [
    {
      title: "About",
      url: "/about",
    },
    {
      title: "Portfolio",
      url: "/portfolio",
    },
    {
      title: "Socials",
      url: "/socials",
    },
  ],
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
      openDropdownInt: 0,
    };
    this.componentDidResize = this.componentDidResize.bind(this);
    this.componentDidRotate = this.componentDidRotate.bind(this);
    this.changeDropdown = this.changeDropdown.bind(this);
  }
  componentDidMount() {
    this.componentDidRotate();
    window.addEventListener("resize", this.componentDidResize);
    window.addEventListener("orientationchange", this.componentDidRotate);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.componentDidResize);
    window.removeEventListener("orientationchange", this.componentDidRotate);
  }
  componentDidResize() {
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
      openDropdownInt: x ? 1 : 0,
    }));
    if(x) {
      document.documentElement.style.setProperty(
        "--color-overlay-alpha",
        0.6
      );
      document.body.classList.add("no-scroll");
    } else {
      document.documentElement.style.setProperty(
        "--color-overlay-alpha",
        0.325
      );
      document.body.classList.remove("no-scroll");
    }
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
            style={{ justifyContent: "flex-start" }}
            onClick={() => {
              this.changeDropdown(false);
            }}
          >
            <Link href="/" className="button" passHref
              style={{
                transform: `scale(${this.state.openDropdownInt}, ${this.state.openDropdownInt})`,
              }}>
              Home
            </Link>
            {navbarData.pages.map((page) => (
              <Link
                key={`_${page.title}`}
                className="button"
                href={page.url}
                passHref
                style={{
                  transform: `scale(${this.state.openDropdownInt}, ${this.state.openDropdownInt})`,
                }}
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>
        <div ref={this.logoRef}>
          <Link href="/" passHref title="Home">
            <RubenP className="logo"
              onClick={() => {
                this.changeDropdown(false);
              }} />
          </Link>
        </div>
        <div ref={this.pagesRef} hidden={this.state.showDropdown}>
          {navbarData.pages.map((page) => (
            <Link key={page.title} className="button" href={page.url} passHref>
              {page.title}
            </Link>
          ))}
        </div>
        <div hidden={!this.state.showDropdown}>
          <Hamburger
            toggled={this.state.setOpen}
            toggle={this.changeDropdown}
            size={37.5}
            duration={0.3}
            distance="sm"
            color="var(--color-foreground)"
            easing="ease-out"
            rounded={true}
          />
        </div>
      </div>
    );
  }
}
