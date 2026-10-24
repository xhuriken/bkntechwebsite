import { createContext, useContext } from 'react';

// Public build-time content only. The browser refreshes it through the existing API.
export const SiteContentContext = createContext({});
export const useSiteContent = () => useContext(SiteContentContext);
