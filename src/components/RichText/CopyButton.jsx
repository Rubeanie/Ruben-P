'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCopy, LuCheck } from 'react-icons/lu';
import { copyText } from '@/lib/clipboard';
import styles from '@/styles/components/RichText.module.scss';

export default function CopyButton({ code }) {
  const timer = useRef(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await copyText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the code is still selectable.
    }
  };

  return (
    <button
      type='button'
      className={styles.copy}
      aria-label='Copy code'
      data-copied={copied || undefined}
      onClick={copy}>
      {/* Both glyphs stay mounted so the swap can crossfade instead of popping. */}
      <span className={styles.copyIcon} aria-hidden>
        <LuCopy strokeWidth={2} />
        <LuCheck strokeWidth={2} />
      </span>
      <span role='status' className={styles.srOnly}>
        {copied ? 'Copied' : ''}
      </span>
    </button>
  );
}
