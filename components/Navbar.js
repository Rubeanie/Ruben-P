import Link from "next/link";
import Icon from "./Icon";
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
      useDropdown : false,
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
    this.setState({ useDropdown: false });
    if (
      this.logoRef.current.offsetWidth + this.pagesRef.current.offsetWidth >=
      this.navRef.current.offsetWidth
    ) {
      this.setState({ useDropdown: true });
    } else {
      this.setState({ useDropdown: false });
    }
  }
  render() {
    return (
      <div>
        <div className="navbar" ref={this.navRef}>
          <div className="dropdown" hidden={!this.state.useDropdown}></div>
          <div ref={this.logoRef}>
            <Link href="/" passHref>
              <a>
                <Icon className="logo" />
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
            <div className="button">
              <a className="button">
                <UseAnimations
                  animation={menu4}
                  size={56}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}