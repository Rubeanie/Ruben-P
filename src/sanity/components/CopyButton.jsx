import { useEffect, useState } from 'react';
import { Button } from '@sanity/ui';
import { MdCheck, MdContentCopy } from 'react-icons/md';
import { copyText } from '@/lib/clipboard';

export function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      mode='bleed'
      fontSize={1}
      padding={2}
      icon={copied ? MdCheck : MdContentCopy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      onClick={() =>
        copyText(text)
          .then(() => setCopied(true))
          .catch(() => {})
      }
    />
  );
}
