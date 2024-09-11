'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Redirect(props) {
  const [count, setCount] = useState(3);
  const [counting, setCounting] = useState(true);
  useEffect(() => {
    if (counting) {
      if (count > 0) {
        setTimeout(() => {
          setCount((count) => count - 1);
        }, 1000);
      } else {
        clearTimeout();
        setCounting(() => {
          false;
        });
        window.location.href = props.url;
      }
    }
  }, [count, counting, props.url]);
  return (
    <div>
      <div className='column'>
        <h2>
          <icon>{props.logo}</icon>
          {` Redirecting in ${count} seconds...`}
        </h2>
        <p>
          Click{' '}
          <Link href={props.url} passHref>
            here
          </Link>{' '}
          if the {props.name} redirect doesn’t work.
        </p>
      </div>
    </div>
  );
}
