// Runs in <head>, before the browser can restore a reload's scroll position.
// Left to the browser, the restore is a jump: Safari's comes at load, after
// the top of the page has shown, and Chrome's glides only when the page grew
// tall enough after its first paint. So a reload restores the position itself,
// gliding (html's scroll-behavior) as soon as the page is tall enough, unless
// something has scrolled it by then. Back and Forward stay the browser's:
// restoration is handed back after load, before a navigation can copy it.
export const reloadScroll =
  "(function(k){var h=history,e=document.documentElement,y;addEventListener('pagehide',function(){try{sessionStorage.setItem(k+location.href,Math.round(scrollY))}catch(_){}});if(performance.getEntriesByType('navigation')[0]?.type!=='reload')return;try{y=+sessionStorage.getItem(k+location.href)}catch(_){}if(!y)return;h.scrollRestoration='manual';(function f(){if(scrollY)return;if(e.scrollHeight-innerHeight<y&&document.readyState!=='complete')return requestAnimationFrame(f);scrollTo(0,y)})();addEventListener('load',function(){setTimeout(function(){h.scrollRestoration='auto'})})})('scroll:')";
