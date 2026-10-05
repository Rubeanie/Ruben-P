// Runs right after the navbar markup, before first paint: sets the compact state
// the Navbar keeps current, so a phone never paints the full bar first. Measuring
// gives the bar a style to transition from, so the docking it starts is finished.
// The band above has just matched too, and WebKit would glide <html>'s
// --announce-height in from 0, so <html>'s own transitions are finished as well.
export const navGate =
  "var d=document.documentElement,l=document.querySelector('[data-nav-links]'),f=function(e,o){e.getAnimations(o).forEach(function(a){if(a.transitionProperty)a.finish()})};if(l&&l.scrollWidth>l.clientWidth){d.setAttribute('data-nav-compact','');f(l.closest('nav'),{subtree:true})}f(d)";
