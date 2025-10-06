# Local Testing Guide - WhatsApp Integration

## 🚨 Issues Fixed

1. ✅ **BACKEND_URL added** to `.env` file
2. ✅ **Backend server restarted** with new config
3. ✅ **CSP cache busted** (version bumped to 15.0)

---

## 🧪 Testing Steps (DO THIS NOW)

### Step 1: Hard Refresh Your Browser
**IMPORTANT: Clear the cached CSP policy**

- **Mac**: Press `Cmd + Shift + R`
- **Windows**: Press `Ctrl + Shift + R`
- **Or**: Right-click → "Inspect" → Right-click refresh button → "Empty Cache and Hard Reload"

This will:
- ✅ Fix the 51 image loading errors
- ✅ Load the correct CSP policy
- ✅ Allow Shopify product images to display

---

### Step 2: Check Backend is Running

Open a new terminal and run:
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status":"OK","timestamp":"...","environment":"production","version":"1.0.0"}
```

If you get an error, restart backend:
```bash
cd ~/Desktop/POS\ System/backend
npm start
```

---

### Step 3: Test WhatsApp Message

1. **Go to**: http://localhost:8080
2. **Login** to POS
3. **Add product** to cart (click "Add to Cart")
4. **Select payment** method (Cash/Card/UPI)
5. **Click** "Complete Sale"
6. **Enter customer details**:
   - Name: `Test Customer`
   - Phone: `+919891065456` (your WhatsApp number)
7. **Submit** the sale

---

### Step 4: Check Terminal Logs

Watch your backend terminal for these logs:

**✅ Success logs:**
```
📱 Attempting to send WhatsApp invoice INV-XXXXX to +919891065456
📄 Step 1: Generating PDF invoice...
✅ PDF generated successfully: INV-XXXXX.pdf
📎 PDF URL: http://localhost:8000/api/invoices/INV-XXXXX.pdf
📱 Step 2: Sending WhatsApp template...
📱 Using WhatsApp template: invoice_notification_kiosk (WORKING - no PDF)
✅ WhatsApp invoice sent successfully!
```

**❌ Error logs to watch for:**
```
❌ KWIKENGAGE_API_KEY not found
❌ WhatsApp send failed
❌ PDF generation failed
```

---

### Step 5: Check WhatsApp

**You should receive:**
- ✅ WhatsApp message with invoice details
- ❌ PDF will NOT be attached (waiting for new template activation)

**Message will look like:**
```
Hi Test Customer,

Thank you for your purchase!

Invoice: INV-XXXXX
Date: 06 Oct 2025
Amount: ₹1299.00
Payment: Cash

Your order has been confirmed.
```

---

## 🐛 Troubleshooting

### Problem: Still seeing image errors after hard refresh

**Solution:**
1. Close the browser tab completely
2. Clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images
3. Restart browser
4. Open http://localhost:8080 again

---

### Problem: Backend keeps stopping

**Solution:**
```bash
# Kill all node processes
ps aux | grep node | grep -v grep | awk '{print $2}' | xargs kill -9

# Start backend
cd ~/Desktop/POS\ System/backend
npm start
```

Keep this terminal open and watch for errors!

---

### Problem: "BACKEND_URL not defined" in logs

**Solution:**
Check if `.env` file has:
```bash
cd ~/Desktop/POS\ System/backend
cat .env | grep BACKEND_URL
```

Should show:
```
BACKEND_URL=http://localhost:8000
```

If not, run:
```bash
echo "BACKEND_URL=http://localhost:8000" >> .env
npm start
```

---

### Problem: WhatsApp message not received

**Check these:**

1. **API Key valid?**
   ```bash
   cd ~/Desktop/POS\ System/backend
   cat .env | grep KWIKENGAGE_API_KEY
   ```
   Should show a long API key.

2. **Backend logs show error?**
   - Look for "❌" or "Error" in backend terminal
   - Copy the full error message

3. **Phone number correct?**
   - Must include country code: `+919891065456`
   - Format: `+[country code][number]`

4. **Kwikengage account active?**
   - Log in to Kwikengage dashboard
   - Check if you have remaining message credits
   - Verify WhatsApp Business is connected

---

## 📋 Current Status

### ✅ Working:
- Backend server running
- PDF generation (saved to `backend/invoices/`)
- WhatsApp template message delivery
- Environment variables configured

### ⏳ Waiting:
- New template `invoice_with_pdf_kiosk` activation
- PDF attachment in WhatsApp message

### ❌ Known Limitations:
- PDF not sent with WhatsApp message (24-hour window restriction)
- Using old template until new one is activated by Kwikengage

---

## 🚀 Next Steps

1. **Test now** following steps above
2. **Report back**:
   - ✅ If you received WhatsApp message
   - ❌ If you didn't receive it (share backend logs)
3. **Contact Kwikengage** to activate new template
4. **Once activated**, I'll switch code to new template with PDF support

---

## 📞 Need Help?

**If you're stuck:**
1. Copy the **full backend terminal output**
2. Screenshot any **browser console errors**
3. Share what **step failed**
4. I'll debug and fix immediately!
