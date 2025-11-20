import { useMemo } from 'react'

interface QRDisplayProps {
  qrData?: string
}

interface ParsedQRData {
  tarih?: string
  sarjNo?: string
  sarjNos?: string
  izlenebilirlikNo?: string
  urunKodu?: string
  uretimAdet?: string
  input6?: string
  [key: string]: string | undefined
}

const QRDisplay = ({ qrData }: QRDisplayProps) => {
  // URL parametrelerinden veya props'tan QR kodunu al
  const { result, error } = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const qrFromUrl = urlParams.get('qr') || urlParams.get('data')
    
    if (qrFromUrl) {
      try {
        const decoded = decodeURIComponent(qrFromUrl)
        console.log('🔗 URL\'den QR verisi alındı:', decoded)
        return { result: decoded, error: '' }
      } catch {
        return { result: '', error: 'URL\'deki QR verisi decode edilemedi' }
      }
    } else if (qrData) {
      return { result: qrData, error: '' }
    }
    return { result: '', error: '' }
  }, [qrData])

  // JSON parse et
  const parsedData = useMemo((): ParsedQRData | null => {
    if (!result) return null
    
    try {
      const parsed = JSON.parse(result)
      return parsed
    } catch {
      console.log('JSON parse edilemedi, düz metin olarak gösterilecek')
      return null
    }
  }, [result])

  const downloadData = () => {
    if (!result) return
    
    const blob = new Blob([result], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    if (!result) return
    
    try {
      await navigator.clipboard.writeText(result)
      alert('📋 Veriler panoya kopyalandı!')
    } catch (err) {
      console.error('Kopyalama hatası:', err)
      alert('❌ Kopyalama işlemi başarısız oldu')
    }
  }

  const printData = () => {
    if (!result) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Kod Verileri</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              .data-section {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .data-label {
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
              }
              .data-value {
                background: #f5f5f5;
                padding: 10px;
                border-radius: 3px;
                font-family: monospace;
                white-space: pre-wrap;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #666;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>QR Kod Verileri</h1>
                <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
              </div>
              
              ${parsedData ? `
                <div class="data-section">
                  <div class="data-label">📅 Tarih:</div>
                  <div class="data-value">${parsedData.tarih || 'Belirtilmemiş'}</div>
                </div>
                
                <div class="data-section">
                  <div class="data-label">📦 Şarj Numarası:</div>
                  <div class="data-value">${parsedData.sarjNo || parsedData.sarjNos || 'Belirtilmemiş'}</div>
                </div>
                
                <div class="data-section">
                  <div class="data-label">🔍 İzlenebilirlik No:</div>
                  <div class="data-value">${parsedData.izlenebilirlikNo || 'Belirtilmemiş'}</div>
                </div>
                
                <div class="data-section">
                  <div class="data-label">🏷️ Ürün Kodu:</div>
                  <div class="data-value">${parsedData.urunKodu || 'Belirtilmemiş'}</div>
                </div>
                
                ${parsedData.uretimAdet ? `
                  <div class="data-section">
                    <div class="data-label">📊 Üretim Bilgisi:</div>
                    <div class="data-value">${parsedData.uretimAdet}</div>
                  </div>
                ` : ''}
                
                ${parsedData.input6 ? `
                  <div class="data-section">
                    <div class="data-label">📝 Ek Bilgiler:</div>
                    <div class="data-value">${parsedData.input6}</div>
                  </div>
                ` : ''}
              ` : `
                <div class="data-section">
                  <div class="data-label">Ham Veri:</div>
                  <div class="data-value">${result}</div>
                </div>
              `}
              
              <div class="footer">
                <p>QR Kod Yönetim Sistemi - ${window.location.origin}</p>
              </div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  if (error) {
    return (
      <div className="qr-display error">
        <h2>❌ Hata</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'} className="back-btn">
          🏠 Ana Sayfaya Dön
        </button>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="qr-display empty">
        <h2>📱 QR Kod Verisi Bulunamadı</h2>
        <p>Bu sayfaya QR kod verisi ile erişmelisiniz.</p>
        <p><strong>Örnek kullanım:</strong></p>
        <code>https://rqdeneme-qcz2-fqzxuetjd-arifks-projects.vercel.app/?qr=YOUR_QR_DATA</code>
        <br /><br />
        <p><strong>Nasıl kullanılır:</strong></p>
        <ol style={{textAlign: 'left', maxWidth: '500px', margin: '1rem auto'}}>
          <li>QR kod oluşturun ve kaydedin</li>
          <li>Telefon kamerası ile QR kodu okutun</li>
          <li>Otomatik olarak bu sayfaya yönlendirileceksiniz</li>
          <li>QR kod verileri detaylı şekilde görüntülenecek</li>
        </ol>
        <button onClick={() => window.location.href = '/'} className="back-btn">
          🏠 Ana Sayfaya Dön
        </button>
      </div>
    )
  }

  return (
    <div className="qr-display">
      <h2>📱 QR Kod Verileri</h2>
      
      {parsedData ? (
        <div className="structured-result">
          <div className="qr-preview">
            <h4>📱 QR Kod İçeriği</h4>
            <div className="json-display">
              <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            </div>
          </div>
          
          <div className="data-grid">
            <div className="data-item">
              <strong>📅 Tarih:</strong> {parsedData.tarih || 'Belirtilmemiş'}
            </div>
            <div className="data-item">
              <strong>📦 Şarj No(ları):</strong> {parsedData.sarjNo || parsedData.sarjNos || 'Belirtilmemiş'}
            </div>
            <div className="data-item">
              <strong>🔍 İzlenebilirlik No:</strong> {parsedData.izlenebilirlikNo || 'Belirtilmemiş'}
            </div>
            <div className="data-item">
              <strong>🏷️ Ürün Kodu:</strong> {parsedData.urunKodu || 'Belirtilmemiş'}
            </div>
            {parsedData.uretimAdet && (
              <div className="data-item">
                <strong>📊 Üretim Bilgisi:</strong> 
                <div className="multiline-text">{parsedData.uretimAdet}</div>
              </div>
            )}
            {parsedData.input6 && (
              <div className="data-item">
                <strong>📝 Ek Bilgiler:</strong> 
                <div className="multiline-text">{parsedData.input6}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="plain-result">
          <h4>📄 Ham Veri</h4>
          <div className="result-text">{result}</div>
        </div>
      )}
      
      <div className="action-buttons">
        <button onClick={copyToClipboard} className="copy-btn">
          📋 Kopyala
        </button>
        <button onClick={downloadData} className="download-btn">
          📥 İndir
        </button>
        <button onClick={printData} className="print-btn">
          🖨️ Yazdır
        </button>
        <button onClick={() => window.location.href = '/'} className="back-btn">
          🏠 Ana Sayfa
        </button>
      </div>
    </div>
  )
}

export default QRDisplay