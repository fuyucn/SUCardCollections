import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Guide from './components/Guide'
import { default as Upload } from './components/Upload'
import AuthGuard from './components/AuthGuard'
import './App.css'

// 3D 页面按需加载（Three.js 全家桶仅在访问名人堂时下载）
const HallOfFame3D = lazy(() => import('./components/HallOfFame3D'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthGuard>
        <Suspense fallback={
          <div style={{
            height:'100vh',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            background:'#0e0e12',
            color:'#555'
          }}>
            名人堂加载中...
          </div>
        }>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/hof" element={<HallOfFame3D />} />
          </Routes>
        </Suspense>
      </AuthGuard>
    </HashRouter>
  </React.StrictMode>,
)
