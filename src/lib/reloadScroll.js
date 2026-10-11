// Runs in <head>, before the browser can restore a reload's scroll position.
// Left to the browser, the restore is a jump: Safari's comes at load, after
// the top of the page has shown, and Chrome's glides only when the page grew
// tall enough after its first paint. So a reload restores the position itself,
// gliding (html's scroll-behavior) as soon as the page is tall enough, unless
// something has scrolled it by then. Back and Forward stay the browser's:
// restoration is handed back after load, before a navigation can copy it.
//
// React reveals a large streamed module (template#B:n) up to 300ms after the
// first paint, pushing down what follows. So both the restore and a heading
// in the URL wait for those, and the heading is glided to again: Safari
// scrolls to it once, against the page as it stood, and lands short. Its
// scrollIntoView skips the root's scroll-padding, so the offset is worked out.
export const reloadScroll =
  "(function(k){var h=history,e=document.documentElement,i,y,m;addEventListener('pagehide',function(){try{sessionStorage.setItem(k+location.href,Math.round(scrollY))}catch(_){}});try{i=decodeURIComponent(location.hash.slice(1));if(performance.getEntriesByType('navigation')[0]?.type==='reload')y=+sessionStorage.getItem(k+location.href)}catch(_){}if(!y&&!i)return;if(y)h.scrollRestoration='manual';['wheel','touchstart','keydown'].forEach(function(n){addEventListener(n,function(){m=1},{once:true,passive:true})});(function f(){if(m)return;var t=!y&&i&&document.getElementById(i),d=t?t.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(e).scrollPaddingTop)||0)-(parseFloat(getComputedStyle(t).scrollMarginTop)||0):y;if(document.readyState!=='complete'&&(document.querySelector('template[id^=\"B:\"]')||!d||e.scrollHeight-innerHeight<d))return requestAnimationFrame(f);if(d&&!(y&&scrollY))scrollTo(0,d)})();addEventListener('load',function(){setTimeout(function(){h.scrollRestoration='auto'})})})('scroll:')";
