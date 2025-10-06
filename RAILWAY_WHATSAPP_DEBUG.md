# Railway WhatsApp Integration Debug Guide

## 🚨 Issue: WhatsApp Not Working on Railway Production

**URL**: https://multi-location-pos-production.up.railway.app/
**Test Phone**: +918076616747

---

## ✅ **Step 1: Verify Railway Environment Variables**

Go to Railway Dashboard and check these variables are set:

### **Required Variables:**

```bash
# WhatsApp Integration
KWIKENGAGE_API_KEY=your_kwikengage_api_key_here

# Backend URL (CRITICAL for PDF delivery)
BACKEND_URL=https://multi-location-pos-production.up.railway.app

# Shopify Integration
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here

# Environment
NODE_ENV=production
PORT=8000
```

### **How to Check:**
1. Go to https://railway.app
2. Select **Multi-location-POS** project
3. Click on your backend service
4. Go to **Variables** tab
5. Verify all above variables are present

---

## 🔍 **Step 2: Check Railway Deployment Logs**

### **How to Check Logs:**
1. Go to Railway Dashboard
2. Click **Deployments** tab
3. Click on the latest deployment
4. Look for **View Logs** button
5. Search for these keywords:
   - `📱 Attempting to send WhatsApp`
   - `❌ WhatsApp send failed`
   - `✅ WhatsApp invoice sent`
   - `KWIKENGAGE_API_KEY`
   - `BACKEND_URL`

### **What to Look For:**

**✅ Success logs:**
```
📱 Attempting to send WhatsApp invoice INV-XXXXX to +918076616747
📄 Step 1: Generating PDF invoice...
✅ PDF generated successfully: INV-XXXXX.pdf
📎 PDF URL: https://multi-location-pos-production.up.railway.app/api/invoices/INV-XXXXX.pdf
📱 Step 2: Sending WhatsApp template...
📱 Using WhatsApp template: invoice_with_pdf_kiosk (TESTING - PDF header enabled)
📎 Adding PDF document to template header: https://...
📤 Sending WhatsApp message with 2 components (header+body)
✅ WhatsApp invoice sent successfully!
```

**❌ Error logs (common issues):**

1. **Missing BACKEND_URL:**
```
❌ BACKEND_URL not found
Error: BACKEND_URL is required for WhatsApp PDF delivery
```
**Fix:** Add `BACKEND_URL` variable in Railway Variables tab

2. **Wrong BACKEND_URL (localhost):**
```
📎 PDF URL: http://localhost:8000/api/invoices/INV-XXXXX.pdf
```
**Fix:** Update `BACKEND_URL` to Railway public URL

3. **Missing API Key:**
```
❌ KWIKENGAGE_API_KEY not configured
```
**Fix:** Add `KWIKENGAGE_API_KEY` variable in Railway

4. **Template Not Found:**
```
❌ WhatsApp send failed: Template not found
```
**Fix:** Template `invoice_with_pdf_kiosk` not activated yet - contact Kwikengage

5. **Invalid Phone Format:**
```
❌ Invalid phone number format
```
**Fix:** Ensure phone starts with `+91` (country code)

---

## 🛠️ **Step 3: Fix Missing Variables**

If `BACKEND_URL` is missing:

1. Go to Railway → Your Service → **Variables**
2. Click **+ New Variable**
3. Add:
   - **Key**: `BACKEND_URL`
   - **Value**: `https://multi-location-pos-production.up.railway.app`
4. Click **Add**
5. Railway will auto-redeploy (wait 2-3 minutes)

---

## 🧪 **Step 4: Test After Fix**

1. Wait for Railway deployment to complete
2. Go to: https://multi-location-pos-production.up.railway.app/
3. Login to POS
4. Complete a sale with:
   - Name: `Test`
   - Phone: `+918076616747`
5. Check Railway logs immediately
6. Check WhatsApp on mobile: +918076616747

---

## 📱 **Phone Number Format**

**IMPORTANT:** Always use international format:

✅ **Correct:**
- `+918076616747`
- `+91 8076616747`

❌ **Wrong:**
- `8076616747` (missing country code)
- `08076616747` (missing + and country code)

---

## 🔄 **Step 5: Fallback Test**

If new template `invoice_with_pdf_kiosk` doesn't work, we can temporarily revert to the old working template:

1. I'll switch code back to `invoice_notification_kiosk`
2. This will send message WITHOUT PDF
3. At least you'll receive the text message
4. Then contact Kwikengage to activate new template

---

## 📊 **Current Status**

- ✅ Local testing: **WORKING** (WhatsApp messages delivered)
- ❌ Railway production: **NOT WORKING** (needs investigation)
- 🔍 Most likely issue: **Missing BACKEND_URL on Railway**

---

## 🚀 **Quick Fix (Most Common Issue)**

**90% of the time, it's missing `BACKEND_URL` on Railway:**

```bash
# Add this to Railway Variables tab:
BACKEND_URL=https://multi-location-pos-production.up.railway.app
```

After adding, wait 2-3 minutes for redeploy, then test again!

---

## 📞 **Need Help?**

**Share with me:**
1. Screenshot of Railway **Variables** tab
2. Railway deployment logs (last 50 lines)
3. What happens when you complete a sale (any error messages?)

I'll debug and fix immediately!

---

## 🎯 **Action Plan (DO THIS NOW)**

1. ✅ Open Railway Dashboard
2. ✅ Go to Variables tab
3. ✅ Check if `BACKEND_URL` exists
4. ❌ If missing → Add it with Railway public URL
5. ⏳ Wait 2-3 minutes for redeploy
6. 🧪 Test a sale on production
7. 📱 Check WhatsApp
8. 📊 Check Railway logs
9. 💬 Tell me the results!

**Let's fix this now! 🚀**
