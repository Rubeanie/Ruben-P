import { Inline, Text } from '@sanity/ui';
import styles from '@/styles/components/SharePreview.module.scss';
import {
  DISCORD_DESCRIPTION_BYTES,
  DISCORD_TITLE_BYTES,
  clipBytes,
  clipChars,
  hostOf,
  layoutFor,
  pathOf
} from './platforms';

// Marks a value that came from somewhere other than this page's own field.
function Src({ s, children }) {
  if (!s || s.kind === 'page') return children;
  return (
    <span className={styles.mark} data-kind={s.kind} title={s.label}>
      {children}
    </span>
  );
}

function Img({ src, className }) {
  return <img className={className} src={src} alt='' />;
}

export function Legend() {
  const items = [
    ['site', 'From Site settings'],
    ['cover', 'Post cover'],
    ['missing', 'Missing']
  ];
  return (
    <Inline space={3}>
      {items.map(([kind, label]) => (
        <Text key={kind} size={1} muted>
          <span className={styles.mark} data-kind={kind}>
            {label}
          </span>
        </Text>
      ))}
    </Inline>
  );
}

function Google({ d }) {
  const { tags, sources } = d;
  const url = tags.url;
  const host = hostOf(url);
  const crumbs = pathOf(url).split('/').filter(Boolean);
  const hidden = tags.robots.startsWith('noindex');
  return (
    <div className={styles.google} data-hidden={hidden || undefined}>
      <div className={styles.gSite}>
        <span className={styles.gFav}>
          <Img src='/favicon.ico' />
        </span>
        <span>
          <span className={styles.gName}>
            <Src s={sources.ogSiteName}>{tags.ogSiteName || host}</Src>
          </span>
          <span className={styles.gUrl}>
            {[new URL(url).origin, ...crumbs].join(' › ')}
          </span>
        </span>
      </div>
      <div className={styles.gTitle}>
        <Src s={sources.title}>{tags.title || tags.ogTitle || host}</Src>
      </div>
      <div className={styles.gSnippet}>
        {tags.description ? (
          <Src s={sources.description}>{tags.description}</Src>
        ) : (
          <span className={styles.missing}>
            No meta description: Google picks text from the page.
          </span>
        )}
      </div>
      {hidden && (
        <div className={styles.gHidden}>
          Not in results: this page is noindex
        </div>
      )}
    </div>
  );
}

function X({ d }) {
  const { tags, sources, images } = d;
  const host = hostOf(tags.url);
  const layout = layoutFor('x', tags, images);
  if (['invalid', 'other', 'none'].includes(layout))
    return (
      <div className={styles.xStack}>
        <div className={styles.x}>
          <div className={styles.xBare}>
            {tags.url}
            <div className={styles.xNote}>
              {layout === 'invalid'
                ? `twitter:card is "${tags.twitterCard}": X documents no card for it, so the post may show the bare link.`
                : layout === 'other'
                  ? `twitter:card is "${tags.twitterCard}": not a link card, so X shows its ${tags.twitterCard} layout, not a link preview.`
                  : tags.ogImage
                    ? 'Image over 5 MB: X drops it and shows the card without a picture.'
                    : 'No image: X shows a summary card without a picture.'}
            </div>
          </div>
        </div>
        {layout === 'invalid' && (
          <div className={styles.xWould}>
            <div className={styles.xWouldLabel}>
              With summary_large_image it would show:
            </div>
            <X
              d={{
                ...d,
                tags: { ...tags, twitterCard: 'summary_large_image' }
              }}
            />
          </div>
        )}
      </div>
    );
  if (layout === 'small')
    return (
      <div className={`${styles.x} ${styles.xSmall}`}>
        <Src s={sources.ogImage}>
          <Img className={styles.xThumb} src={tags.twitterImage} />
        </Src>
        <div className={styles.xText}>
          <div className={styles.xDim}>{host}</div>
          <div className={styles.xTitle}>
            <Src s={sources.ogTitle}>{clipChars(tags.twitterTitle, 70)}</Src>
          </div>
          <div className={styles.xDesc}>
            <Src s={sources.ogDescription}>{tags.twitterDescription}</Src>
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <div className={styles.x}>
        <div className={styles.xLarge}>
          <Src s={sources.ogImage}>
            <Img className={styles.cover} src={tags.twitterImage} />
          </Src>
          <span className={styles.xOverlay}>
            <Src s={sources.ogTitle}>{clipChars(tags.twitterTitle, 70)}</Src>
          </span>
        </div>
      </div>
      <div className={styles.xFrom}>From {host}</div>
    </div>
  );
}

function Facebook({ d }) {
  const { tags, sources, images } = d;
  const layout = layoutFor('facebook', tags, images);
  const small = layout === 'small';
  return (
    <div className={`${styles.fb} ${small ? styles.fbSmall : ''}`}>
      {layout !== 'none' && (
        <div className={small ? styles.fbThumb : styles.fbImage}>
          <Src s={sources.ogImage}>
            <Img className={styles.cover} src={tags.ogImage} />
          </Src>
        </div>
      )}
      <div className={styles.fbText}>
        <div className={styles.fbDomain}>{hostOf(tags.url)}</div>
        <div className={styles.fbTitle}>
          <Src s={sources.ogTitle}>{tags.ogTitle}</Src>
        </div>
        <div className={styles.fbDesc}>
          <Src s={sources.ogDescription}>{tags.ogDescription}</Src>
        </div>
      </div>
    </div>
  );
}

function LinkedIn({ d }) {
  const { tags, sources, images } = d;
  return (
    <div className={styles.li}>
      {layoutFor('linkedin', tags, images) !== 'none' && (
        <div className={styles.liThumb}>
          <Src s={sources.ogImage}>
            <Img className={styles.cover} src={tags.ogImage} />
          </Src>
        </div>
      )}
      <div className={styles.liText}>
        <div className={styles.liTitle}>
          <Src s={sources.ogTitle}>{tags.ogTitle}</Src>
        </div>
        <div className={styles.liDomain}>{hostOf(tags.url)}</div>
      </div>
    </div>
  );
}

function WhatsApp({ d }) {
  const { tags, sources, images } = d;
  const small = layoutFor('whatsapp', tags, images) !== 'large';
  return (
    <div className={styles.waRow}>
      <div className={styles.wa}>
        <div className={`${styles.waCard} ${small ? styles.waSmall : ''}`}>
          {tags.ogImage && (
            <div className={small ? styles.waThumb : styles.waImage}>
              <Src s={sources.ogImage}>
                <Img className={styles.cover} src={tags.ogImage} />
              </Src>
            </div>
          )}
          <div className={styles.waText}>
            <div className={styles.waTitle}>
              <Src s={sources.ogTitle}>{tags.ogTitle}</Src>
            </div>
            <div className={styles.waDesc}>
              <Src s={sources.ogDescription}>{tags.ogDescription}</Src>
            </div>
            <div className={styles.waDomain}>{hostOf(tags.url)}</div>
          </div>
        </div>
        <div className={styles.waLink}>{tags.url}</div>
        <div className={styles.waTime}>9:41</div>
      </div>
    </div>
  );
}

