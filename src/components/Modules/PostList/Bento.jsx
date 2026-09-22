'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import MiniSearch from 'minisearch';
import { stegaClean } from '@sanity/client/stega';
import { LuChevronDown, LuX } from 'react-icons/lu';
import { fillPages, phoneShape, tileBands, tileShapes } from '@/lib/bento';
import { categorySlug } from '@/lib/posts';
import Filters from './Filters';
import Tile from './Tile';
import useBentoMorph from './useBentoMorph';
import styles from '@/styles/components/PostList.module.scss';

const PAGE_SIZE = 12;
const DEBOUNCE = 120;
// How many tiles the URL shows: the first page, or the count Load more has reached.
const visibleCount = (params) => {
  const requested = Number(params.get('count'));
  return Number.isInteger(requested) && requested > PAGE_SIZE
    ? requested
    : PAGE_SIZE;
};
function layouts(posts, count) {
  const shapes = tileShapes(posts).slice(0, count);
  const featured = (i) => Boolean(posts[i].featured);
  return {
    desktop: fillPages(shapes, PAGE_SIZE, 4, featured),
    mobile: fillPages(shapes.map(phoneShape), PAGE_SIZE, 2, featured, [
      '2x1',
      '1x1'
    ])
  };
}

// The query string is the filter state: it survives reloads and Back, and the
// server render (empty snapshot) stays static.
const listeners = new Set();
function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener('popstate', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('popstate', callback);
  };
}
const getSearch = () => window.location.search;
const getServerSearch = () => '';
function updateSearch(mutate) {
  const url = new URL(window.location.href);
  mutate(url.searchParams);
  // Keeps the router's own history entry; only the query string changes.
  window.history.replaceState(window.history.state, '', url);
  for (const callback of listeners) callback();
}

