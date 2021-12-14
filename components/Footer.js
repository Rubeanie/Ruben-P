import Link from "next/link";
import React from "react";

class Footer extends React.Component {
  render() {
    return (
      <div className="foot">
        <div className="column">
          <foot-info>© 2021 by Ruben Panzich</foot-info>
          <Link href="https://github.com/Rubeanie/Personal-Website">
            <a>
              <foot-github>
                <url>Source code on GitHub</url>
              </foot-github>
            </a>
          </Link>
        </div>
      </div>
    );
  }
}

export default Footer;