function Discord({ d }) {
  const { tags, sources, images } = d;
  const large = layoutFor('discord', tags, images) === 'large';
  const thumb = tags.ogImage && !large;
  // Discord fits a large image into 400x300; a card with one 300px+ wide is that wide plus 32px.
  const { width: w, height: h } = images;
  const fitted = w && h ? Math.round(w * Math.min(400 / w, 300 / h, 1)) : 400;
  const cardWidth = large && fitted >= 300 ? fitted + 32 : undefined;
  return (
    <div className={styles.dcWrap}>
      <div className={styles.dcAvatar} aria-hidden='true'>
        R
      </div>
      <div className={styles.dcMessage}>
        <div className={styles.dcHeader}>
          <span className={styles.dcAuthor}>Ruben</span>
          <span className={styles.dcTime}>Today at 9:41 AM</span>
        </div>
        <div className={styles.dcLink}>{tags.url}</div>
        <article
          className={styles.dc}
          style={{ '--bar': tags.themeColor, maxWidth: cardWidth }}>
          <div className={styles.dcGrid} data-thumb={thumb || undefined}>
            {tags.ogSiteName && (
              <div className={styles.dcSite}>
                <Src s={sources.ogSiteName}>{tags.ogSiteName}</Src>
              </div>
            )}
            {tags.ogTitle && (
              <div className={styles.dcTitle}>
                <Src s={sources.ogTitle}>
                  {clipBytes(tags.ogTitle, DISCORD_TITLE_BYTES)}
                </Src>
              </div>
            )}
            {tags.ogDescription && (
              <div className={styles.dcDesc}>
                <Src s={sources.ogDescription}>
                  {clipBytes(tags.ogDescription, DISCORD_DESCRIPTION_BYTES)}
                </Src>
              </div>
            )}
            {thumb && (
              <div className={styles.dcThumb}>
                <Src s={sources.ogImage}>
                  <Img src={tags.ogImage} />
                </Src>
              </div>
            )}
            {tags.ogImage && large && (
              <div className={styles.dcImage}>
                <Src s={sources.ogImage}>
                  <Img src={tags.ogImage} />
                </Src>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

// Slack and Apple Messages publish tag rules but no pixel specs; sizes follow Slack's
// attachment docs and Apple's TN3156, the rest is matched by eye.
function Slack({ d }) {
  const { tags, sources, images } = d;
  const layout = layoutFor('slack', tags, images);
  return (
    <div className={styles.slWrap}>
      <div className={styles.slAvatar} aria-hidden='true'>
        R
      </div>
      <div className={styles.slMessage}>
        <div className={styles.slHeader}>
          <span className={styles.slAuthor}>Ruben</span>
          <span className={styles.slTime}>9:41 AM</span>
        </div>
        <div className={styles.slLink}>{tags.url}</div>
        <div className={styles.sl}>
          <div className={styles.slBody}>
            <div className={styles.slText}>
              <div className={styles.slSite}>
                <Img className={styles.slIcon} src='/favicon.ico' />
                <Src s={sources.ogSiteName}>
                  {tags.ogSiteName || hostOf(tags.url)}
                </Src>
              </div>
              <div className={styles.slTitle}>
                <Src s={sources.ogTitle}>{tags.twitterTitle}</Src>
              </div>
              {tags.twitterDescription && (
                <div className={styles.slDesc}>
                  <Src s={sources.ogDescription}>{tags.twitterDescription}</Src>
                </div>
              )}
            </div>
            {layout === 'small' && (
              <div className={styles.slThumb}>
                <Src s={sources.ogImage}>
                  <Img src={tags.ogImage} />
                </Src>
              </div>
            )}
          </div>
          {layout === 'large' && (
            <div className={styles.slImage}>
              <Src s={sources.ogImage}>
                <Img src={tags.ogImage} />
              </Src>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IMessage({ d }) {
  const { tags, sources, images } = d;
  const icon = layoutFor('imessage', tags, images) === 'icon';
  // Link Presentation keeps the photo's shape within limits Apple does not publish.
  const ratio =
    images.width && images.height
      ? Math.min(Math.max(images.width / images.height, 1), 2)
      : 1.91;
  return (
    <div className={styles.imWrap}>
      <div className={`${styles.im} ${icon ? styles.imIconCard : ''}`}>
        {icon ? (
          <Img className={styles.imIcon} src='/apple-icon.png' />
        ) : (
          <div className={styles.imImage} style={{ aspectRatio: ratio }}>
            <Src s={sources.ogImage}>
              <Img className={styles.cover} src={tags.ogImage} />
            </Src>
          </div>
        )}
        <div className={styles.imCaption}>
          <div className={styles.imTitle}>
            <Src s={sources.ogTitle}>{tags.ogTitle || hostOf(tags.url)}</Src>
          </div>
          <div className={styles.imDomain}>{hostOf(tags.url)}</div>
        </div>
      </div>
      <div className={styles.imMeta}>Delivered</div>
    </div>
  );
}

export const REPLICAS = {
  google: Google,
  x: X,
  facebook: Facebook,
  linkedin: LinkedIn,
  whatsapp: WhatsApp,
  discord: Discord,
  slack: Slack,
  imessage: IMessage
};
