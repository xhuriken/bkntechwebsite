import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n.js'
import App from './App.jsx'

const initialContent = JSON.parse(document.getElementById('site-content')?.textContent || '{}');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App initialContent={initialContent} />
  </StrictMode>,
)
