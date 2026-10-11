// Runs in <head>, before the browser can restore a reload's scroll position.
// Left to the browser, the restore is a jump: Safari's comes at load, after
// the top of the page has shown, and Chrome's glides only when the page grew
// tall enough after its first paint. So a reload restores the position itself
// as soon as the page is tall enough, unless something has scrolled it by
// then: instantly if that's the first frame, which is about to be the first
// paint, so the top never shows; gliding (html's scroll-behavior) after it.
// Paint timing can't prove nothing has painted, so only the first frame, and
// only where the browser reports paints, counts as unseen. A Back or Forward
// that loads the page again (no back/forward cache) is the same: WebKit
// restores at the first layout, before the page has grown, and lands short.
// Back and Forward within the app stay the browser's: restoration is handed
// back after load, before a navigation can copy it.
//
// React reveals a large streamed module (template#B:n) up to 300ms after the
// first paint, pushing down what follows, sometimes after load. So both the
// restore and a heading in the URL wait for those (up to 5s), and the heading
// is glided to again: Safari scrolls to it once, against the page as it stood,
// and lands short. Its scrollIntoView skips the root's scroll-padding, so the
// offset is worked out.
export const reloadScroll =
  "(function(k){var h=history,e=document.documentElement,i,y,m,r=0;addEventListener('pagehide',function(){try{sessionStorage.setItem(k+location.href,Math.round(scrollY))}catch(_){}});try{i=decodeURIComponent(location.hash.slice(1));if(/^(reload|back_forward)$/.test(performance.getEntriesByType('navigation')[0]?.type))y=+sessionStorage.getItem(k+location.href)}catch(_){}if(!y&&!i)return;if(y)h.scrollRestoration='manual';['wheel','touchstart','keydown'].forEach(function(n){addEventListener(n,function(){m=1},{once:true,passive:true})});requestAnimationFrame(function f(){if(m)return;var a=r++===0&&self.PerformanceObserver?.supportedEntryTypes?.includes('paint')&&!performance.getEntriesByType('paint').length,t=!y&&i&&document.getElementById(i),d=t?t.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(e).scrollPaddingTop)||0)-(parseFloat(getComputedStyle(t).scrollMarginTop)||0):y,b=document.querySelector('template[id^=\"B:\"]');if((b||!d||e.scrollHeight-innerHeight<d)&&(document.readyState!=='complete'||b&&performance.now()<5e3))return requestAnimationFrame(f);if(d&&!(y&&scrollY))scrollTo({top:d,behavior:y&&a?'instant':'auto'})});addEventListener('load',function(){setTimeout(function(){h.scrollRestoration='auto'})})})('scroll:')";
