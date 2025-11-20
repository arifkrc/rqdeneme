import { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'

const QRReader = () => {
  const [result, setResult] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState('')
  const [hasCameraSupport, setHasCameraSupport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  useEffect(() => {
    // Check if camera is supported
    QrScanner.hasCamera().then(hasCamera => {
      setHasCameraSupport(hasCamera)
    })

    return () => {
      // Cleanup camera when component unmounts
      const scanner = qrScannerRef.current
      if (scanner) {
        scanner.stop()
        scanner.destroy()
      }
    }
  }, [])

  const startCamera = async () => {
    if (!videoRef.current || !hasCameraSupport) return

    try {
      setError('')
      setIsCameraActive(true)
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setResult(result.data)
          stopCamera()
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )
      
      await qrScannerRef.current.start()
    } catch (err) {
      setError('Kamera erişimi sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin.')
      setIsCameraActive(false)
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setIsCameraActive(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setError('')
    
    try {
      const result = await QrScanner.scanImage(file)
      setResult(result)
    } catch (err) {
      setError('Bu görüntüden QR kod okunamadı. Lütfen başka bir görüntü deneyin.')
      console.error('QR scan error:', err)
    } finally {
      setIsScanning(false)
    }
  }

  const clearResult = () => {
    setResult('')
    setError('')
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result)
        alert('Copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const openLink = () => {
    if (result && (result.startsWith('http://') || result.startsWith('https://'))) {
      window.open(result, '_blank')
    }
  }

  const isUrl = result && (result.startsWith('http://') || result.startsWith('https://'))

  return (
    <div className="qr-reader">
      <h2>QR Kod Oku</h2>
      
      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="file-input"
          id="qr-file-input"
        />
        <label htmlFor="qr-file-input" className="file-upload-btn">
          {isScanning ? 'Taranıyor...' : 'Resim Dosyası Seç'}
        </label>
        
        {hasCameraSupport && (
          <button 
            onClick={isCameraActive ? stopCamera : startCamera} 
            className={isCameraActive ? "stop-camera-btn" : "camera-btn"}
          >
            {isCameraActive ? 'Kamerayı Durdur' : '📱 Kamera ile Tara'}
          </button>
        )}
        
        <button onClick={clearResult} className="clear-btn">
          Temizle
        </button>
      </div>

      {isCameraActive && (
        <div className="camera-section">
          <video 
            ref={videoRef} 
            className="camera-video"
            playsInline
            muted
          />
          <p className="camera-instruction">
            QR kodu kamera görüş alanına getirin
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {result && (
        <div className="result-section">
          <h3>Taranan Sonuç:</h3>
          <div className="result-content">
            {(() => {
              try {
                const parsedData = JSON.parse(result)
                return (
                  <div className="structured-result">
                    <div className="data-grid">
                      <div className="data-item">
                        <strong>Tarih:</strong> {parsedData.tarih || 'Belirtilmemiş'}
                      </div>
                      <div className="data-item">
                        <strong>Şarj No:</strong> {parsedData.sarjNo || 'Belirtilmemiş'}
                      </div>
                      <div className="data-item">
                        <strong>İzlenebilirlik No:</strong> {parsedData.izlenebilirlikNo || 'Belirtilmemiş'}
                      </div>
                      <div className="data-item">
                        <strong>Ürün Kodu:</strong> {parsedData.urunKodu || 'Belirtilmemiş'}
                      </div>
                      {parsedData.input5 && (
                        <div className="data-item">
                          <strong>Ek Bilgi 1:</strong> {parsedData.input5}
                        </div>
                      )}
                      {parsedData.input6 && (
                        <div className="data-item">
                          <strong>Ek Bilgi 2:</strong> {parsedData.input6}
                        </div>
                      )}
                    </div>
                    <div className="raw-data">
                      <details>
                        <summary>Ham Veri</summary>
                        <p className="result-text">{result}</p>
                      </details>
                    </div>
                  </div>
                )
              } catch {
                return <p className="result-text">{result}</p>
              }
            })()}
            
            <div className="result-actions">
              <button onClick={copyToClipboard} className="copy-btn">
                Panoya Kopyala
              </button>
              
              {isUrl && (
                <button onClick={openLink} className="open-btn">
                  Bağlantıyı Aç
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRReader