'use client';

import uid from "@/lib/uid";
import { stegaClean } from "@sanity/client/stega";
import { useEffect, useRef, useState } from "react";

export default function CustomHTML({ className, html, ...props }) {
  const ref = useRef(null);

  const [firstRender, setFirstRender] = useState(true);

  if (!html.code) return null;

  if (!html.code.includes('<script')) return (
    <section
      id={uid(props)}
      className={stegaClean(className)}
      dangerouslySetInnerHTML={{ __html: stegaClean(html.code) }}
    />
  );

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      const parsed = document.createRange().createContextualFragment(stegaClean(html.code));
      
      ref.current?.appendChild(parsed);
    }
  }, [ref.current, html.code])

  return <section ref={ref} id={uid(props)} className={stegaClean(className)} />;
}