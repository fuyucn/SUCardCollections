import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Guide from './components/Guide'
import Upload from './components/Upload'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
