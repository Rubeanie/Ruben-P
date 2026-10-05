import { useSiteLogo } from '../useSiteLogo';

const box = { display: 'block', height: '1.5em', maxWidth: '100%' };

// The site's own mark, with the static icon until it loads or when unset.
export function StudioLogo() {
  const logo = useSiteLogo();
  return logo ? (
    <span
      className='site-logo'
      style={box}
      dangerouslySetInnerHTML={{ __html: logo }}
    />
  ) : (
    <img src='/icon.svg' alt='' style={{ ...box, width: 'auto' }} />
  );
}
