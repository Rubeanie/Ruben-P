import { stegaClean } from '@sanity/client/stega';
import { baseUrl } from '@/lib/env';
import processUrl, { resolveLink } from '@/lib/processUrl';
import { resolveImage } from '@/lib/imageBlock';

const clean = (value) => stegaClean(value)?.trim?.() || undefined;
const isExternal = (url) => /^https?:\/\//i.test(url);
const absolute = (link) =>
  (link && URL.parse(link, baseUrl)?.href) || undefined;

// Heroes and image blocks keep their picture under one of these keys.
const IMAGE_KEYS = ['image', 'bgImage', 'bgImageMobile'];

function findImages(node, found = []) {
  if (Array.isArray(node)) {
    node.forEach((item) => findImages(item, found));
  } else if (node && typeof node === 'object') {
    // An image block showing its Cloudinary picture keeps the unused Sanity one.
    if (node.imageType === 'cloudinary.asset') return found;
    for (const [key, value] of Object.entries(node)) {
      if (IMAGE_KEYS.includes(key) && value?.asset?.url) {
        found.push(value.asset);
      } else {
        findImages(value, found);
      }
    }
  }
  return found;
}

// Search engines read who the site belongs to, and who to credit for its images, from here.
export default function JsonLd({ page, path }) {
  const site = page.identity;
  const author = site?.author;
  const personId = `${baseUrl}/#person`;
  const websiteId = `${baseUrl}/#website`;
  const creator = author ? { '@id': personId } : undefined;

  const imageObject = (asset) => {
    const creditLine = clean(asset.creditLine);
    // A credited picture is someone else's, so the site's rights don't apply.
    if (creditLine) {
      return {
        '@type': 'ImageObject',
        contentUrl: asset.url,
        creator: { '@type': 'Person', name: creditLine },
        creditText: creditLine
      };
    }
    return {
      '@type': 'ImageObject',
      contentUrl: asset.url,
      creator,
      creditText: clean(author?.name),
      copyrightNotice: clean(site?.copyrightNotice) ?? clean(author?.name),
      license: clean(site?.license),
      acquireLicensePage: clean(site?.acquireLicensePage)
    };
  };

  // A cover is its still, as tiles and the share card show it.
  const still = resolveImage(page.cover)?.still;
  const cover = still && imageObject({ url: still });
  const figures = [
    ...new Map(findImages(page.modules).map((asset) => [asset.url, asset]))
  ]
    .filter(([url]) => url !== cover?.contentUrl)
    .map(([, asset]) => imageObject(asset));

  const sameAs = site?.sameAs?.filter(isExternal) ?? [];
  const graph = [
    author && {
      '@type': 'Person',
      '@id': personId,
      name: clean(author.name),
      url: absolute(resolveLink(author.link)) ?? baseUrl,
      image: author.photo?.asset?.url,
      jobTitle: clean(author.jobTitle),
      sameAs: sameAs.length ? sameAs : undefined
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: clean(site?.title),
      alternateName: clean(site?.alternateName),
      url: baseUrl,
      publisher: creator
    },
    author &&
      path === '/' && {
        '@type': 'ProfilePage',
        url: processUrl(page),
        mainEntity: creator,
        isPartOf: { '@id': websiteId },
        dateModified: page._updatedAt
      },
    page._type === 'page.post' && {
      '@type': 'Article',
      headline: clean(page.title),
      description: clean(page.summary),
      datePublished: clean(page.publishDate),
      dateModified: page._updatedAt,
      image: cover || undefined,
      author: page.authors?.length
        ? page.authors.map((byline) => {
            if (author && byline._id === author._id) return creator;
            return {
              '@type': 'Person',
              name: clean(byline.name),
              url: absolute(resolveLink(byline.link))
            };
          })
        : undefined,
      mainEntityOfPage: processUrl(page)
    },
    ...figures
  ].filter(Boolean);

  return (
    <script
      type='application/ld+json'
      // Escape `<` so content containing `</script>` can't break out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph
        }).replace(/</g, '\\u003c')
      }}
    />
  );
}
