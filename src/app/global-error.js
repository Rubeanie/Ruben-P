'use client';

import Link from 'next/link';
import cta from '@/styles/components/CTA.module.scss';
import styles from './global-error.module.scss';

// Last resort when the root layout itself fails: it replaces the layout, so it
// brings its own html and body, and nothing that needs Sanity. Its styles stay
// scoped: Next loads them on every route.
export default function GlobalError({ retry }) {
  return (
    <html lang='en'>
      <body className={styles.body}>
        <title>Something went wrong</title>
        <main className={styles.page}>
          <h1 className={styles.heading}>
            <span className={styles.fill}>Something went wrong</span>
          </h1>
          <p className={styles.copy}>The page could not be loaded.</p>
          <div className={styles.actions}>
            <button
              type='button'
              className={`${cta.cta} ${cta.action} ${styles.retry}`}
              onClick={() => retry()}>
              Try again
            </button>
            <Link href='/' className={`${cta.cta} ${cta.link}`}>
              Go to the home page
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
