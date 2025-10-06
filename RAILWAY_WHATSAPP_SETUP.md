# Railway WhatsApp PDF Invoice Setup Guide

## 🎯 **Problem**
WhatsApp PDF invoices won't be delivered if `BACKEND_URL` is not configured, because Kwikengage needs a public URL to download the PDF files.

---

## ✅ **Solution: Configure Railway Environment Variables**

### **Step 1: Open Railway Dashboard**
1. Go to [railway.app](https://railway.app)
2. Open your project: **Multi-location POS**
3. Click on your service (backend)
4. Click on **"Variables"** tab

---

### **Step 2: Add Required Environment Variables**

Add the following variable if not already present:

#### **BACKEND_URL**
- **Name:** `BACKEND_URL`
- **Value:** `https://multi-location-pos-production.up.railway.app`
- **Purpose:** Provides public URL for WhatsApp to download PDF invoices

#### **Other Required Variables** (verify these exist):

| Variable Name | Value | Purpose |
|--------------|-------|---------|
| `NODE_ENV` | `production` | Sets production mode |
| `SHOPIFY_SHOP_DOMAIN` | `your-store.myshopify.com` | Shopify store domain |
| `SHOPIFY_ACCESS_TOKEN` | `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Shopify API access |
| `KWIKENGAGE_API_KEY` | `your_kwikengage_api_key_here` | WhatsApp API key |

---

### **Step 3: Redeploy**

After adding `BACKEND_URL`:
1. Railway will automatically trigger a redeploy
2. Wait for deployment to complete (~2-3 minutes)
3. Check deployment logs for success

---

### **Step 4: Test WhatsApp PDF Delivery**

1. Open your Railway app: `https://multi-location-pos-production.up.railway.app`
2. Login and complete a sale with a customer phone number
3. Check WhatsApp - you should receive:
   - ✅ Template message with invoice details
   - ✅ PDF document attachment

---

## 🔍 **Verify Configuration**

### **Check Backend Logs**

In Railway logs, you should see:
```
📱 Attempting to send WhatsApp invoice MUMBVOYA-00005 to +919891065456
✅ WhatsApp template sent successfully!
📄 Generating PDF invoice...
✅ PDF generated successfully: MUMBVOYA-00005.pdf
📎 Sending PDF via WhatsApp...
📄 Document URL: https://multi-location-pos-production.up.railway.app/api/invoices/MUMBVOYA-00005.pdf
✅ PDF sent successfully!
```

### **If PDF Fails**

Look for these errors in logs:
- ❌ `Document URL: http://localhost:8000/...` → `BACKEND_URL` not set
- ❌ `404 Not Found` → Backend not serving PDF files correctly
- ❌ `Kwikengage error` → API key or template issues

---

## 📱 **Local Development (ngrok required)**

For localhost testing, you need ngrok:

### **Setup ngrok**
1. Sign up at [ngrok.com](https://ngrok.com)
2. Install authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
3. Start ngrok:
   ```bash
   ngrok http 8000
   ```
4. Copy HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
5. Add to `backend/.env`:
   ```env
   BACKEND_URL=https://abc123.ngrok-free.app
   ```
6. Restart backend:
   ```bash
   cd backend && npm start
   ```

---

## 🚀 **Production Recommendation**

**For production, always use Railway URL**, not ngrok:
- ✅ Permanent URL
- ✅ No auth required
- ✅ Better performance
- ✅ Automatic SSL/HTTPS

---

## 🎉 **Expected Result**

After configuration, when a sale is completed:

### **Customer Receives:**
1. **WhatsApp Template Message**
   ```
   Hi [Customer Name],
   
   Thank you for your purchase!
   
   Invoice: MUMBVOYA-00005
   Date: 06 Oct 2025
   Amount: ₹1532.82
   Payment: cash
   
   Your order has been confirmed.
   
   For queries, contact us.
   ```

2. **PDF Invoice Attachment**
   - Professional invoice matching admin panel preview
   - Company details, GST info, itemized list
   - Bank details and declaration
   - High-quality HTML-to-PDF conversion

---

## 📞 **Support**

If issues persist:
1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Test Kwikengage API key with a simple message first
4. Ensure customer phone numbers include country code (+91)

---

**Last Updated:** October 6, 2025