export default function Bento({ posts, filters }) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const params = new URLSearchParams(search);
  const categories = (filters ?? []).map((c) => ({
    ...c,
    slug: categorySlug(stegaClean(c.title))
  }));
  const categoryFor = (p) =>
    categories.find((c) => c.slug === p.get('category'))?._id;
  const category = categoryFor(params) ?? null;
  const query = params.get('q') ?? '';
  const count = visibleCount(params);

  // The field shows what is typed; it follows the query only when the URL changes it.
  const [text, setText] = useState(query);
  const debounce = useRef(0);
  // What our own commits wrote, so an external URL change can be told apart.
  const committed = useRef(query);
  useEffect(() => {
    // Only Back or Forward rewrites the field and drops a pending debounce: our own
    // commits can land late behind a running morph, after more has been typed.
    if (query !== committed.current) {
      clearTimeout(debounce.current);
      setText(query);
    }
    committed.current = query;
  }, [query]);
  useEffect(() => () => clearTimeout(debounce.current), []);
  const searchInput = useRef(null);
  const list = useRef(null);
  const grid = useRef(null);
  // Index of the first tile a Load more press adds, focused once it exists.
  const landing = useRef(null);

  const index = useMemo(() => {
    const mini = new MiniSearch({
      idField: '_id',
      fields: ['title', 'summary', 'categories'],
      storeFields: ['_id'],
      searchOptions: {
        boost: { title: 3, categories: 0.5 },
        prefix: true,
        fuzzy: 0.2
      }
    });
    mini.addAll(
      posts.map((post) => ({
        _id: post._id,
        title: stegaClean(post.title) ?? '',
        summary: stegaClean(post.summary) ?? '',
        categories: (post.categories ?? [])
          .map((c) => stegaClean(c.title))
          .join(' ')
      }))
    );
    return mini;
  }, [posts]);

  const select = (params) => {
    const selected = categoryFor(params);
    let result = posts;
    if (selected)
      result = result.filter((post) =>
        (post.categories ?? []).some((c) => c._id === selected)
      );
    const q = (params.get('q') ?? '').trim();
    if (q) {
      const hits = new Set(index.search(q).map((hit) => hit.id));
      result = result.filter((post) => hits.has(post._id));
    }
    return result;
  };
  const filtered = select(params);

  // The seed is the result count, so filtering re-settles the whole bento while
  // Load more only appends.
  const bands = tileBands(filtered);

  const visible = filtered.slice(0, count);
  const { desktop, mobile } = layouts(filtered, count);
  const remaining = filtered.length - visible.length;

  const { morphing, queue, ownScroll, transition } = useBentoMorph({
    list,
    grid,
    select,
    fill: (result, p) => layouts(result, visibleCount(p)),
    onCommit: (q) => {
      committed.current = q;
    },
    updateSearch
  });

  useEffect(() => {
    const onScroll = () => {
      const own = ownScroll.current?.();
      if (own !== undefined && Math.abs(scrollY - own) < 2) return;
      ownScroll.current = null;
      const input = searchInput.current;
      if (document.activeElement !== input || !input) return;
      // The navbar publishes its clearance on html: the pill's bottom edge including its float gap.
      const clearance = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--nav-clearance'
        )
      );
      if (!(clearance > 0)) return;
      if (input.getBoundingClientRect().top < clearance) input.blur();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ownScroll]);

  // Keyboard users land on the new content, not on a button that moved.
  useEffect(() => {
    if (landing.current === null) return;
    grid.current?.children[landing.current]?.focus({ preventScroll: true });
    landing.current = null;
  }, [count]);

  // Every filter change starts over from the first page.
  const changeFilters = (mutate) =>
    queue((p) => {
      mutate(p);
      p.delete('count');
    });
  const changeCategory = (id) => {
    const slug = categories.find((c) => c._id === id)?.slug;
    changeFilters((p) => {
      if (slug) p.set('category', slug);
      else p.delete('category');
    });
  };
  const changeText = (value) => {
    setText(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      changeFilters((p) => {
        if (value.trim()) p.set('q', value.trim());
        else p.delete('q');
      });
    }, DEBOUNCE);
  };
  const clear = () => {
    clearTimeout(debounce.current);
    setText('');
    changeFilters((p) => {
      p.delete('category');
      p.delete('q');
    });
    searchInput.current?.focus();
  };
  const loadMore = () => {
    // A page appended under a running morph would be dropped by the queued commit.
    if (transition.current) return;
    landing.current = visible.length;
    updateSearch((p) => p.set('count', String(count + PAGE_SIZE)));
  };

  return (
    <section ref={list} className={styles.list}>
      {filters && (
        <Filters
          categories={categories}
          category={category}
          onCategory={changeCategory}
          text={text}
          onText={changeText}
          inputRef={searchInput}
        />
      )}
      <p className={styles.srOnly} aria-live='polite'>
        {filtered.length
          ? `${filtered.length} project${filtered.length === 1 ? '' : 's'}`
          : 'No projects match'}
      </p>
      <div ref={grid} className={styles.grid}>
        {visible.map((post, i) => (
          <Tile
            key={post._id}
            post={post}
            shape={desktop[i]}
            // The post's own band in every shape, so neither a phone fold nor a desktop reshape flips it.
            band={bands[i]}
            mobileShape={mobile[i]}
            active={category}
            morphing={morphing}
          />
        ))}
        {visible.length === 0 && (
          <div
            className={styles.empty}
            style={{ viewTransitionName: 'post-empty' }}>
            <p>No projects match.</p>
            <button type='button' className={styles.loadMore} onClick={clear}>
              Clear filters
              <LuX strokeWidth={1.75} aria-hidden='true' />
            </button>
          </div>
        )}
      </div>
      {remaining > 0 && (
        <div
          className={styles.loadMoreRow}
          style={{ viewTransitionName: 'post-load-more' }}>
          <button type='button' className={styles.loadMore} onClick={loadMore}>
            Load more
            <LuChevronDown strokeWidth={1.75} aria-hidden='true' />
            <span className={styles.loadMoreCount}>{remaining} left</span>
          </button>
        </div>
      )}
    </section>
  );
}
