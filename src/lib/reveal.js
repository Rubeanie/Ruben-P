// Hides the parts of the page's modules that start below the reveal line (90%
// down the viewport) until Reveal plays them in; the same line decides both.
// It is also inlined as the pre-paint script, so it may only use globals.
// With `adopt` it takes over the holds that script made instead of measuring.
// `edge` moves the line, as a share of the viewport. Returns [element, kind,
// hold] in reading order.
export function hold(adopt, edge = 0.9) {
  const root = document.querySelector('[data-reveal]');
  if (!root || !root.animate) return [];
  const group = '[data-reveal-children]';
  const prose = 'h1, h2, h3, h4, h5, h6, p, blockquote, ul, ol, hr';
  const units = [];
  for (const child of root.children) {
    // Draft mode wraps each module in a div the Presentation tool opens it from.
    const modules = child.hasAttribute('data-sanity')
      ? child.children
      : [child];
    for (const el of modules) {
      if (el.matches('script, style, [data-reveal-skip]')) continue;
      const list = el.matches(group) ? el : el.querySelector(group);
      if (!list) {
        units.push([el, 'object']);
        continue;
      }
      const items = list.dataset.revealChildren === 'items';
      for (const item of list.children)
        units.push([
          item,
          items ? 'item' : item.matches(prose) ? 'text' : 'object'
        ]);
    }
  }

  const line = innerHeight * edge;
  const held = adopt
    ? units.filter(([el]) => el.getAnimations().some((a) => a.id === 'reveal'))
    : units.filter(([el]) => {
        const box = el.getBoundingClientRect();
        return box.height > 0 && box.top > line;
      });
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Objects settle from smaller, anchored at their bottom edge: 2% of the
  // height down undoes what the centred scale lifts it.
  const moves = {
    text: { translate: '0 0.75rem' },
    item: { translate: '0 0.5rem' },
    object: { translate: '0 calc(1.5rem + 2%)', scale: '0.96' }
  };
  // A held animation rather than an attribute: hydration would flag one.
  return held.map(([el, kind]) => {
    const prior = el.getAnimations().find((a) => a.id === 'reveal');
    // The script measuring again keeps its hold. Reveal takes over with its
    // own, which the script's five-second fallback can't cancel.
    if (prior && !adopt) return [el, kind, prior];
    if (prior) prior.cancel();
    const frame = { opacity: 0, ...(!still && moves[kind]) };
    return [el, kind, el.animate(frame, { fill: 'forwards', id: 'reveal' })];
  });
}

// Plays a held unit in, `delay` ms from now. Web Animations rather than
// transitions: each runs from the held value to whatever the element's own
// styles say (muted text at 0.7, a zoom card's rest scale), and it sits above
// a module's own CSS animation. The pre-paint script plays units with it until
// the app hydrates, so it may only use globals. Returns the animations.
export function play([el, , held], delay) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { translate, scale } = getComputedStyle(el);
  held.cancel();
  const timing = (duration) => ({
    duration: still ? 300 : duration,
    // The Sass $ease-out token.
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    delay,
    fill: 'backwards'
  });

  const filtered = (node, pseudo) => {
    const value = getComputedStyle(node, pseudo).backdropFilter;
    return Boolean(value) && value !== 'none';
  };
  const pseudoGlass = (node) =>
    filtered(node, '::before') || filtered(node, '::after');
  const glass = (node) => filtered(node) || pseudoGlass(node);
  // An element still to play its own fade-in is left to it.
  const fadesItself = (node) =>
    node.getAnimations().some((a) => {
      if (!a.effect || !a.effect.getKeyframes().some((k) => 'opacity' in k))
        return false;
      const { progress } = a.effect.getComputedTiming();
      return progress !== null && progress < 1;
    });
  // Opacity below 1 on an ancestor of a backdrop-filter makes that ancestor
  // the glass's backdrop root, and the blur only snaps on when the fade ends.
  // So a unit holding glass is faded piecewise: every branch without glass
  // fades as one, and a glass element fades itself (its blur crossfades in).
  const fadeTargets = (node) => {
    if (fadesItself(node)) return [];
    return pseudoGlass(node) || [...node.querySelectorAll('*')].some(glass)
      ? [...node.children].flatMap(fadeTargets)
      : [node];
  };

  const anims = [];
  if (!still)
    anims.push(el.animate([{ translate, scale, offset: 0 }], timing(700)));
  // A rich text block of media fades as one piece: split up, its dark plate
  // showed solid while the picture inside was still faint.
  const block =
    el.parentElement && el.parentElement.dataset.revealChildren === 'blocks';
  const fades =
    block && el.querySelector('img, video, iframe') ? [el] : fadeTargets(el);
  for (const node of fades)
    anims.push(node.animate([{ opacity: 0, offset: 0 }], timing(500)));
  return anims;
}

// Modules that play their own entrance, hidden the same way below the line
// until they take over. Pre-paint script only, so it may only use globals.
export function holdEntrances(edge = 0.9) {
  const line = innerHeight * edge;
  return [...document.querySelectorAll('[data-reveal] [data-entrance]')]
    .filter((el) => el.getBoundingClientRect().top > line)
    .map((el) => {
      const prior = el.getAnimations().find((a) => a.id === 'entrance');
      const frame = { opacity: 0 };
      return [
        el,
        'entrance',
        prior || el.animate(frame, { fill: 'forwards', id: 'entrance' })
      ];
    });
}
