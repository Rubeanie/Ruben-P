// Runs right after the navbar markup, before first paint: sets the compact state
// the Navbar keeps current, so a phone never paints the full bar first. Measuring
// gives the bar a style to transition from, so the docking it starts is finished.
// The band above has just matched too, and WebKit would glide <html>'s
// --announce-height in from 0, so <html>'s own transitions are finished as well.
//
// Inlined by its source text, so it stays self-contained and in syntax every
// browser parses as is: no imports, no optional chaining.
function gate() {
  const root = document.documentElement;
  const links = document.querySelector('[data-nav-links]');
  const finish = (element, options) => {
    for (const animation of element.getAnimations(options))
      if (animation.transitionProperty) animation.finish();
  };
  if (links && links.scrollWidth > links.clientWidth) {
    root.setAttribute('data-nav-compact', '');
    finish(links.closest('nav'), { subtree: true });
  }
  finish(root);
}

export const navGate = `(${gate})()`;
