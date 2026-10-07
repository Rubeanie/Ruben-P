import { stegaClean } from '@sanity/client/stega';
import { baseUrl } from '@/lib/env';
import processUrl, { resolveLink } from '@/lib/processUrl';
import { stillOf } from '@/lib/imageBlock';

const clean = (value) => stegaClean(value)?.trim?.() || undefined;
const isExternal = (url) => /^https?:\/\//i.test(url);
const absolute = (link) =>
  (link && URL.parse(link, baseUrl)?.href) || undefined;

// Heroes, image blocks and carousel cards keep their picture under one of
// these keys; each counts as its still.
const IMAGE_KEYS = ['image', 'bgImage'];

// An image field as its still and the credit its Cloudinary asset carries.
const picture = (field) => {
  const url = stillOf(field);
  return url && { url, credit: clean(field.asset.credit) };
};

function findImages(node, found = []) {
  if (Array.isArray(node)) {
    node.forEach((item) => findImages(item, found));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      const image = IMAGE_KEYS.includes(key) && picture(value);
      if (image) found.push(image);
      else findImages(value, found);
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

  const imageObject = ({ url, credit }) =>
    // A credited picture is someone else's, so the site's rights don't apply.
    credit
      ? {
          '@type': 'ImageObject',
          contentUrl: url,
          creator: { '@type': 'Person', name: credit },
          creditText: credit
        }
      : {
          '@type': 'ImageObject',
          contentUrl: url,
          creator,
          creditText: clean(author?.name),
          copyrightNotice: clean(site?.copyrightNotice) ?? clean(author?.name),
          license: clean(site?.license),
          acquireLicensePage: clean(site?.acquireLicensePage)
        };

  // A cover is its still, as tiles and the share card show it.
  const shown = picture(page.cover);
  const cover = shown && imageObject(shown);
  const figures = [
    ...new Map(findImages(page.modules).map((image) => [image.url, image]))
  ]
    .filter(([url]) => url !== shown?.url)
    .map(([, image]) => imageObject(image));

  const sameAs = site?.sameAs?.filter(isExternal) ?? [];
  const graph = [
    author && {
      '@type': 'Person',
      '@id': personId,
      name: clean(author.name),
      url: absolute(resolveLink(author.link)) ?? baseUrl,
      image: stillOf(author.photo),
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
