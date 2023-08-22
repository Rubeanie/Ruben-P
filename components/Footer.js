import Link from "next/link";
import React from "react";

export default class Footer extends React.Component {
  render() {
    return (
      <div className="footer">
        <div className="column">
          ©2022 Ruben Panzich
          <Link href="https://github.com/Rubeanie/Ruben-P">
            Source code on GitHub
          </Link>
        </div>
      </div>
    );
  }
}
