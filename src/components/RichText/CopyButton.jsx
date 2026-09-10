'use client';

import { useState } from 'react';
import styles from '@/styles/components/RichText.module.scss';

// The async clipboard only exists in secure contexts; plain http on the LAN
// still gets a copy through a selection.
function copyBySelection(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

export default function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(code);
      else copyBySelection(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <rect x='9' y='9' width='11' height='11' rx='2' />
          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
        </svg>
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='m5 13 4 4L19 7' />
        </svg>
      </span>
      <span role='status' className={styles.srOnly}>
        {copied ? 'Copied' : ''}
      </span>
    </button>
  );
}
