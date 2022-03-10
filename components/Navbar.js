import Link from "next/link";
import Icon from "./Icon";
import React from "react";

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.navRef = React.createRef();
    this.logoRef = React.createRef();
    this.pagesRef = React.createRef();
    this.state = {
      useDropdown : false,
    };
    this.componentDidResize = this.componentDidResize.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.componentDidResize);
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
      console.log("working");
      console.log(
        `${
          this.logoRef.current.offsetWidth + this.pagesRef.current.offsetWidth
        } >= ${this.navRef.current.offsetWidth}`
      );
      this.setState({ useDropdown: true });
      console.log(
        `${
          this.logoRef.current.offsetWidth + this.pagesRef.current.offsetWidth
        } >= ${this.navRef.current.offsetWidth}`
      );
    } else {
      this.setState({ useDropdown: false });
    }
  }
  render() {
    return (
      <div>
        <div className="navbar" ref={this.navRef}>
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
        </div>
      </div>
    );
  }
}