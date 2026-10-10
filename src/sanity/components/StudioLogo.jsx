import { useContext, useMemo } from 'react';
import { SourceContext } from 'sanity/_singletons';
import { apiVersion } from '@/lib/env';
import { useSiteLogo } from '../useSiteLogo';

const box = { display: 'block', height: '1.5em', maxWidth: '100%' };

// The site's own mark, with the static icon until it loads or when unset.
export function StudioLogo() {
  // The login screen has no source yet, and useClient throws without one.
  const source = useContext(SourceContext);
  const client = useMemo(() => source?.getClient({ apiVersion }), [source]);
  const logo = useSiteLogo(client);
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
