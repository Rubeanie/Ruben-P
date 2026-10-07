import { expect, test } from 'bun:test';
import { pageHrefs, picks, splitHref, viewModules } from './introPicks';
import { carouselSizes } from './carousel';
import { railedModules } from './toc';

const figure = (id) => ({ _type: 'imageBlock', image: photo(id) });
const text = (key, ...content) => ({
  _key: key,
  _type: 'richtext-module',
  content
});
const h2 = (words) => ({
  _type: 'block',
  style: 'h2',
  children: [{ text: words }]
});
const quiet = {
  _key: 'q',
  _type: 'custom-html',
  html: { code: '<script></script>' }
};
const video = { _type: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ' };
const cloudinary = (id, type = 'image', ext = 'jpg') =>
  `https://res.cloudinary.com/demo/${type}/upload/v1/${id}.${ext}`;
const photo = (id) => ({ asset: { secure_url: cloudinary(id) } });

test('picks follow the first two drawing modules, skipping quiet embeds', () => {
  const modules = [
    quiet,
    text('a', figure('one')),
    text('b', figure('two')),
    text('c', figure('three'))
  ];
  const { modules: view } = viewModules(modules);
  expect(view.map((m) => m._key)).toEqual(['a', 'b', 'c']);
  expect(picks(view).map((p) => p.src)).toEqual([
    cloudinary('one'),
    cloudinary('two')
  ]);
});

test('a hero contributes its photos, a video any block position', () => {
  const hero = {
    _type: 'hero.split',
    image: photo('cover')
  };
  const body = text('b', h2('Intro'), { _type: 'block' }, video);
  expect(picks([hero, body])).toEqual([
    {
      kind: 'image',
      src: cloudinary('cover'),
      sizes: '(max-width: 43.75rem) 100vw, 50vw',
      media: undefined
    },
    { kind: 'youtube', id: 'dQw4w9WgXcQ' }
  ]);
  expect(picks([text('b', { ...video, autoplay: true })])).toEqual([]);
});

test('picks are capped at four, a module gives two, repeats count once', () => {
  const a = text('a', figure('1'), figure('2'), figure('3'));
  const b = text('b', figure('2'), figure('4'), figure('5'));
  expect(picks([a, b]).map((p) => p.src)).toEqual(
    ['1', '2', '4'].map((id) => cloudinary(id))
  );
  const hero3d = { _type: 'hero.3d' };
  expect(picks([hero3d, a]).map((p) => p.kind)).toEqual([
    'model',
    'image',
    'image'
  ]);
  const crowd = (key) => text(key, figure(key + 1), figure(key + 2));
  expect(picks([crowd('x'), crowd('y'), crowd('z')])).toHaveLength(4);
});

test('creative columns give their images at the column width', () => {
  const creative = {
    _type: 'creative-module',
    columns: [
      { blocks: [{ _type: 'heading', text: 'Hi' }, figure('left')] },
      { blocks: [figure('right')] }
    ]
  };
  expect(picks([creative])).toEqual([
    {
      kind: 'image',
      src: cloudinary('left'),
      sizes: '(max-width: 43.75rem) 100vw, 30rem'
    },
    {
      kind: 'image',
      src: cloudinary('right'),
      sizes: '(max-width: 43.75rem) 100vw, 30rem'
    }
  ]);
});

test('a tile list gives the first desktop row, covers sized per tile', () => {
  const posts = Array.from({ length: 9 }, (_, i) => ({
    _id: `p${i}`,
    cover: photo(`cover${i}`)
  }));
  const result = picks([{ _type: 'post-list' }], { posts });
  expect(result.length).toBeGreaterThan(0);
  expect(result.length).toBeLessThanOrEqual(4);
  for (const pick of result) {
    expect(pick.kind).toBe('image');
    expect(pick.sizes).toMatch(/^\(max-width: 43.75rem\) \d+vw, (15|31)rem$/);
  }
  expect(picks([{ _type: 'post-list' }], { posts: [] })).toEqual([]);
});

test('a moving cover warms its still, never the animation', () => {
  const posts = [
    {
      _id: 'clip',
      cover: { asset: { secure_url: cloudinary('c', 'video', 'mp4') } }
    },
    {
      _id: 'gif',
      cover: { asset: { secure_url: cloudinary('g', 'image', 'gif') } }
    }
  ];
  const featured = { _type: 'post-featured', limit: 2 };
  expect(picks([featured], { posts }).map((p) => p.src)).toEqual([
    'https://res.cloudinary.com/demo/video/upload/so_0,f_webp/v1/c.webp',
    'https://res.cloudinary.com/demo/image/upload/pg_1/v1/g.gif'
  ]);
});

test('a link to a heading shows its module and the next', () => {
  const modules = [
    text('a', figure('top')),
    text('b', h2('Mixtape'), figure('tape')),
    text('c', figure('after')),
    text('d', figure('far'))
  ];
  const { modules: view, matched } = viewModules(modules, '#mixtape');
  expect(matched).toBe(true);
  expect(view.map((m) => m._key)).toEqual(['b', 'c', 'd']);
  expect(picks(view).map((p) => p.src)).toEqual(
    ['tape', 'after'].map((id) => cloudinary(id))
  );
});

test('a hash can name a module id, and an unknown one falls back to the opening', () => {
  const modules = [
    text('a', figure('top')),
    { ...text('b', figure('mid')), uid: 'team' },
    text('c', figure('end'))
  ];
  expect(viewModules(modules, '#team').modules.map((m) => m._key)).toEqual([
    'b',
    'c'
  ]);
  const missing = viewModules(modules, '#nope');
  expect(missing.matched).toBe(false);
  expect(missing.modules.map((m) => m._key)).toEqual(['a', 'b', 'c']);
  expect(viewModules(modules, '#%E0%A4%A').matched).toBe(false);
});

test('splitHref keeps a page path and its fragment, and refuses the rest', () => {
  expect(splitHref('/about#mixtape')).toEqual({
    path: '/about',
    hash: '#mixtape'
  });
  expect(splitHref('/about?x=1')).toEqual({ path: '/about', hash: '' });
  expect(splitHref('/')).toEqual({ path: '/', hash: '' });
  expect(splitHref('https://example.com/a')).toBeNull();
  expect(splitHref('//example.com/a')).toBeNull();
  expect(splitHref('#top')).toBeNull();
  expect(splitHref(null)).toBeNull();
});

test('pageHrefs finds CTA, link block and rich-text links, not the current page', () => {
  const internal = (slug, params) => ({
    type: 'internal',
    internal: { metadata: { slug } },
    ...(params && { params })
  });
  const modules = [
    {
      _type: 'hero',
      ctas: [
        { link: internal('/work') },
        { link: { type: 'external', external: 'https://example.com' } }
      ]
    },
    {
      _type: 'richtext-module',
      content: [
        {
          _type: 'block',
          markDefs: [
            { _type: 'link', href: '/about#mixtape' },
            { _type: 'link', href: 'https://example.com' },
            { _type: 'link', href: '/here' }
          ]
        }
      ]
    },
    {
      _type: 'creative-module',
      columns: [{ blocks: [{ _type: 'link', ...internal('/work', '#top') }] }]
    }
  ];
  expect(pageHrefs(modules, '/here').sort()).toEqual([
    '/about#mixtape',
    '/work',
    '/work#top'
  ]);
});

test('a click-to-load scene gives its poster, a live one nothing', () => {
  const scene = (extra) => ({
    _type: 'three.js',
    poster: cloudinary('poster'),
    ...extra
  });
  expect(picks([scene({ loadOnClick: true })])).toEqual([
    {
      kind: 'image',
      src: cloudinary('poster'),
      sizes: '(max-width: 43.75rem) 50vw, 32rem'
    }
  ]);
  expect(picks([scene({ loadOnClick: false })])).toEqual([]);
});

test('callout and Creative copy figures count like prose ones', () => {
  const callout = { _type: 'callout', content: [figure('note')] };
  const creative = {
    _type: 'creative-module',
    columns: [{ blocks: [{ _type: 'copy', content: [figure('inline')] }] }]
  };
  expect(picks([callout, creative]).map((p) => p.src)).toEqual(
    ['note', 'inline'].map((id) => cloudinary(id))
  );
});

test('featured posts lead the wide row, except under a post', () => {
  const posts = ['a', 'b', 'c'].map((id) => ({
    _id: id,
    featured: id === 'c',
    cover: photo(id)
  }));
  const featured = { _type: 'post-featured', limit: 2 };
  const result = picks([featured], { posts });
  expect(result.map((p) => p.src)).toEqual(
    ['c', 'a'].map((id) => cloudinary(id))
  );
  expect(result[0].sizes).toBe('(max-width: 43.75rem) 82vw, 15rem');
  expect(picks([featured], { posts, onPost: true })).toEqual([]);
});

test('picks skip animated GIFs', () => {
  const gif = {
    _type: 'imageBlock',
    image: { asset: { secure_url: cloudinary('g', 'image', 'gif') } }
  };
  expect(picks([text('a', gif, figure('one'))]).map((p) => p.src)).toEqual([
    cloudinary('one')
  ]);
});

test('a clip playing as video warms its first frame, an animated one nothing', () => {
  const url = 'https://res.cloudinary.com/c/video/upload/v1/a.mp4';
  const clip = (settings) => ({
    _type: 'imageBlock',
    image: {
      asset: { secure_url: url, width: 640, height: 360 },
      clip: settings
    }
  });
  expect(
    picks([text('a', clip({ start: 2 }), clip({ animatedImage: true }))]).map(
      (p) => p.src
    )
  ).toEqual([
    'https://res.cloudinary.com/c/video/upload/so_2,f_webp/v1/a.webp'
  ]);
});

test('the contents and breadcrumbs leave the opening to the page', () => {
  const modules = [
    { _key: 't', _type: 'table-of-contents' },
    { _key: 'c', _type: 'breadcrumbs' },
    text('a', figure('one')),
    text('b', figure('two'))
  ];
  expect(viewModules(modules).modules.map((m) => m._key)).toEqual(['a', 'b']);
});

test('modules without pictures leave the two picks to ones further down', () => {
  const words = (key) => text(key, h2('Words'), { _type: 'block' });
  const modules = [
    words('w1'),
    { _key: 'acc', _type: 'accordion-list' },
    text('a', figure('one')),
    words('w2'),
    text('b', figure('two')),
    text('c', figure('three'))
  ];
  const { modules: view } = viewModules(modules);
  expect(view).toHaveLength(5);
  expect(picks(view).map((p) => p.src)).toEqual(
    ['one', 'two'].map((id) => cloudinary(id))
  );
});

test('the search stops five modules down', () => {
  const words = (key) => text(key, h2('Words'));
  const modules = [1, 2, 3, 4, 5].map((n) => words(`w${n}`));
  modules.push(text('far', figure('far')));
  expect(picks(viewModules(modules).modules)).toEqual([]);
});

test('only the opening blocks of a long article count', () => {
  // As the query returns them: paragraphs and other blocks are bare types.
  const filler = [h2('Intro'), ...Array(4).fill({ _type: 'block' })];
  filler.push({ _type: 'code' });
  expect(picks([text('a', ...filler, figure('deep'))])).toEqual([]);
  expect(
    picks([text('a', ...filler.slice(1), figure('near'))]).map((p) => p.src)
  ).toEqual([cloudinary('near')]);
});

test('a carousel gives its front card: photo, video or scene poster', () => {
  const image = { _type: 'carouselImage', image: photo('front') };
  const carousel = (item, count = 6, loop = false) => ({
    _type: 'media-carousel',
    loop,
    items: [item, ...Array(count - 1).fill(image)]
  });
  const still =
    '(prefers-reduced-motion: reduce) and (max-width: 43.75rem) 92vw, (prefers-reduced-motion: reduce) min(61.3rem, (100vw - 4rem) * 1)';
  const sizes = `${still}, (max-width: 43.75rem) 81vw, min(54rem, (100vw - 4rem) * 0.881)`;
  expect(picks([carousel(image)])).toEqual([
    { kind: 'image', src: cloudinary('front'), sizes }
  ]);
  // The front card is wider the fewer cards stand behind it.
  expect(picks([carousel(image, 3)])[0].sizes).toBe(
    `${still}, (max-width: 43.75rem) 85vw, min(56rem, (100vw - 4rem) * 0.914)`
  );
  expect(picks([carousel(image, 2, true)])[0].sizes).toBe(
    `${still}, (max-width: 43.75rem) 92vw, min(61rem, (100vw - 4rem) * 0.996)`
  );
  expect(picks([carousel({ ...video, _type: 'carouselYouTube' })])).toEqual([
    { kind: 'youtube', id: 'dQw4w9WgXcQ', sizes }
  ]);
  expect(
    picks([
      carousel({
        _type: 'carouselScene',
        model: '/models/rp-logo.glb',
        poster: cloudinary('poster')
      })
    ])
  ).toEqual([
    {
      kind: 'image',
      src: cloudinary('poster'),
      sizes: '(max-width: 43.75rem) 50vw, 32rem'
    }
  ]);
  expect(picks([{ _type: 'media-carousel', items: [] }])).toEqual([]);
});

test('beside a table of contents the carousel sizes for the narrower column', () => {
  const carousel = {
    _type: 'media-carousel',
    items: Array(6).fill({ _type: 'carouselImage', image: photo('front') })
  };
  expect(picks([carousel], { railed: new Set([carousel]) })[0].sizes).toBe(
    '(prefers-reduced-motion: reduce) and (max-width: 43.75rem) 92vw, ' +
      '(prefers-reduced-motion: reduce) and (min-width: 68rem) min(61.3rem, (100vw - 27rem) * 1), ' +
      '(prefers-reduced-motion: reduce) min(61.3rem, (100vw - 4rem) * 1), ' +
      '(max-width: 43.75rem) 81vw, ' +
      '(min-width: 68rem) min(54rem, (100vw - 27rem) * 0.881), ' +
      'min(54rem, (100vw - 4rem) * 0.881)'
  );
});

test('only a carousel after a table of contents that renders sizes for the rail', () => {
  const carousel = {
    _key: 'c',
    _type: 'media-carousel',
    items: Array(6).fill({ _type: 'carouselImage', image: photo('front') })
  };
  const toc = { _key: 'toc', _type: 'table-of-contents' };
  const railed = (modules) =>
    picks([carousel], { railed: railedModules(modules) })[0].sizes.includes(
      '27rem'
    );
  expect(railed([carousel, toc, text('a', h2('Below'))])).toBe(false);
  expect(railed([toc, text('a', h2('Below')), carousel])).toBe(true);
  // No headings after it, so the contents draw nothing and leave no rail.
  expect(railed([text('a', h2('Above')), toc, carousel])).toBe(false);
});

test('a carousel counts and leads with only the items it can draw', () => {
  const image = { _type: 'carouselImage', image: photo('front') };
  const broken = [
    { _type: 'carouselYouTube', url: 'https://youtu.be/nope' },
    { _type: 'carouselImage', image: null },
    { _type: 'carouselScene', model: null, poster: cloudinary('poster') }
  ];
  const [front] = picks([
    { _type: 'media-carousel', items: [...broken, image, image, image] }
  ]);
  expect(front.src).toBe(cloudinary('front'));
  expect(front.sizes).toBe(carouselSizes(3, false));
});
test('a sized block hints its narrower box above a phone', () => {
  const [pick] = picks([
    {
      _type: 'creative-module',
      columns: [{ blocks: [{ ...figure('left'), size: 'small' }] }]
    }
  ]);
  expect(pick.sizes).toBe('(max-width: 43.75rem) 100vw, 15rem');
  const [front] = picks([
    {
      _type: 'media-carousel',
      size: 'medium',
      items: [{ _type: 'carouselImage', image: photo('front') }]
    }
  ]);
  expect(front.sizes).toBe(carouselSizes(1, false, false, 'medium'));
  expect(front.sizes).not.toBe(carouselSizes(1, false));
});
