# 🚀 QUICK FIX: Railway WhatsApp PDF Setup

## ⏱️ **5-Minute Fix**

### **What You Need to Do:**

1. **Go to Railway Dashboard**
   - Open: https://railway.app
   - Select: "Multi-location POS" project
   - Click: Your backend service
   - Click: **"Variables"** tab

2. **Add ONE Variable:**
   ```
   Name:  BACKEND_URL
   Value: https://multi-location-pos-production.up.railway.app
   ```
   
3. **Click "Add"** → Railway auto-deploys (wait 2-3 mins)

4. **Test:**
   - Open your Railway app
   - Complete a sale
   - Check WhatsApp for PDF! ✅

---

## ✅ **That's It!**

After this ONE variable is added:
- ✅ WhatsApp messages will work
- ✅ PDF invoices will be delivered
- ✅ No localhost issues
- ✅ Production-ready

---

## 📱 **For Localhost (Optional)**

If you want to test on localhost:
1. Get ngrok account: https://ngrok.com/signup
2. Run: `ngrok config add-authtoken YOUR_TOKEN`
3. Run: `ngrok http 8000`
4. Copy HTTPS URL
5. Add to `backend/.env`: `BACKEND_URL=https://your-ngrok-url`
6. Restart backend

**BUT Railway is much easier!** 🎉
