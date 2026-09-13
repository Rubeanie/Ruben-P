'use client';

import { useState } from 'react';
import { LuCopy, LuCheck } from 'react-icons/lu';
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
        <LuCopy strokeWidth={2} />
        <LuCheck strokeWidth={2} />
      </span>
      <span role='status' className={styles.srOnly}>
        {copied ? 'Copied' : ''}
      </span>
    </button>
  );
}
