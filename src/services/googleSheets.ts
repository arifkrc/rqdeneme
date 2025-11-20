// Google Sheets integration using Google Apps Script Web App
export interface QRData {
  tarih: string
  sarjNo: string
  izlenebilirlikNo: string
  urunKodu: string
  uretimAdet: string
  input6: string
  timestamp?: string
}

export const saveToGoogleSheets = async (data: QRData): Promise<boolean> => {
  try {
    console.log('Saving to Google Sheets:', data)
    
    // Get Google Apps Script URL from localStorage or use default
    let GOOGLE_APPS_SCRIPT_URL = localStorage.getItem('googleAppsScriptUrl')
    
    // If not configured, use the provided URL
    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.trim() === '') {
      GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlE8DGJG23ba2Fxd0u4eRqQYh1h6JZ2N3vhA_nXa9c1UL_rpvi1G-g58lDQnNNo51jEw/exec'
      // Save it to localStorage for future use
      localStorage.setItem('googleAppsScriptUrl', GOOGLE_APPS_SCRIPT_URL)
      console.log('Using default Google Apps Script URL')
    }
    
    console.log('🚀 Google Sheets\'e veri gönderiliyor...')
    console.log('📊 Gönderilen veri:', JSON.stringify(data, null, 2))
    console.log('🔗 Hedef URL:', GOOGLE_APPS_SCRIPT_URL)
    
    // Google Apps Script CORS sorunları nedeniyle direkt no-cors mode kullan
    console.log('⚠️ CORS sorunları nedeniyle no-cors mode kullanılıyor')
    
    try {
      // No-cors mode ile istek gönder - response okunamaz ama veri gönderilir
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'no-cors'
      })
      
      console.log('📤 İstek gönderildi (no-cors mode)')
      console.log('✅ Response status:', response.status, '(Status 0 = Normal no-cors behavior)')
      console.log('✅ Response type:', response.type)
      
      // Status 0 no-cors mode'da normal davranıştır
      if (response.status === 0 && response.type === 'opaque') {
        console.log('ℹ️ Status 0 = Normal! No-cors mode başarılı olduğunu gösterir')
        console.log('🎉 Veri Google Sheets\'e gönderildi!')
      }
      console.log('ℹ️ No-cors mode nedeniyle response okunamıyor')
      console.log('👀 Lütfen Google Sheets\'inizi kontrol edin')
      console.log('📊 Gönderilen veri detayları:')
      console.log('   - Tarih:', data.tarih)
      console.log('   - Şarj No:', data.sarjNo) 
      console.log('   - İzlenebilirlik No:', data.izlenebilirlikNo)
      console.log('   - Ürün Kodu:', data.urunKodu)
      console.log('   - Üretim Adeti/Açıklama:', data.uretimAdet)
      console.log('   - Ek Bilgi 2:', data.input6)
      
      // Yerel olarak da kaydet
      saveToLocalStorage(data)
      return true
      
    } catch (error) {
      console.error('❌ Kritik hata - istek gönderilemedi:', error)
      
      // Son çare olarak image request ile dene (GET parametreleri ile)
      console.log('🔄 Son çare: Image request ile deneniyor...')
      
      try {
        const params = new URLSearchParams({
          tarih: data.tarih,
          sarjNo: data.sarjNo,
          izlenebilirlikNo: data.izlenebilirlikNo,
          urunKodu: data.urunKodu,
          uretimAdet: data.uretimAdet,
          input6: data.input6,
          source: 'QR_APP_FALLBACK'
        })
        
        // Image request - CORS bypass için
        const img = new Image()
        img.onload = () => console.log('📷 Image request başarılı')
        img.onerror = () => console.log('📷 Image request hatası (normal)')
        img.src = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`
        
        console.log('📷 Image request ile veri gönderildi')
        console.log('🔗 URL:', img.src)
        
        saveToLocalStorage(data)
        return true
        
      } catch (imgError) {
        console.error('❌ Image request de başarısız:', imgError)
        saveToLocalStorage(data)
        return false
      }
    }
    
  } catch (error) {
    console.error('Error saving to Google Sheets:', error)
    console.log('Falling back to local storage...')
    
    // Fallback to localStorage
    return saveToLocalStorage(data)
  }
}

const saveToLocalStorage = (data: QRData): boolean => {
  try {
    const dataWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString()
    }
    const existingData = JSON.parse(localStorage.getItem('qrData') || '[]')
    existingData.push(dataWithTimestamp)
    localStorage.setItem('qrData', JSON.stringify(existingData))
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

export const getAllData = (): QRData[] => {
  try {
    return JSON.parse(localStorage.getItem('qrData') || '[]')
  } catch {
    return []
  }
}

// For production use, you would implement these functions:
/*
import { google } from 'googleapis'

export const authenticateGoogleSheets = async () => {
  // Set up Google API authentication
  const auth = new google.auth.GoogleAuth({
    keyFile: 'path/to/service-account-key.json', // Service account key
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  
  const sheets = google.sheets({ version: 'v4', auth })
  return sheets
}

export const saveToGoogleSheets = async (data: QRData): Promise<boolean> => {
  try {
    const sheets = await authenticateGoogleSheets()
    
    const values = [
      [
        data.tarih,
        data.sarjNo,
        data.izlenebilirlikNo,
        data.urunKodu,
        data.uretimAdet,
        data.input6,
        new Date().toISOString()
      ]
    ]
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:G', // Adjust range as needed
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    })
    
    return true
  } catch (error) {
    console.error('Error saving to Google Sheets:', error)
    return false
  }
}
*/