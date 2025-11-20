// Test your Google Apps Script directly in browser console

// Copy and paste this into your browser console to test the Google Apps Script:

const testGoogleAppsScript = async () => {
  const url = 'https://script.google.com/macros/s/AKfycbxCP1Oz-tuZmufBuVgwLMSKzWxr82BQJG4QpIGKMYoYpnhXUVRb22yaOvyBK2l6JvojxQ/exec'
  
  const testData = {
    tarih: '2025-11-20',
    sarjNo: 'CONSOLE-TEST-001',
    izlenebilirlikNo: 'CONSOLE-IZ-001', 
    urunKodu: 'CONSOLE-PRODUCT',
    uretimAdet: 'Console test data',
    input6: 'Direct browser test'
  }
  
  try {
    console.log('Sending test data:', testData)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    const result = await response.text()
    console.log('Response text:', result)
    
    try {
      const jsonResult = JSON.parse(result)
      console.log('Parsed JSON:', jsonResult)
      
      if (jsonResult.success) {
        console.log('✅ SUCCESS: Data was saved to Google Sheets!')
        console.log('Check your Google Sheets now!')
      } else {
        console.log('❌ ERROR:', jsonResult.error)
      }
    } catch (e) {
      console.log('Response is not JSON, raw response:', result)
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error)
    console.log('This might be a CORS issue, but the data might still be saved.')
    console.log('Check your Google Sheets to see if the test data appeared.')
  }
}

// Run the test
console.log('Testing Google Apps Script connection...')
testGoogleAppsScript()