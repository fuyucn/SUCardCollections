import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Generate from './components/Generate'
import CardDetail from './components/CardDetail'
import { SuCardProvider } from './SuCardContext'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SuCardProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/card/:id" element={<CardDetail />} />
        </Routes>
      </HashRouter>
    </SuCardProvider>
  </React.StrictMode>,
)
