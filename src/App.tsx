import { useState } from 'react'
import QRGenerator from './components/QRGenerator'
import QRReader from './components/QRReader'
import DataViewer from './components/DataViewer'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'reader' | 'data' | 'settings'>('generator')

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
            className={activeTab === 'data' ? 'active' : ''} 
            onClick={() => setActiveTab('data')}
          >
            Kayıtlı Veriler
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
        {activeTab === 'data' && <DataViewer />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
