import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { saveToGoogleSheets, type QRData } from '../services/googleSheets'

const QRGenerator = () => {
  // İzlenebilirlik numarası oluşturma fonksiyonu
  const generateTrackingNumber = (lastDigit: string = '1') => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2) // Yılın son 2 hanesi
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) // Yılın günü
    const hour = now.getHours()
    
    // Vardiya belirleme: 00:00-08:00 = A, 08:00-16:00 = B, 16:00-24:00 = C
    let shift = 'A'
    if (hour >= 8 && hour < 16) shift = 'B'
    else if (hour >= 16) shift = 'C'
    
    return `${dayOfYear.toString().padStart(3, '0')}${year}${shift}${lastDigit}`
  }

  // Şarj numarası oluşturma fonksiyonu
  const generateBatchNumber = (year: string, afChoice: string, dayOfYear: string, letterChoice: string) => {
    return `${year}${afChoice}${dayOfYear.padStart(3, '0')}${letterChoice}`
  }

  const [userDigit, setUserDigit] = useState('1')

  // Çoklu şarj numarası sistemi
  interface BatchNumber {
    id: string
    year: string
    af: string
    day: string
    letter: string
    quantity: string // Üretim adeti
  }

  const [batchNumbers, setBatchNumbers] = useState<BatchNumber[]>([
    { id: '1', year: new Date().getFullYear().toString().slice(-2), af: 'F', day: Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)).toString(), letter: 'A', quantity: '10' },
    { id: '2', year: new Date().getFullYear().toString().slice(-2), af: 'F', day: Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)).toString(), letter: 'B', quantity: '15' },
    { id: '3', year: new Date().getFullYear().toString().slice(-2), af: 'F', day: Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)).toString(), letter: 'C', quantity: '20' }
  ])
  const [qrData, setQrData] = useState<QRData>({
    tarih: '', // Sunucudan gelecek
    sarjNo: '', // Şimdi çoklu olacak
    izlenebilirlikNo: generateTrackingNumber('1'),
    urunKodu: '6312011',
    uretimAdet: 'Kalite kontrol onaylandı.\nÜretim standardına uygun.\nAmbalajlama tamamlandı.',
    input6: 'Ek bilgiler ve notlar burada yer alır...'
  })

  // Şarj numarası fonksiyonları
  const addBatchNumber = () => {
    const newId = (batchNumbers.length + 1).toString()
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const day = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)).toString()
    
    setBatchNumbers(prev => [...prev, {
      id: newId,
      year: year,
      af: 'F',
      day: day,
      letter: 'A',
      quantity: '1'
    }])
  }

  const removeBatchNumber = (id: string) => {
    if (batchNumbers.length > 1) {
      setBatchNumbers(prev => prev.filter(batch => batch.id !== id))
    }
  }

  const updateBatchNumber = (id: string, field: keyof BatchNumber, value: string) => {
    setBatchNumbers(prev => 
      prev.map(batch => 
        batch.id === id ? { ...batch, [field]: value } : batch
      )
    )
  }

  // Tarih sunucudan çek
  useEffect(() => {
    const fetchServerDate = () => {
      const serverDate = new Date().toISOString().split('T')[0]
      setQrData(prev => ({ ...prev, tarih: serverDate }))
    }
    
    fetchServerDate()
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchServerDate, 30000)
    return () => clearInterval(interval)
  }, [])

  // Kullanıcı digit değiştiğinde izlenebilirlik numarasını güncelle
  useEffect(() => {
    // userDigit'in geçerli olduğundan emin ol
    const validDigit = userDigit === '' ? '1' : userDigit
    console.log('Updating tracking number with digit:', validDigit)
    
    setQrData(prev => ({ 
      ...prev, 
      izlenebilirlikNo: generateTrackingNumber(validDigit) 
    }))
  }, [userDigit])
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
        // Combine all data into a structured format including all batch numbers
        const batchNumbersString = batchNumbers.map(batch => 
          generateBatchNumber(batch.year, batch.af, batch.day, batch.letter)
        ).join(', ')
        
        const qrDataObject = {
          tarih: qrData.tarih,
          sarjNos: batchNumbersString, // Çoklu şarj numaraları
          izlenebilirlikNo: qrData.izlenebilirlikNo,
          urunKodu: qrData.urunKodu,
          uretimAdet: qrData.uretimAdet,
          input6: qrData.input6
        }
        
        // QR kod için direkt link oluştur (kullanıcı QR okuttuğunda siteye yönlensin)
        const baseUrl = 'https://rqdeneme-qcz2.vercel.app/'
        const encodedData = encodeURIComponent(JSON.stringify(qrDataObject))
        const qrUrl = `${baseUrl}/?qr=${encodedData}`
        
        console.log('🔗 QR kod URL\'si:', qrUrl)
        console.log('📦 QR kod verisi:', JSON.stringify(qrDataObject, null, 2))
        
        await QRCode.toCanvas(canvas, qrUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        const dataUrl = canvas.toDataURL()
        setQrCodeUrl(dataUrl)
        
        // QR kodu hemen göster, Google Sheets kaydetme işlemini arka planda yap
        console.log('✅ QR kod oluşturuldu, Google Sheets kaydetme işlemi arka planda devam ediyor...')
        setIsSaving(true)
        
        // Google Sheets kaydetme işlemini asenkron olarak arka planda yap
        setTimeout(async () => {
          try {
            console.log('💾 Google Sheets\'e kaydetmeye başlıyor...')
            let allSaveSuccess = true
            
            // Tüm batch'leri paralel olarak kaydet (daha hızlı)
            const savePromises = batchNumbers.map(async (batch) => {
              const batchData = {
                ...qrData,
                sarjNo: generateBatchNumber(batch.year, batch.af, batch.day, batch.letter),
                uretimAdet: `${batch.quantity} adet`
              }
              
              console.log('📦 Google Sheets\'e gönderilecek veri:', batchData.sarjNo)
              return await saveToGoogleSheets(batchData)
            })
            
            const results = await Promise.all(savePromises)
            allSaveSuccess = results.every(result => result)
            
            console.log('💾 Kaydetme sonucu:', allSaveSuccess ? 'BAŞARI' : 'HATA')
            setSaveStatus(allSaveSuccess ? 'success' : 'error')
            setIsSaving(false)
            
            if (allSaveSuccess) {
              console.log('✅ Tüm şarj numaraları Google Sheets\'e kaydedildi!')
              console.log(`📊 ${batchNumbers.length} adet şarj numarası kaydedildi`)
            }
          } catch (error) {
            console.error('Google Sheets kaydetme hatası:', error)
            setSaveStatus('error')
            setIsSaving(false)
          }
        }, 100) // QR kod gösterildikten 100ms sonra kaydetme işlemini başlat
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

  const printQRCode = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Kod Yazdırma</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  font-family: Arial, sans-serif;
                }
                .print-container {
                  text-align: center;
                  max-width: 600px;
                }
                .qr-image {
                  max-width: 300px;
                  height: auto;
                  border: 2px solid #000;
                  margin: 20px 0;
                }
                .info {
                  margin: 10px 0;
                  font-size: 14px;
                }
                .batch-info {
                  background: #f5f5f5;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <h2>QR Kod Çıktısı</h2>
                <div class="info"><strong>Tarih:</strong> ${qrData.tarih}</div>
                <div class="info"><strong>Ürün Kodu:</strong> ${qrData.urunKodu}</div>
                <div class="info"><strong>İzlenebilirlik No:</strong> ${qrData.izlenebilirlikNo}</div>
                
                <img src="${qrCodeUrl}" alt="QR Kod" class="qr-image" />
                
                <div class="batch-info">
                  <h3>Şarj Numaraları</h3>
                  ${batchNumbers.map(batch => `
                    <div><strong>${generateBatchNumber(batch.year, batch.af, batch.day, batch.letter)}</strong> - ${batch.quantity} adet</div>
                  `).join('')}
                </div>
                
                <div class="info">
                  <strong>Açıklama:</strong><br>
                  ${qrData.input6.replace(/\n/g, '<br>')}
                </div>
                
                <div class="info" style="margin-top: 30px; font-size: 12px; color: #666;">
                  Yazdırma Tarihi: ${new Date().toLocaleString('tr-TR')}
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
  }

  const printLabel = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        // Şarj numarası sayısına göre yazı boyutunu hesapla
        const batchCount = batchNumbers.length
        let trackingFontSize = '18px'
        let batchFontSize = '13px'
        
        if (batchCount >= 5) {
          trackingFontSize = '14px'
          batchFontSize = '10px'
        } else if (batchCount >= 3) {
          trackingFontSize = '16px'
          batchFontSize = '11px'
        }
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Etiket Yazdırma</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background: white;
                }
                .label {
                  width: 8cm;
                  height: 6cm;
                  border: 1px solid #000;
                  display: flex;
                  padding: 0.5cm;
                  box-sizing: border-box;
                  page-break-after: always;
                  background: white;
                }
                .left-section {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: flex-start;
                  padding-right: 0.5cm;
                }
                .right-section {
                  width: 3.5cm;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .tracking-number {
                  font-size: ${trackingFontSize};
                  font-weight: bold;
                  text-align: left;
                  margin-bottom: 0.4cm;
                  word-break: break-all;
                  line-height: 1.2;
                  width: 100%;
                }
                .batch-list {
                  font-size: ${batchFontSize};
                  text-align: left;
                  line-height: 1.4;
                  width: 100%;
                }
                .batch-item {
                  margin: 0.15cm 0;
                  font-weight: 600;
                }
                .qr-code {
                  width: 3.2cm;
                  height: 3.2cm;
                  border: 1px solid #ccc;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .label { margin: 0; }
                }
                @page {
                  size: 8cm 6cm;
                  margin: 0;
                }
              </style>
            </head>
            <body>
              <div class="label">
                <div class="left-section">
                  <div class="tracking-number">
                    ${qrData.izlenebilirlikNo}
                  </div>
                  <div class="batch-list">
                    ${batchNumbers.map(batch => `
                      <div class="batch-item">${generateBatchNumber(batch.year, batch.af, batch.day, batch.letter)} - ${batch.quantity}ad</div>
                    `).join('')}
                  </div>
                </div>
                <div class="right-section">
                  <img src="${qrCodeUrl}" alt="QR" class="qr-code" />
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
  }

  const clearQRCode = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const day = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)).toString()
    
    setBatchNumbers([
      { id: '1', year: year, af: 'F', day: day, letter: 'A', quantity: '10' },
      { id: '2', year: year, af: 'F', day: day, letter: 'B', quantity: '15' },
      { id: '3', year: year, af: 'F', day: day, letter: 'C', quantity: '20' }
    ])
    setUserDigit('1')
    setQrData({
      tarih: new Date().toISOString().split('T')[0], // Bugünün tarihi
      sarjNo: '',
      izlenebilirlikNo: generateTrackingNumber('1'),
      urunKodu: '6312011',
      uretimAdet: 'Kalite kontrol onaylandı.\nÜretim standardına uygun.\nAmbalajlama tamamlandı.',
      input6: 'Ek bilgiler ve notlar burada yer alır...'
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
        {/* Üst Satır: Ürün Kodu ve İzlenebilirlik No */}
        <div className="top-row">
          <div className="input-group">
            <label htmlFor="urunKodu">Ürün Kodu</label>
            <input
              id="urunKodu"
              type="text"
              value={qrData.urunKodu}
              onChange={(e) => handleInputChange('urunKodu', e.target.value)}
              placeholder="Ürün kodunu girin"
              className="form-input"
              tabIndex={1}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="izlenebilirlikNo">İzlenebilirlik No</label>
            <div className="tracking-input-container">
              <input
                type="text"
                value={qrData.izlenebilirlikNo.slice(0, -1)}
                readOnly
                className="tracking-prefix"
              />
              <input
                id="userDigit"
                type="text"
                value={userDigit}
                onChange={(e) => {
                  const value = e.target.value.slice(-1)
                  if (/^[0-9]$/.test(value) || value === '') {
                    setUserDigit(value)
                  }
                }}
                placeholder="0"
                maxLength={1}
                className="tracking-suffix"
              />
            </div>
            <div className="tracking-info">
              <small>🕐 Otomatik: {qrData.izlenebilirlikNo.slice(0, 3)} (Gün) + {qrData.izlenebilirlikNo.slice(3, 5)} (Yıl) + {qrData.izlenebilirlikNo.slice(5, 6)} (Vardiya) | 👤 Sizin: Son hane</small>
            </div>
          </div>
        </div>
        
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="tarih">Tarih (Sunucu)</label>
            <input
              id="tarih"
              type="date"
              value={qrData.tarih}
              readOnly
              className="form-input server-date"
              title="Sunucudan otomatik çekilir"
              tabIndex={2}
            />
          </div>
          
          <div className="input-group multi-batch-group">
            <div className="batch-header">
              <label>Şarj Numaraları & Üretim Adetleri</label>
            </div>
            
            <div className="batch-list">
              {batchNumbers.map((batch, index) => (
                <div key={batch.id} className="batch-item">
                  <div className="batch-controls">
                    <div className="batch-number-container">
                      <input
                        type="text"
                        value={batch.year}
                        onChange={(e) => {
                          const value = e.target.value.slice(-2)
                          if (/^\d{0,2}$/.test(value)) {
                            updateBatchNumber(batch.id, 'year', value)
                          }
                        }}
                        placeholder="25"
                        maxLength={2}
                        className="batch-segment year-segment"
                        title="Yıl (2 hane)"
                        tabIndex={100 + index * 10 + 1}
                      />
                      <select
                        value={batch.af}
                        onChange={(e) => updateBatchNumber(batch.id, 'af', e.target.value)}
                        className="batch-segment af-segment"
                        tabIndex={100 + index * 10 + 2}
                      >
                        <option value="A">A</option>
                        <option value="F">F</option>
                      </select>
                      <input
                        type="text"
                        value={batch.day}
                        onChange={(e) => {
                          const value = e.target.value.slice(-3)
                          if (/^\d{0,3}$/.test(value) && parseInt(value || '0') <= 366) {
                            updateBatchNumber(batch.id, 'day', value)
                          }
                        }}
                        placeholder="324"
                        maxLength={3}
                        className="batch-segment day-segment"
                        title="Gün sayısı (1-366)"
                        tabIndex={100 + index * 10 + 3}
                      />
                      <select
                        value={batch.letter}
                        onChange={(e) => updateBatchNumber(batch.id, 'letter', e.target.value)}
                        className="batch-segment letter-segment"
                        tabIndex={100 + index * 10 + 4}
                      >
                        {Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                          <option key={letter} value={letter}>{letter}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="quantity-container">
                      <label htmlFor={`quantity-${batch.id}`} className="quantity-label-responsive">
                        <span className="desktop-label">Üretim Adeti</span>
                        <span className="mobile-label">Paket Adeti</span>
                      </label>
                      <input
                        id={`quantity-${batch.id}`}
                        type="number"
                        value={batch.quantity}
                        onChange={(e) => {
                          const value = e.target.value
                          const numValue = parseInt(value)
                          if (value === '' || (numValue >= 1 && numValue <= 30)) {
                            updateBatchNumber(batch.id, 'quantity', value)
                          }
                        }}
                        placeholder="Adet (1-30)"
                        min="1"
                        max="30"
                        className="form-input quantity-input"
                        title="Üretim adeti (1-30 arası)"
                        tabIndex={100 + index * 10 + 5}
                      />
                    </div>
                  </div>
                  
                  <div className="batch-actions">
                    <span className="batch-result">
                      {generateBatchNumber(batch.year, batch.af, batch.day, batch.letter)} ({batch.quantity} adet)
                      {batchNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBatchNumber(batch.id)}
                          className="remove-batch-btn"
                          title="Bu şarj numarasını sil"
                          tabIndex={100 + index * 10 + 6}
                        >
                          × SİL
                        </button>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="batch-add-section">
              <button 
                type="button" 
                onClick={addBatchNumber}
                className="add-batch-btn"
                title="Yeni şarj numarası ekle"
                tabIndex={200}
              >
                + Yeni Şarj Numarası Ekle
              </button>
            </div>
            
            <div className="batch-digit-container">
              <label htmlFor="userDigitSarj">İzlenebilirlik Son Hanesi</label>
              <input
                id="userDigitSarj"
                type="text"
                value={userDigit}
                onChange={(e) => {
                  const inputValue = e.target.value
                  console.log('Input value:', inputValue, 'Length:', inputValue.length)
                  
                  if (inputValue === '') {
                    setUserDigit('')
                  } else {
                    // Sadece son karakteri al ve sadece rakam ise kabul et
                    const lastChar = inputValue.slice(-1)
                    if (/^[0-9]$/.test(lastChar)) {
                      setUserDigit(lastChar)
                    }
                  }
                }}
                onInput={(e) => {
                  // Input event'inde de kontrol et
                  const target = e.target as HTMLInputElement
                  const value = target.value
                  if (value.length > 1) {
                    target.value = value.slice(-1)
                  }
                }}
                onKeyDown={(e) => {
                  // Harf ve özel karakterleri engelle
                  if (!/[0-9]/.test(e.key) && 
                      !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                placeholder="0"
                maxLength={1}
                className="form-input digit-input-sarj"
                title="İzlenebilirlik No son hanesi (0-9)"
                tabIndex={200}
              />
            </div>
          </div>
          
          <div className="input-group description-group">
            <label htmlFor="input6">Üretim Bilgileri & Açıklama</label>
            <textarea
              id="input6"
              value={qrData.input6 === 'Ek bilgiler ve notlar burada yer alır...' ? '' : qrData.input6}
              onChange={(e) => handleInputChange('input6', e.target.value)}
              placeholder="Ek bilgiler ve notlar burada yer alır..."
              className="form-textarea"
              rows={4}
              tabIndex={210}
            />
          </div>
        </div>
        
        <div className="button-group">
          <button 
            onClick={generateQRCode} 
            disabled={!hasData || isGenerating || isSaving}
            className="generate-btn"
            tabIndex={220}
          >
            {isGenerating ? 'QR Kod Oluşturuluyor...' : isSaving ? 'Kaydediliyor...' : 'QR Kod Oluştur & Kaydet'}
          </button>
          
          <button 
            onClick={clearQRCode}
            className="clear-btn"
            tabIndex={230}
          >
            Yeni Veriler Oluştur
          </button>
        </div>
        
        {saveStatus === 'success' && (
          <div className="save-status success">
            ✅ Veriler Google Sheets'e gönderildi! Lütfen Google Sheets'inizi kontrol edin.
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
          style={{ display: qrCodeUrl && !isGenerating && !isSaving ? 'block' : 'none' }}
          className="qr-canvas"
        />
        
        {qrCodeUrl && !isGenerating && !isSaving && (
          <div className="download-section">
            <button onClick={downloadQRCode} className="download-btn" tabIndex={240}>
              📥 İndir
            </button>
            <button onClick={printQRCode} className="print-btn" tabIndex={250}>
              🖨️ Yazdır (A4)
            </button>
            <button onClick={printLabel} className="print-label-btn" tabIndex={260}>
              🏷️ Etiket Yazdır
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRGenerator