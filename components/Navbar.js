import Link from "next/link";
import { RubenP } from "./Icons";
import React from "react";
import UseAnimations from "react-useanimations";
import menu4 from "react-useanimations/lib/menu4";

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.navRef = React.createRef();
    this.logoRef = React.createRef();
    this.pagesRef = React.createRef();
    this.dropdownRef = React.createRef();
    this.state = {
      useDropdown: false,
      openDropdown: false,
      reverseIcon: false,
      openDropdownInt: 0,
    };
    this.componentDidResize = this.componentDidResize.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.componentDidResize);
    this.componentDidResize(this);
  }
  componentWillUnmount() {
    window.addEventListener("resize", null);
  }
  componentDidResize(useDropdown) {
    this.setState(() => ({ useDropdown: false }));
    this.setState(() => ({
      useDropdown:
        this.logoRef.current.offsetWidth + this.pagesRef.current.offsetWidth >=
        this.navRef.current.offsetWidth / 1.4,
    }));
  }
  changeDropdown() {
    this.setState(() => ({
      openDropdown: !this.state.openDropdown,
    }));
    this.setState(() => ({
      openDropdownInt: !this.state.openDropdown ? 1 : 0,
    }));
    document.documentElement.style.setProperty(
      "--color-overlay-alpha",
      `${!this.state.openDropdown ? 0.7 : 0.325}`
    );
  }
  render() {
    return (
      <div>
        <div className="navbar" ref={this.navRef}>
          <div
            className="dropdown"
            style={{
              transform: `translate(0, 50vh) scale(1, ${
                this.state.openDropdownInt
              })`,
              opacity: this.state.openDropdownInt,
            }}
          >
            <div
              className="column"
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                this.changeDropdown();
                this.setState(() => ({ reverseIcon: !this.state.reverseIcon }));
              }}
            >
              <Link href="/" passHref>
                <a
                  className="button"
                  style={{
                    transform: `scale(${this.state.openDropdownInt}, ${
                      this.state.openDropdownInt
                    })`,
                  }}
                >
                  Home
                </a>
              </Link>
              <Link href="/about" passHref>
                <a
                  className="button"
                  style={{
                    transform: `scale(${this.state.openDropdownInt}, ${
                      this.state.openDropdownInt
                    })`,
                  }}
                >
                  About
                </a>
              </Link>
              <Link href="/portfolio" passHref>
                <a
                  className="button"
                  style={{
                    transform: `scale(${this.state.openDropdownInt}, ${
                      this.state.openDropdownInt
                    })`,
                  }}
                >
                  Portfolio
                </a>
              </Link>
              <Link href="/socials" passHref>
                <a
                  className="button"
                  style={{
                    transform: `scale(${this.state.openDropdownInt}, ${
                      this.state.openDropdownInt
                    })`,
                  }}
                >
                  Socials
                </a>
              </Link>
            </div>
          </div>
          <div ref={this.logoRef}>
            <Link href="/" passHref>
              <a
                onClick={() => {
                  if (this.state.useDropdown && this.state.openDropdown) {
                    this.changeDropdown();
                    this.setState(() => ({
                      reverseIcon: !this.state.reverseIcon,
                    }));
                  }
                }}
              >
                <RubenP className="logo" />
              </a>
            </Link>
          </div>
          <div ref={this.pagesRef} hidden={this.state.useDropdown}>
            <Link href="/about" passHref>
              <a className="button">About</a>
            </Link>
            <Link href="/portfolio" passHref>
              <a className="button">Portfolio</a>
            </Link>
            <Link href="/socials" passHref>
              <a className="button">Socials</a>
            </Link>
          </div>
          <div ref={this.dropdownRef} hidden={!this.state.useDropdown}>
            <a className="button">
              <UseAnimations
                speed={-3}
                reverse={`${this.state.reverseIcon}`}
                size={65}
                strokeColor={"rgb(var(--color-foreground))"}
                onClick={() => {
                  this.changeDropdown();
                }}
                animation={menu4}
              />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
