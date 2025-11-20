# Google Sheets Kaydetme Sorunu Çözüm Rehberi

## 🔍 Problem: Veriler Google Sheets'e kaydedilmiyor

### ✅ Adım 1: Google Apps Script'i Kontrol Et
1. https://script.google.com/ sitesine git
2. Projenizi açın
3. Bu kodu yapıştırın ve kaydedin
4. **Deploy → New deployment** yapın
5. Type: **Web app** seçin
6. Execute as: **Me** 
7. Who has access: **Anyone** 
8. **Deploy** butonuna bas
9. URL'yi kopyala

### ✅ Adım 2: Google Sheets'i Hazırla
1. Google Sheets'i aç: https://docs.google.com/spreadsheets/d/1U0VBKhrNY2lC5GlCBodtJwEk3uUeSD95BH3hra9e7F0/edit
2. Sheet ismini **"Sayfa1"** yap (çok önemli!)
3. İlk satıra başlıklar ekle:
   - A1: Timestamp
   - B1: Tarih  
   - C1: Şarj No
   - D1: İzlenebilirlik No
   - E1: Ürün Kodu
   - F1: Açıklama 1
   - G1: Açıklama 2
   - H1: Kaynak

### ✅ Adım 3: React App'te URL'yi Güncelle
1. Settings sekmesine git
2. Google Apps Script URL'yi yapıştır
3. **Kaydet** butonuna bas
4. **Test Connection** yap
5. Status 0 = Normal (başarılı)

### ✅ Adım 4: Test Et
1. QR Generator'a git
2. QR kod oluştur
3. Console'u aç (F12)
4. "💾 Kaydetme sonucu: BAŞARI" mesajını gör
5. Google Sheets'te yeni satır kontrol et

## 🚨 Yaygın Hatalar:

### ❌ "Sheet bulunamadı" Hatası
- Sheet ismini tam olarak **"Sayfa1"** yap
- Boşluk, büyük/küçük harf kontrolü

### ❌ "Spreadsheet açılamadı" Hatası  
- Spreadsheet ID'yi kontrol et: `1U0VBKhrNY2lC5GlCBodtJwEk3uUeSD95BH3hra9e7F0`
- Google Apps Script'te SPREADSHEET_ID güncel mi?

### ❌ "Status 0" Normal!
- No-cors mode'da status 0 gelmesi normaldir
- Bu bir hata değil, başarılı istek göstergesidir

### ❌ Permission Denied
- Apps Script deployment'ta "Anyone" seçili mi?
- Execute as "Me" seçili mi?

## 🎯 Debug İpuçları:

Console'da şu mesajları gör:
```
✅ Response status: 0 (Status 0 = Normal no-cors behavior)
💾 Kaydetme sonucu: BAŞARI  
📊 Lütfen "Sayfa1" sheet'ini kontrol edin
```

Eğer hala çalışmıyorsa:
1. Browser cache temizle
2. Yeni deployment yap  
3. Sheet izinlerini kontrol et
4. Apps Script logs kontrol et