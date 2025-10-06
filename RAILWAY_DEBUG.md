# Railway PDF Invoice Debugging Guide

## 🔍 How to Check Why PDF is Not Being Sent

### **Step 1: Check Railway Deployment Logs**

1. Go to https://railway.app
2. Open your project: **Multi-location-POS**
3. Click on **Deployments** tab
4. Click on the latest deployment
5. View the **Build Logs** and **Deploy Logs**

Look for these indicators:

#### **✅ Good Signs:**
```
✓ Installing nixpkgs: nodejs, chromium
✓ Chromium installed successfully
✓ Server running on port 8000
```

#### **❌ Bad Signs:**
```
✗ Error: Failed to launch chrome
✗ Could not find Chrome
✗ PDF generation failed
```

---

### **Step 2: Check Runtime Logs**

1. In Railway, click on your service
2. Click on **"Logs"** tab (near Variables)
3. Complete a sale on the production site
4. Watch the logs in real-time

Look for:

#### **If PDF Generation Succeeds:**
```
📱 Attempting to send WhatsApp invoice MUMBVOYA-00009 to +919891065456
✅ WhatsApp template sent successfully!
📄 Generating PDF invoice...
✅ PDF generated: /app/backend/invoices/MUMBVOYA-00009.pdf
📎 Sending PDF via WhatsApp...
📄 Document URL: https://multi-location-pos-production.up.railway.app/api/invoices/MUMBVOYA-00009.pdf
✅ PDF sent successfully!
```

#### **If PDF Generation Fails:**
```
📄 Generating PDF invoice...
❌ Error generating PDF: Failed to launch chrome
```

OR

```
📎 Sending PDF via WhatsApp...
❌ Error sending document: [Kwikengage error message]
```

---

### **Step 3: Test PDF URL Directly**

After completing a sale with invoice number `MUMBVOYA-00009`:

1. Open this URL in browser:
   ```
   https://multi-location-pos-production.up.railway.app/api/invoices/MUMBVOYA-00009.pdf
   ```

2. **Expected Results:**
   - ✅ PDF downloads successfully → PDF generation works, issue is with Kwikengage
   - ❌ 404 Not Found → PDF generation is failing
   - ❌ 500 Server Error → Puppeteer/Chromium issue

---

### **Step 4: Common Issues & Solutions**

#### **Issue 1: Chromium Not Installed**
**Symptoms:** Logs show "Failed to launch chrome"

**Solution:**
Check if `nixpacks.toml` was deployed:
```bash
# In Railway settings, verify the build detected nixpacks.toml
```

#### **Issue 2: Memory Issues**
**Symptoms:** Process killed during PDF generation

**Solution:** 
Puppeteer needs ~200MB RAM. If Railway container is too small, upgrade plan or reduce Puppeteer memory:

Add to Railway environment variables:
```
PUPPETEER_ARGS=--disable-dev-shm-usage,--single-process
```

#### **Issue 3: Kwikengage Can't Download PDF**
**Symptoms:** PDF generates but Kwikengage returns error

**Solution:**
1. Verify `BACKEND_URL` is set correctly in Railway
2. Check if PDF endpoint is publicly accessible
3. Verify PDF file size is not too large (< 5MB)

---

### **Step 5: Quick Fixes**

#### **Fix 1: Restart Railway Service**
Sometimes Railway needs a fresh restart after nixpacks.toml is added:
1. Go to Railway → Settings
2. Click "Restart" or trigger a manual redeploy

#### **Fix 2: Verify Environment Variables**
Ensure these are set in Railway:
- `BACKEND_URL` = `https://multi-location-pos-production.up.railway.app`
- `KWIKENGAGE_API_KEY` = [your API key]
- `NODE_ENV` = `production`

#### **Fix 3: Check Chromium Path**
The nixpacks.toml tries to auto-detect Chromium. If it fails, manually set:

Add to Railway environment variables:
```
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

OR

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

---

### **Step 6: Fallback Test**

If Puppeteer keeps failing, we can temporarily switch back to the simpler PDFKit version:

In `backend/src/controllers/whatsappController.js` line 2:
```javascript
// Change this:
const pdfInvoiceService = require('../services/pdfInvoiceServiceHTML');

// To this:
const pdfInvoiceService = require('../services/pdfInvoiceService');
```

This will use the basic PDF generator (not HTML-based) to at least deliver something.

---

## 🎯 Most Likely Issue

Based on your symptoms (template works, PDF doesn't), the most likely issue is:

**Puppeteer cannot find or launch Chromium on Railway**

### Immediate Steps:
1. Check Railway deployment logs for Chromium installation
2. Verify nixpacks.toml was detected in build
3. If not working after 5 minutes, try the fallback PDFKit solution

---

## 📞 Need Help?

Share the Railway logs (from Deployments → Latest → View Logs) and I can diagnose the exact issue!
