/**
 * GOOGLE APPS SCRIPT CODE - QR KOD UYGULAMASI İÇİN
 * 
 * KURULUM TALİMATLARI:
 * 1. https://script.google.com/ adresine gidin
 * 2. Yeni proje oluşturun
 * 3. Varsayılan kodu silerek bu kodu yapıştırın
 * 4. Projeyi kaydedin
 * 5. Deploy as web app:
 *    - Execute as: Me (beni)
 *    - Who has access: Anyone (herkes)
 * 6. Web app URL'ini kopyalayıp React uygulamasında kullanın
 * 
 * ÖNEMLI: 
 * - Deploy ettikten sonra mutlaka URL'yi test edin!
 * - Google Sheets'te "Sayfa1" isimli sayfa olmalı
 * - Veriler "Sayfa1" sayfasına kaydedilecek
 */

// Spreadsheet ID'nizi buraya yazın (URL'den alabilirsiniz)
const SPREADSHEET_ID = '1U0VBKhrNY2lC5GlCBodtJwEk3uUeSD95BH3hra9e7F0';

function doPost(e) {
  // Hata ayıklama için log
  console.log('=== QR APP POST İSTEĞİ ALINDI ===');
  console.log('Zaman:', new Date().toISOString());
  
  try {
    // Gelen veriyi kontrol et
    if (!e.postData || !e.postData.contents) {
      throw new Error('POST verisi bulunamadı');
    }
    
    console.log('Gelen veri:', e.postData.contents);
    
    // JSON verisini parse et
    const data = JSON.parse(e.postData.contents);
    console.log('Parse edilen veri:', JSON.stringify(data, null, 2));
    
    // Spreadsheet'i aç
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('Spreadsheet başarıyla açıldı');
    } catch (error) {
      throw new Error('Spreadsheet açılamadı. ID kontrol edin: ' + SPREADSHEET_ID);
    }
    
    // "Sayfa1" isimli sayfayı al
    let sheet;
    try {
      sheet = spreadsheet.getSheetByName('Sayfa1');
      if (!sheet) {
        throw new Error('Sayfa1 bulunamadı');
      }
      console.log('Hedef sheet: Sayfa1');
    } catch (error) {
      console.log('Sayfa1 bulunamadı, aktif sheet kullanılıyor');
      sheet = spreadsheet.getActiveSheet();
      console.log('Kullanılan sheet:', sheet.getName());
    }
    
    // Veri satırını hazırla (sütun sırası: timestamp, tarih, sarjNo, izlenebilirlikNo, urunKodu, uretimAdet, input6, source)
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,                        // A sütunu: timestamp
      data.tarih || '',                // B sütunu: tarih
      data.sarjNo || '',               // C sütunu: sarjNo
      data.izlenebilirlikNo || '',     // D sütunu: izlenebilirlikNo
      data.urunKodu || '',             // E sütunu: urunKodu
      data.uretimAdet || data.uretimAdet || '', // F sütunu: uretimAdet (eski uretimAdet uyumluluğu için)
      data.input6 || '',               // G sütunu: input6
      'QR_APP'                         // H sütunu: source
    ];
    
    console.log('Eklenecek veri:', JSON.stringify(rowData));
    
    // Veriyi sheet'e ekle
    try {
      sheet.appendRow(rowData);
      console.log('✅ Veri başarıyla eklendi!');
      console.log('Toplam satır sayısı:', sheet.getLastRow());
    } catch (error) {
      throw new Error('Veri eklenirken hata: ' + error.toString());
    }
    
    // Başarı yanıtı
    const successResponse = {
      success: true,
      message: 'Veri başarıyla Google Sheets\'e kaydedildi',
      timestamp: timestamp,
      spreadsheetId: SPREADSHEET_ID,
      sheetName: sheet.getName(),
      rowCount: sheet.getLastRow(),
      savedData: {
        tarih: data.tarih,
        sarjNo: data.sarjNo,
        izlenebilirlikNo: data.izlenebilirlikNo,
        urunKodu: data.urunKodu,
        uretimAdet: data.uretimAdet || data.uretimAdet,
        input6: data.input6
      }
    };
    
    console.log('✅ Başarı yanıtı gönderiliyor:', JSON.stringify(successResponse, null, 2));
    
    return ContentService
      .createTextOutput(JSON.stringify(successResponse))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Hata durumu
    const errorMessage = error.toString();
    console.error('❌ HATA:', errorMessage);
    console.error('❌ Stack trace:', error.stack);
    
    const errorResponse = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      debugInfo: {
        hasPostData: !!e.postData,
        hasContents: !!(e.postData && e.postData.contents),
        contentType: e.postData ? e.postData.type : 'yok',
        rawContents: e.postData ? e.postData.contents : 'yok'
      }
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  console.log('=== QR APP GET İSTEĞİ ===');
  console.log('Zaman:', new Date().toISOString());
  console.log('Parametreler:', JSON.stringify(e.parameter, null, 2));
  
  try {
    // Eğer GET parametreleri varsa, veri kaydetme işlemi yap
    if (e.parameter && (e.parameter.tarih || e.parameter.sarjNo || e.parameter.urunKodu)) {
      console.log('📊 GET parametrelerinden veri kaydediliyor...');
      
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      
      // "Sayfa1" isimli sayfayı al
      let sheet;
      try {
        sheet = spreadsheet.getSheetByName('Sayfa1');
        if (!sheet) {
          throw new Error('Sayfa1 bulunamadı');
        }
        console.log('GET - Hedef sheet: Sayfa1');
      } catch (error) {
        console.log('GET - Sayfa1 bulunamadı, aktif sheet kullanılıyor');
        sheet = spreadsheet.getActiveSheet();
        console.log('GET - Kullanılan sheet:', sheet.getName());
      }
      
      // GET parametrelerinden veri al
      const data = {
        tarih: e.parameter.tarih || '',
        sarjNo: e.parameter.sarjNo || '',
        izlenebilirlikNo: e.parameter.izlenebilirlikNo || '',
        urunKodu: e.parameter.urunKodu || '',
        uretimAdet: e.parameter.uretimAdet || e.parameter.uretimAdet || '',
        input6: e.parameter.input6 || ''
      };
      
      console.log('📋 GET\'ten alınan veri:', JSON.stringify(data, null, 2));
      
      // Veri satırını hazırla
      const timestamp = new Date().toISOString();
      const rowData = [
        timestamp,                        // timestamp
        data.tarih,                      // tarih
        data.sarjNo,                     // sarjNo
        data.izlenebilirlikNo,           // izlenebilirlikNo
        data.urunKodu,                   // urunKodu
        data.uretimAdet,                 // uretimAdet (eski uretimAdet uyumluluğu için)
        data.input6,                     // input6
        e.parameter.source || 'QR_APP_GET'  // source
      ];
      
      // Veriyi ekle
      sheet.appendRow(rowData);
      console.log('✅ GET ile veri başarıyla eklendi!');
      
      const successResponse = {
        success: true,
        message: 'GET ile veri başarıyla kaydedildi',
        timestamp: timestamp,
        method: 'GET',
        savedData: data,
        rowCount: sheet.getLastRow()
      };
      
      return ContentService
        .createTextOutput(JSON.stringify(successResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Normal GET test isteği
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // "Sayfa1" isimli sayfayı al
    let sheet;
    try {
      sheet = spreadsheet.getSheetByName('Sayfa1');
      if (!sheet) {
        throw new Error('Sayfa1 bulunamadı');
      }
      console.log('TEST - Hedef sheet: Sayfa1');
    } catch (error) {
      console.log('TEST - Sayfa1 bulunamadı, aktif sheet kullanılıyor');
      sheet = spreadsheet.getActiveSheet();
      console.log('TEST - Kullanılan sheet:', sheet.getName());
    }
    
    const testResponse = {
      success: true,
      message: '🎉 QR Kod Google Sheets entegrasyonu çalışıyor!',
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      sheetName: sheet.getName(),
      currentRowCount: sheet.getLastRow(),
      status: 'HAZIR',
      supportedMethods: ['POST (JSON)', 'GET (parameters)'],
      testInstructions: 'POST veya GET parametreleri ile veri gönderebilirsiniz'
    };
    
    console.log('✅ GET test başarılı:', JSON.stringify(testResponse, null, 2));
    
    return ContentService
      .createTextOutput(JSON.stringify(testResponse))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResponse = {
      success: false,
      error: 'GET işlem hatası: ' + error.toString(),
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      receivedParameters: e.parameter
    };
    
    console.error('❌ GET hatası:', JSON.stringify(errorResponse, null, 2));
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test fonksiyonu - Script editöründe manuel test için
function testFunction() {
  console.log('=== MANUEL TEST BAŞLADI ===');
  
  // Test verisi
  const testData = {
    tarih: '2025-11-20',
    sarjNo: 'TEST-001',
    izlenebilirlikNo: 'IZ-TEST-001',
    urunKodu: '6312011',
    uretimAdet: 'Test verisi 1',
    input6: 'Test verisi 2'
  };
  
  // Mock POST event
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
      type: 'application/json'
    }
  };
  
  // Test et
  const result = doPost(mockEvent);
  console.log('Test sonucu:', result.getContent());
}