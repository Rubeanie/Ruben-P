'use client';

import { useEffect, useRef, useState } from 'react';
import { LuWrapText } from 'react-icons/lu';
import styles from '@/styles/components/RichText.module.scss';

// Only offered once a line runs past the block; while wrapped it stays so it can be undone.
export default function WrapButton() {
  const ref = useRef(null);
  const [wrap, setWrap] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // The body is watched rather than its <code>: a live preview replaces the
  // highlighted markup, and the new <code> is the one to measure.
  useEffect(() => {
    const body = ref.current.closest(`.${styles.code}`).lastElementChild;
    const check = () => {
      const code = body.querySelector('code');
      setOverflows(code.scrollWidth > code.clientWidth);
    };
    const resized = new ResizeObserver(check);
    resized.observe(body);
    // A swap can overflow without changing the body's size.
    const swapped = new MutationObserver(check);
    swapped.observe(body, { childList: true });
    // The mono face is not preloaded, so widths can change once it arrives.
    document.fonts.ready.then(check);
    return () => {
      resized.disconnect();
      swapped.disconnect();
    };
  }, []);

  return (
    <button
      ref={ref}
      type='button'
      className={styles.codeAction}
      aria-label='Wrap lines'
      aria-pressed={wrap}
      hidden={!overflows && !wrap}
      // The block is server-rendered, so the switch lands on its DOM rather than its props.
      onClick={(event) =>
        setWrap(
          event.currentTarget
            .closest(`.${styles.code}`)
            .toggleAttribute('data-wrap')
        )
      }>
      <LuWrapText strokeWidth={2} aria-hidden />
    </button>
  );
}
