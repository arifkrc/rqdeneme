import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { saveToGoogleSheets, type QRData } from '../services/googleSheets'

const QRGenerator = () => {
  const [qrData, setQrData] = useState<QRData>({
    tarih: new Date().toISOString().split('T')[0], // Bugünün tarihi
    sarjNo: `SRJ-${Date.now().toString().slice(-6)}`, // Rastgele şarj no
    izlenebilirlikNo: `IZ-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`, // Rastgele izlenebilirlik no
    urunKodu: '6312011',
    input5: 'Kalite kontrol onaylandı',
    input6: `Ambar-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 50) + 1}`
  })
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRCode = async () => {
    const hasData = Object.values(qrData).some(value => value.trim() !== '')
    if (!hasData) return

    setIsGenerating(true)
    setSaveStatus('idle')
    
    try {
      const canvas = canvasRef.current
      if (canvas) {
        // Combine all data into a structured format
        const combinedData = JSON.stringify({
          tarih: qrData.tarih,
          sarjNo: qrData.sarjNo,
          izlenebilirlikNo: qrData.izlenebilirlikNo,
          urunKodu: qrData.urunKodu,
          input5: qrData.input5,
          input6: qrData.input6
        })
        
        await QRCode.toCanvas(canvas, combinedData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        const dataUrl = canvas.toDataURL()
        setQrCodeUrl(dataUrl)
        
        // Save to Google Sheets
        console.log('💾 Google Sheets\'e kaydetmeye başlıyor:', qrData)
        setIsSaving(true)
        const saveSuccess = await saveToGoogleSheets(qrData)
        console.log('💾 Kaydetme sonucu:', saveSuccess ? 'BAŞARI' : 'HATA')
        setSaveStatus(saveSuccess ? 'success' : 'error')
        setIsSaving(false)
        
        // Kullanıcıya bilgi ver
        if (saveSuccess) {
          console.log('✅ QR kod oluşturuldu ve Google Sheets\'e gönderildi!')
          console.log('📊 Lütfen "Sayfa1" sheet\'ini kontrol edin')
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      setSaveStatus('error')
    } finally {
      setIsGenerating(false)
      setIsSaving(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = qrCodeUrl
      link.click()
    }
  }

  const clearQRCode = () => {
    setQrData({
      tarih: new Date().toISOString().split('T')[0], // Bugünün tarihi
      sarjNo: `SRJ-${Date.now().toString().slice(-6)}`, // Rastgele şarj no
      izlenebilirlikNo: `IZ-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`, // Rastgele izlenebilirlik no
      urunKodu: '6312011',
      input5: 'Kalite kontrol onaylandı',
      input6: `Ambar-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 50) + 1}`
    })
    setQrCodeUrl('')
    setSaveStatus('idle')
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const handleInputChange = (field: keyof QRData, value: string) => {
    setQrData(prev => ({ ...prev, [field]: value }))
  }

  const hasData = Object.values(qrData).some(value => value.trim() !== '')

  return (
    <div className="qr-generator">
      <h2>QR Kod Oluştur</h2>
      
      <div className="input-section">
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="tarih">Tarih</label>
            <input
              id="tarih"
              type="date"
              value={qrData.tarih}
              onChange={(e) => handleInputChange('tarih', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="sarjNo">Şarj No</label>
            <input
              id="sarjNo"
              type="text"
              value={qrData.sarjNo}
              onChange={(e) => handleInputChange('sarjNo', e.target.value)}
              placeholder="Şarj numarasını girin"
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="izlenebilirlikNo">İzlenebilirlik No</label>
            <input
              id="izlenebilirlikNo"
              type="text"
              value={qrData.izlenebilirlikNo}
              onChange={(e) => handleInputChange('izlenebilirlikNo', e.target.value)}
              placeholder="İzlenebilirlik numarasını girin"
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="urunKodu">Ürün Kodu</label>
            <input
              id="urunKodu"
              type="text"
              value={qrData.urunKodu}
              onChange={(e) => handleInputChange('urunKodu', e.target.value)}
              placeholder="Ürün kodunu girin"
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="input5">Ek Bilgi 1</label>
            <input
              id="input5"
              type="text"
              value={qrData.input5}
              onChange={(e) => handleInputChange('input5', e.target.value)}
              placeholder="Ek bilgi girin"
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="input6">Ek Bilgi 2</label>
            <input
              id="input6"
              type="text"
              value={qrData.input6}
              onChange={(e) => handleInputChange('input6', e.target.value)}
              placeholder="Ek bilgi girin"
              className="form-input"
            />
          </div>
        </div>
        
        <div className="button-group">
          <button 
            onClick={generateQRCode} 
            disabled={!hasData || isGenerating || isSaving}
            className="generate-btn"
          >
            {isGenerating ? 'QR Kod Oluşturuluyor...' : isSaving ? 'Kaydediliyor...' : 'QR Kod Oluştur & Kaydet'}
          </button>
          
          <button 
            onClick={clearQRCode}
            className="clear-btn"
          >
            Yeni Veriler Oluştur
          </button>
        </div>
        
        {saveStatus === 'success' && (
          <div className="save-status success">
            ✅ Veriler Google Sheets'e gönderildi! Lütfen Google Sheets'inizi kontrol edin.
            <br/><small>Not: CORS kısıtlamaları nedeniyle yanıt doğrulanamıyor.</small>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="save-status error">
            ⚠ Veri gönderilirken hata oluştu. Lütfen Google Apps Script URL'nizi kontrol edin.
          </div>
        )}
      </div>

      <div className="qr-output">
        <canvas 
          ref={canvasRef}
          style={{ display: qrCodeUrl ? 'block' : 'none' }}
          className="qr-canvas"
        />
        
        {qrCodeUrl && (
          <div className="download-section">
            <button onClick={downloadQRCode} className="download-btn">
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRGenerator