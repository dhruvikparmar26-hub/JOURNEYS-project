import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('React app starting...')

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  rootElement.style.backgroundColor = '#ffffff'
  rootElement.style.color = '#000000'
  rootElement.style.minHeight = '100vh'
  console.log('Root element styled')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

console.log('React rendered')
