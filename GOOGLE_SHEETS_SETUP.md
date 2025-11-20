# Google Sheets Integration Setup Guide

## 🚨 **Why the Google Sheets is Empty**

Currently, the application is saving data to **localStorage** (browser storage) instead of Google Sheets because we need to set up Google Apps Script first. Here's how to fix it:

## ✅ **Quick Setup (5 minutes) - Google Apps Script Method**

### Step 1: Create Google Apps Script

1. **Go to Google Apps Script**: [https://script.google.com/](https://script.google.com/)
2. **Click "New Project"**
3. **Delete the default code** and copy-paste the code from `google-apps-script.js` file in this project
4. **Save the project** (give it a name like "QR Code Sheets Integration")

### Step 2: Deploy the Script

1. **Click "Deploy" → "New deployment"**
2. **Choose type**: Select "Web app"
3. **Configuration**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. **Click "Deploy"**
5. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 3: Update the React App

1. **Open** `src/services/googleSheets.ts`
2. **Replace this line**:
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
   ```
   **With your actual URL**:
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec'
   ```
3. **Save the file**

### Step 4: Test the Integration

1. **Restart your React app** (Ctrl+C and then `npm run dev`)
2. **Fill the QR form** and click "QR Kod Oluştur & Kaydet"
3. **Check your Google Sheets** - data should appear!

## 📊 **Your Google Sheets Structure**

Your spreadsheet columns (matching your existing headers):
- **Column A**: timestamp (Auto-generated timestamp)
- **Column B**: tarih (Date from form)
- **Column C**: sarjNo (Batch number from form)
- **Column D**: izlenebilirlikNo (Traceability number from form)
- **Column E**: urunKodu (Product code from form)
- **Column F**: uretimAdet (Additional info 1 from form)
- **Column G**: input6 (Additional info 2 from form)
- **Column H**: source (Always "QR_APP" to identify data source)

The script will append data to your existing spreadsheet without modifying the headers.

## 🔧 **Troubleshooting**

**If it still doesn't work:**

1. **Check Browser Console**: Open Developer Tools (F12) and look for error messages
2. **Test the Script**: Visit your Google Apps Script URL directly in browser - you should see a JSON response
3. **Check Permissions**: Make sure the Google Apps Script has permission to access your spreadsheet
4. **Verify Spreadsheet ID**: Ensure the ID in the script matches your sheet: `1U0VBKhrNY2lC5GlCBodtJwEk3uUeSD95BH3hra9e7F0`

## 📱 **Current Status**

**✅ What works now:**
- ✅ QR code generation with all data
- ✅ Data viewer shows all saved records  
- ✅ Local storage as backup
- ❌ Google Sheets integration (needs setup above)

**✅ After setup:**
- ✅ Data saves to Google Sheets automatically
- ✅ Local storage as backup
- ✅ Real-time data synchronization

## 🎯 **Alternative: Manual Data Export**

If you want to quickly get the data to Google Sheets without setting up the script:

1. Go to the "Kayıtlı Veriler" tab in your app
2. Copy the data manually
3. Paste it into your Google Sheets

The data is currently stored in your browser and will be visible in the "Kayıtlı Veriler" tab.