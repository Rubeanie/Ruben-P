'use client';

import Link from 'next/link';

export default function Footer() {
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
