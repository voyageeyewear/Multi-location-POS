# 🚨 FIX: PDF Not Received on WhatsApp (Railway)

## Problem
You received the WhatsApp template message but **NOT the PDF**. This means:
- ✅ Template message sent successfully
- ✅ PDF generated successfully
- ❌ **Kwikengage cannot download the PDF from the URL**

## Root Cause
The `BACKEND_URL` on Railway is either:
1. Not set (defaults to `http://localhost:8000`)
2. Set incorrectly

This causes the PDF URL to be something like:
```
http://localhost:8000/api/invoices/invoice-123.pdf
```

**Kwikengage cannot access localhost!** It needs a public URL.

---

## ✅ SOLUTION: Update Railway Environment Variable

### Step 1: Go to Railway Dashboard
1. Open: https://railway.app/dashboard
2. Find your project: **Multi-location POS**
3. Click on **Backend service**

### Step 2: Add Environment Variable
1. Click **"Variables"** tab
2. Click **"+ New Variable"**
3. Add this variable:

```
Name:  BACKEND_URL
Value: https://multi-location-pos-production.up.railway.app
```

**⚠️ IMPORTANT:** Replace with YOUR actual Railway URL if different!

### Step 3: Redeploy
1. Click **"Deploy"** or wait for auto-deploy
2. Wait 2-3 minutes for deployment to complete

---

## 🧪 HOW TO TEST

### Test 1: Check Backend URL
After Railway redeploys, make a test sale and check the backend logs:

**Expected log output:**
```bash
📄 Step 1: Generating PDF invoice...
✅ PDF generated successfully: invoice-MUMBVOYA-00035.pdf
📎 PDF URL: https://multi-location-pos-production.up.railway.app/api/invoices/invoice-MUMBVOYA-00035.pdf
📱 Step 2: Sending WhatsApp template message...
✅ Template message sent successfully!
📎 Step 3: Sending PDF document...
✅ PDF document sent successfully!
```

**❌ Bad (current state):**
```bash
📎 PDF URL: http://localhost:8000/api/invoices/invoice-123.pdf
```

### Test 2: Make a Sale
1. Go to Railway URL: https://multi-location-pos-production.up.railway.app/
2. Make a test sale with WhatsApp
3. You should receive **2 messages:**
   - Message 1: Template with invoice details
   - Message 2: PDF document (1-2 seconds later)

---

## 🔍 DEBUGGING

If PDF still not received after fixing `BACKEND_URL`:

### Check 1: Verify PDF URL is Accessible
Copy the PDF URL from logs and paste it in your browser:
```
https://multi-location-pos-production.up.railway.app/api/invoices/invoice-MUMBVOYA-00035.pdf
```

**Expected:** PDF should download automatically
**If not:** Backend might not be serving PDFs correctly

### Check 2: Check Railway Logs
In Railway dashboard:
1. Click on **Backend service**
2. Click **"Deployments"** tab
3. Click on latest deployment
4. Click **"View Logs"**

**Look for:**
```
📎 Step 3: Sending PDF document...
✅ PDF document sent successfully!
```

**Or error:**
```
⚠️ PDF send failed (but template was sent): [ERROR MESSAGE]
```

---

## 📋 CHECKLIST

- [ ] `BACKEND_URL` set on Railway to public URL
- [ ] Railway redeployed
- [ ] Made test sale
- [ ] Received template message
- [ ] Received PDF document (separate message)

---

## 💡 ALTERNATIVE: Test Locally

If you want to test locally with WhatsApp PDF delivery:

### Step 1: Install ngrok
```bash
brew install ngrok
```

### Step 2: Expose Local Backend
```bash
ngrok http 8000
```

You'll get a public URL like:
```
https://abc123.ngrok.io
```

### Step 3: Update Local .env
```bash
# backend/.env
BACKEND_URL=https://abc123.ngrok.io
```

### Step 4: Restart Backend
```bash
cd backend
npm start
```

### Step 5: Test
Make a sale - PDF should be delivered!

**⚠️ Note:** Ngrok URL changes every time you restart it.

---

## 🆘 STILL NOT WORKING?

If PDF still not received after all fixes:

1. **Check Kwikengage API Limits:** You might have hit message limits
2. **Check WhatsApp Business Account:** Account might be restricted
3. **Contact Kwikengage Support:** Document delivery might need special approval

### Get Support:
- Kwikengage Support: support@kwikengage.com
- Check API docs: https://docs.kwikengage.com/

---

**Expected Result:**
After fixing `BACKEND_URL` on Railway, you should receive **2 WhatsApp messages** for each sale:
1. Template message with invoice details
2. PDF document (invoice file)

✅ **Fix the `BACKEND_URL` on Railway and test again!**
