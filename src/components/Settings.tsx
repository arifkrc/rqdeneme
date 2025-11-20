import { useState, useEffect } from 'react'

const Settings = () => {
  const [scriptUrl, setScriptUrl] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Load saved URL from localStorage
    const savedUrl = localStorage.getItem('googleAppsScriptUrl')
    if (savedUrl) {
      setScriptUrl(savedUrl)
    } else {
      // Set default URL
      const defaultUrl = 'https://script.google.com/macros/s/AKfycbzlE8DGJG23ba2Fxd0u4eRqQYh1h6JZ2N3vhA_nXa9c1UL_rpvi1G-g58lDQnNNo51jEw/exec'
      setScriptUrl(defaultUrl)
      localStorage.setItem('googleAppsScriptUrl', defaultUrl)
    }
  }, [])

  const saveScriptUrl = () => {
    if (scriptUrl.trim()) {
      localStorage.setItem('googleAppsScriptUrl', scriptUrl.trim())
      alert('Google Apps Script URL kaydedildi! Şimdi QR kod oluşturduğunuzda veriler Google Sheets\'e kaydedilecektir.')
    }
  }

  const testConnection = async () => {
    if (!scriptUrl.trim()) {
      alert('Lütfen önce Google Apps Script URL\'sini girin.')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Test with a simple test data payload
      const testData = {
        tarih: '2025-11-20',
        sarjNo: 'TEST-001',
        izlenebilirlikNo: 'TEST-IZ-001',
        urunKodu: 'TEST-PRODUCT',
        input5: 'Test connection',
        input6: 'Test data'
      }

      const response = await fetch(scriptUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        mode: 'cors'
      })

      // Google Apps Script returns text/plain, not JSON
      const result = await response.text()
      console.log('Connection test result:', result)
      
      // Try to parse as JSON to check if it's a proper response
      try {
        const jsonResult = JSON.parse(result)
        if (jsonResult.success || result.includes('success')) {
          setConnectionStatus('success')
        } else {
          throw new Error(jsonResult.error || 'Unknown error from Google Apps Script')
        }
      } catch {
        // If it's not JSON but response is OK, it might still be working
        if (response.ok) {
          setConnectionStatus('success')
        } else {
          throw new Error(`Invalid response format: ${result}`)
        }
      }
      
    } catch (error) {
      console.error('Connection test failed:', error)
      
      // Check if it's a CORS error (common with Google Apps Script)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setConnectionStatus('error')
        console.warn('CORS error detected. This might be normal for Google Apps Script. Try sending actual data to test.')
      } else {
        setConnectionStatus('error')
      }
    } finally {
      setIsTestingConnection(false)
    }
  }

  const clearLocalData = () => {
    if (confirm('Tüm yerel verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      localStorage.removeItem('qrData')
      alert('Yerel veriler temizlendi.')
    }
  }

  return (
    <div className="settings">
      <h2>Ayarlar</h2>
      
      <div className="settings-section">
        <h3>Google Sheets Entegrasyonu</h3>
        <div className="setting-item">
          <label htmlFor="scriptUrl">Google Apps Script Web App URL:</label>
          <input
            id="scriptUrl"
            type="url"
            value={scriptUrl}
            onChange={(e) => setScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/YOUR_ID/exec"
            className="script-url-input"
          />
          <div className="setting-buttons">
            <button onClick={saveScriptUrl} className="save-btn">
              URL'yi Kaydet
            </button>
            <button 
              onClick={testConnection} 
              disabled={isTestingConnection}
              className="test-btn"
            >
              {isTestingConnection ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
            </button>
          </div>
          
          <div className="test-info">
            <p><strong>Not:</strong> Google Apps Script CORS kısıtlamaları nedeniyle bağlantı testi başarısız görünebilir. 
            En iyi test yöntemi gerçek veri göndermektir.</p>
          </div>
          
          {connectionStatus === 'success' && (
            <div className="connection-status success">
              ✅ Google Apps Script bağlantısı başarılı! Test verisi gönderildi.
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="connection-status error">
              ⚠️ Bağlantı test edilemedi. Bu normal olabilir (CORS kısıtlaması). 
              Gerçek veri göndererek test edin veya Google Sheets'i kontrol edin.
              <details style={{marginTop: '0.5rem'}}>
                <summary style={{cursor: 'pointer', fontSize: '0.875rem'}}>Alternatif Test Yöntemi</summary>
                <p style={{fontSize: '0.875rem', margin: '0.5rem 0'}}>
                  1. QR Kod Oluştur sekmesine gidin<br/>
                  2. Test verisi girin<br/>
                  3. "QR Kod Oluştur & Kaydet" tıklayın<br/>
                  4. Google Sheets'inizi kontrol edin
                </p>
              </details>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>Kurulum Talimatları</h3>
        <div className="instructions">
          <ol>
            <li><strong>Google Apps Script</strong> oluşturun: <code>script.google.com</code></li>
            <li><strong>google-apps-script.js</strong> dosyasındaki kodu kopyalayın</li>
            <li>Script'i <strong>Web App</strong> olarak deploy edin</li>
            <li>Web App URL'sini yukarıdaki alana yapıştırın</li>
            <li><strong>URL'yi Kaydet</strong> butonuna tıklayın</li>
            <li><strong>Bağlantıyı Test Et</strong> ile kontrol edin</li>
          </ol>
          <p className="note">
            <strong>Not:</strong> Detaylı kurulum talimatları için <code>GOOGLE_SHEETS_SETUP.md</code> dosyasını kontrol edin.
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3>Veri Yönetimi</h3>
        <div className="setting-item">
          <button onClick={clearLocalData} className="danger-btn">
            Yerel Verileri Temizle
          </button>
          <p className="setting-description">
            Tarayıcıda saklanan tüm QR kod verilerini siler. Google Sheets'teki veriler etkilenmez.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings