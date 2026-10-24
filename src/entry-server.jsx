import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import './i18n.js';
import App from './App.jsx';
export { publicPaths, redirectPaths, getSeo, renderSeoTags, serializeJson } from './seo';

export function render(path, initialContent) {
  return renderToString(<App RouterComponent={StaticRouter} routerProps={{ location: path }} initialContent={initialContent} />);
}
