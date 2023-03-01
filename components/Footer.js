import Link from "next/link";
import React from "react";

export default class Footer extends React.Component {
  render() {
    return (
      <div className="footer">
        <div className="column">
          <foot-info>©2022 Ruben Panzich</foot-info>
          <Link href="https://github.com/Rubeanie/Ruben-P" legacyBehavior>
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
