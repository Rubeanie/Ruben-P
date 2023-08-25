import Link from 'next/link'
import React from 'react'

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <div className="row">
          <p>
            ©2022 Ruben Panzich
            <br />
            <Link href="https://github.com/Rubeanie/Ruben-P">
              Source code on GitHub
            </Link>
          </p>
        </div>
      </footer>
    )
  }
}
