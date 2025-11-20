import { useState, useEffect } from 'react'
import QRGenerator from './components/QRGenerator'
import QRReader from './components/QRReader'
import QRDisplay from './components/QRDisplay'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'reader' | 'settings' | 'display'>('generator')
  const [showQRDisplay, setShowQRDisplay] = useState(false)

  useEffect(() => {
    // URL'de QR data varsa direkt QRDisplay göster
    const urlParams = new URLSearchParams(window.location.search)
    const qrData = urlParams.get('qr') || urlParams.get('data')
    
    if (qrData) {
      setShowQRDisplay(true)
      setActiveTab('display')
    }
  }, [])

  // Eğer QR Display modundaysak sadece onu göster
  if (showQRDisplay) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>QR Kod Verileri</h1>
          <div className="tab-buttons">
            <button onClick={() => {
              setShowQRDisplay(false)
              setActiveTab('generator')
              window.history.pushState({}, '', window.location.pathname)
            }}>
              🏠 Ana Sayfa
            </button>
          </div>
        </header>
        <main className="app-main">
          <QRDisplay />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>QR Kod Oluşturucu & Okuyucu</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'generator' ? 'active' : ''} 
            onClick={() => setActiveTab('generator')}
          >
            QR Kod Oluştur
          </button>
          <button 
            className={activeTab === 'reader' ? 'active' : ''} 
            onClick={() => setActiveTab('reader')}
          >
            QR Kod Oku
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Ayarlar
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'generator' && <QRGenerator />}
        {activeTab === 'reader' && <QRReader />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
