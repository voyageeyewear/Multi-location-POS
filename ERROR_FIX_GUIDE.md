# Error Fix Guide - Console Errors Resolution

## 🚨 Current Errors You're Seeing:

1. ❌ **49 CSP Image Errors**: Images blocked by cached Content Security Policy
2. ❌ **Shopify Sync Error (400)**: Shopify API failing  
3. ❌ **WhatsApp Send Failed**: WhatsApp API error

---

## ✅ **IMMEDIATE FIX - Do This Right NOW:**

### **Step 1: Hard Refresh Browser (CRITICAL)**

**Press `Cmd + Shift + R` on your browser tab**

This will:
- ✅ Clear cached CSP policy
- ✅ Fix all 49 image loading errors
- ✅ Load version 16.0 with correct CSP

**Alternative if above doesn't work:**
1. Right-click the page → "Inspect"
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

---

### **Step 2: Check Backend is Running**

In your terminal, check:
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status":"OK","timestamp":"...","environment":"production","version":"1.0.0"}
```

**If no response:**
```bash
cd ~/Desktop/POS\ System/backend
npm start
```

Keep this terminal open!

---

### **Step 3: Test WhatsApp Button**

After hard refresh:
1. Go to **Invoice** page
2. Click on any invoice to expand it
3. Click **"📱 Send WhatsApp"** button
4. Enter phone: `+918076616747`
5. Check your WhatsApp

**Watch backend terminal for logs:**
```
📱 Attempting to send WhatsApp invoice...
✅ PDF generated successfully
✅ WhatsApp invoice sent successfully!
```

---

## 🔍 **Detailed Error Explanations:**

### **Error 1: CSP Image Blocking (49 errors)**

**What it is:**
```
Refused to load the image '<URL>' because it violates the following Content Security Policy directive: "img-src 'self' data:"
```

**Why it happens:**
- Browser cached old CSP policy (version 15.0)
- Old policy didn't allow `https:` and `http:` for images
- New policy (16.0) allows all HTTPS/HTTP images

**Fix:**
- Hard refresh (`Cmd + Shift + R`)
- This forces browser to reload CSP from server

---

### **Error 2: Shopify API 400 Error**

**What it is:**
```
Failed to load resource: /api/shopify/orders:1 - 400 (Bad Request)
```

**Why it happens:**
- Shopify credentials might be incorrect in `.env`
- Shopify API rate limiting
- Invalid order data format

**Fix:**
Check your `backend/.env` file has correct values:
```bash
SHOPIFY_SHOP_DOMAIN=voyageeyewear.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_actual_token_here
```

**Test Shopify connection:**
```bash
curl -H "Authorization: Bearer demo-token" http://localhost:8000/api/shopify/test
```

---

### **Error 3: WhatsApp Send Failed**

**What it is:**
```
WhatsApp send failed: Object
```

**Why it happens:**
- Backend not responding
- Kwikengage API key invalid
- Phone number format wrong
- Template not activated

**Fix:**

1. **Check backend logs** in terminal for actual error:
   ```
   ❌ KWIKENGAGE_API_KEY not found
   ❌ WhatsApp send failed: Template not found
   ❌ Invalid phone number format
   ```

2. **Verify `.env` has API key:**
   ```bash
   cd ~/Desktop/POS\ System/backend
   cat .env | grep KWIKENGAGE_API_KEY
   ```
   Should show your actual API key.

3. **Check phone format:**
   - ✅ Correct: `+918076616747`
   - ❌ Wrong: `8076616747` (missing +91)

---

## 🧪 **Testing Checklist:**

After hard refresh, verify:

- [ ] No red CSP errors in console
- [ ] Product images loading correctly
- [ ] Can see Shopify products
- [ ] Send WhatsApp button appears on invoices
- [ ] WhatsApp sends successfully
- [ ] Backend terminal shows success logs

---

## 🚀 **Quick Test Script:**

Run this to test everything:

```bash
# 1. Check backend health
curl http://localhost:8000/health

# 2. Check Shopify connection
curl -H "Authorization: Bearer demo-token" \
  http://localhost:8000/api/shopify/products | head -20

# 3. Test WhatsApp API (replace with your data)
curl -X POST http://localhost:8000/api/whatsapp/send-invoice \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "TEST-001",
    "customerName": "Test Customer",
    "customerPhone": "+918076616747",
    "items": [{"title": "Test Item", "quantity": 1, "price": 100}],
    "total": 100,
    "paymentMethod": "Cash",
    "timestamp": "'$(date -Iseconds)'"
  }'
```

---

## ⚠️ **Common Issues & Solutions:**

### **Issue: Backend keeps stopping**

**Solution:**
```bash
# Kill all node processes
ps aux | grep node | grep -v grep | awk '{print $2}' | xargs kill -9

# Start fresh
cd ~/Desktop/POS\ System/backend
npm start

# Keep this terminal open!
```

---

### **Issue: Port 8000 already in use**

**Solution:**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Start backend again
cd ~/Desktop/POS\ System/backend
npm start
```

---

### **Issue: WhatsApp works locally but not on Railway**

**Check Railway Environment Variables:**
1. Go to Railway Dashboard
2. Select your service
3. Go to **Variables** tab
4. Verify these exist:
   ```
   BACKEND_URL=https://multi-location-pos-production.up.railway.app
   KWIKENGAGE_API_KEY=your_key_here
   SHOPIFY_SHOP_DOMAIN=voyageeyewear.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_token_here
   NODE_ENV=production
   ```

---

## 📞 **Still Having Issues?**

**Share with me:**
1. Screenshot after hard refresh (still showing errors?)
2. Backend terminal logs (last 20 lines)
3. What step are you stuck on?

**Quick debug info to share:**
```bash
# Run this and share output:
echo "=== Backend Health ==="
curl -s http://localhost:8000/health

echo -e "\n=== Environment Check ==="
cd ~/Desktop/POS\ System/backend
grep -E "(KWIKENGAGE|SHOPIFY|BACKEND_URL)" .env | sed 's/=.*/=***HIDDEN***/'

echo -e "\n=== Backend Process ==="
ps aux | grep "node.*server.js" | grep -v grep

echo -e "\n=== Recent Backend Logs (last 10 lines) ==="
tail -10 ~/Desktop/POS\ System/backend/npm-debug.log 2>/dev/null || echo "No logs found"
```

---

## ✅ **Success Indicators:**

When everything is fixed, you should see:

**✅ Console (0 errors):**
- No red CSP errors
- No 400 Shopify errors
- No WhatsApp failed errors

**✅ Page:**
- All product images loading
- Shopify products visible
- Send WhatsApp button working

**✅ Backend Terminal:**
- Server running on port 8000
- No error messages
- Shows WhatsApp success logs when testing

**✅ WhatsApp:**
- Message received
- PDF attached (if template activated)

---

**DO THIS NOW:**
1. ✅ Hard refresh: `Cmd + Shift + R`
2. ✅ Check backend terminal
3. ✅ Test Send WhatsApp button
4. ✅ Report back!

**Most issues will be fixed just by hard refreshing! 🚀**
