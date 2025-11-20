import { useState, useEffect } from 'react'
import { getAllData, type QRData } from '../services/googleSheets'

const DataViewer = () => {
  const [data, setData] = useState<QRData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = getAllData()
        setData(savedData.reverse()) // Show newest first
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const clearAllData = () => {
    if (confirm('Tüm kayıtlı verileri silmek istediğinizden emin misiniz?')) {
      localStorage.removeItem('qrData')
      setData([])
    }
  }

  if (loading) {
    return <div className="data-viewer loading">Veriler yükleniyor...</div>
  }

  return (
    <div className="data-viewer">
      <div className="data-viewer-header">
        <h2>Kayıtlı Veriler ({data.length})</h2>
        {data.length > 0 && (
          <button onClick={clearAllData} className="clear-all-btn">
            Tüm Verileri Sil
          </button>
        )}
      </div>
      
      {data.length === 0 ? (
        <div className="no-data">
          <p>Henüz kayıtlı veri bulunmuyor.</p>
          <p>QR kod oluşturduğunuzda veriler burada görünecektir.</p>
        </div>
      ) : (
        <div className="data-table">
          <div className="table-header">
            <div className="table-cell">Kayıt Zamanı</div>
            <div className="table-cell">Tarih</div>
            <div className="table-cell">Şarj No</div>
            <div className="table-cell">İzlenebilirlik No</div>
            <div className="table-cell">Ürün Kodu</div>
            <div className="table-cell">Ek Bilgi 1</div>
            <div className="table-cell">Ek Bilgi 2</div>
            <div className="table-cell">Kaynak</div>
          </div>
          
          {data.map((item, index) => (
            <div key={index} className="table-row">
              <div className="table-cell">
                {item.timestamp ? new Date(item.timestamp).toLocaleString('tr-TR') : 'Bilinmiyor'}
              </div>
              <div className="table-cell">{item.tarih || 'Belirtilmemiş'}</div>
              <div className="table-cell">{item.sarjNo || 'Belirtilmemiş'}</div>
              <div className="table-cell">{item.izlenebilirlikNo || 'Belirtilmemiş'}</div>
              <div className="table-cell">{item.urunKodu || 'Belirtilmemiş'}</div>
              <div className="table-cell">{item.input5 || 'Belirtilmemiş'}</div>
              <div className="table-cell">{item.input6 || 'Belirtilmemiş'}</div>
              <div className="table-cell">QR_APP</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataViewer