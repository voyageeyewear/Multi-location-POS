# 🚀 Railway Deployment - Shopify Setup Guide

## Current Issue
Your POS system is deployed on Railway but showing demo products (₹0) because Shopify credentials are not configured.

## Step-by-Step: Add Shopify to Railway

### 1. Get Your Shopify Credentials

Go to your Shopify Admin Panel:
1. Click **Settings** (bottom left)
2. Click **Apps and sales channels**
3. Click **Develop apps** (or "App and sales channel settings" → "Develop apps")
4. Click **Create an app** (if you haven't already)
5. Name it: "POS System" or "Multi-Location POS"

After creating the app:

**Get Admin API Access Token:**
1. Click on your app
2. Go to **API credentials** tab
3. Click **Configure Admin API scopes**
4. Select these scopes:
   - `read_products`
   - `write_products`
   - `read_orders`
   - `write_orders`
   - `read_customers`
   - `write_customers`
   - `read_inventory`
   - `write_inventory`
   - `read_locations`
5. Click **Save**
6. Go to **API credentials** tab
7. Click **Install app** (top right)
8. Click **Install** to confirm
9. Copy the **Admin API access token** (you'll only see this once!)

**Get API Key & Secret:**
- Still in **API credentials** tab
- Copy **API key**
- Click **Show** next to **API secret key** and copy it

**Get Storefront Access Token:**
1. Go to **API credentials** tab
2. Scroll to **Storefront API** section
3. Click **Configure Storefront API scopes**
4. Select all relevant scopes
5. Save and generate the token

**Your Shop Domain:**
- It's your store URL: `your-store-name.myshopify.com`
- Find it in your Shopify admin URL

---

### 2. Add Environment Variables to Railway

1. Go to your Railway project: https://railway.app/project/<your-project-id>
2. Click on your **backend service**
3. Click the **Variables** tab
4. Click **+ New Variable** for each of these:

```bash
SHOPIFY_SHOP_DOMAIN=your-store-name.myshopify.com
SHOPIFY_API_KEY=your-api-key-here
SHOPIFY_API_SECRET=your-api-secret-here
SHOPIFY_ACCESS_TOKEN=your-admin-access-token-here
SHOPIFY_STOREFRONT_TOKEN=your-storefront-token-here
```

**Important:** Replace the values with your actual credentials from Step 1!

---

### 3. Redeploy

After adding all variables:
1. Railway will automatically redeploy (or click **Redeploy** if it doesn't)
2. Wait 2-3 minutes for deployment to complete
3. Refresh your POS system

---

## ✅ How to Verify It's Working

After redeployment:
1. Open your POS system: https://multi-location-pos-production.up.railway.app
2. Go to the POS page
3. You should see:
   - ✅ Real product names (from your Shopify store)
   - ✅ Real prices (not ₹0)
   - ✅ Real product images
   - ✅ Real stock levels
4. Console should show: `Successfully loaded X POS products from Shopify!`

---

## 🔧 Troubleshooting

### Still showing demo products?
1. Check Railway logs:
   - Go to Railway dashboard
   - Click on backend service
   - Click **Deployments** tab
   - Check logs for errors
2. Common issues:
   - Wrong API credentials
   - Missing API scopes
   - Shopify app not installed
   - Typo in environment variable names

### Can't see "Develop apps"?
- You need to be the store owner or have staff permissions
- Go to Settings → Apps and sales channels → "Develop apps for your store"

### API scopes error?
- Make sure you selected ALL required scopes listed above
- Save the scopes BEFORE installing the app

---

## 📞 Need Help?

If you're still stuck:
1. Check Railway logs for specific error messages
2. Verify all 5 environment variables are set correctly
3. Make sure your Shopify app is installed and has the right scopes
4. The backend logs will show: "Error fetching products:" with details

---

## 🎯 Expected Result

Once configured correctly:
- **POS Products:** Your actual Shopify products with real images and prices
- **Orders:** Sync to Shopify when you complete a sale
- **Inventory:** Real-time stock levels from your Shopify store
- **Locations:** Your Shopify store locations available

Good luck! 🚀

