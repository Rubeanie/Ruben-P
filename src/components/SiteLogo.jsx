'use client';

import { createContext, useContext } from 'react';

// The sanitized CMS logo, for client components deep in the tree (the loader).
const SiteLogoContext = createContext('');

export function SiteLogo({ logo, children }) {
  return <SiteLogoContext value={logo}>{children}</SiteLogoContext>;
}

export const useSiteLogo = () => useContext(SiteLogoContext) ?? '';
