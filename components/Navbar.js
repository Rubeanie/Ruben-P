import Link from "next/link";
import Icon from "./Icon";
import React from "react";

class Navbar extends React.Component {
  render() {
    return (
      <div>
        <div className="nav">
          <div>
            <Link href="/" passHref>
              <a>
                {" "}
                <Icon className="svg" />{" "}
              </a>
            </Link>
          </div>
          <div>
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

export default Navbar;
