import { Component } from 'react';
import Link from 'next/link';

export default class Footer extends Component {
  render() {
    return (
      <footer>
        <div className='row'>
          <p>
            ©2022 Ruben Panzich
            <br />
            <Link href='https://github.com/Rubeanie/Ruben-P'>
              Source code on GitHub
            </Link>
          </p>
        </div>
      </footer>
    );
  }
}
