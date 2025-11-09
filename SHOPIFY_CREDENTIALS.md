# 🔐 Shopify Credentials Configuration

## Overview
Your POS system needs these 5 Shopify credentials to fetch real products, orders, and inventory.

---

## 📋 Required Credentials

### 1. **SHOPIFY_SHOP_DOMAIN**
- **What it is:** Your Shopify store URL
- **Format:** `your-store-name.myshopify.com`
- **Example:** `voyage-eyewear.myshopify.com`
- **Where to find:** Your Shopify admin panel URL or Settings → Domains

### 2. **SHOPIFY_API_KEY**
- **What it is:** Your app's API key
- **Format:** 32-character alphanumeric string
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Where to find:** 
  1. Go to Shopify Admin → Settings → Apps and sales channels
  2. Click "Develop apps"
  3. Click on your app name
  4. Go to "API credentials" tab
  5. Copy the "API key"

### 3. **SHOPIFY_API_SECRET**
- **What it is:** Your app's API secret key
- **Format:** 32-character alphanumeric string
- **Example:** `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4`
- **Where to find:**
  1. Same location as API Key (API credentials tab)
  2. Click "Show" next to "API secret key"
  3. Copy the value (keep it secret!)

### 4. **SHOPIFY_ACCESS_TOKEN**
- **What it is:** Admin API access token
- **Format:** `shpat_` followed by alphanumeric string
- **Example:** `shpat_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Where to find:**
  1. Same app in API credentials tab
  2. Click "Install app" (top right)
  3. Confirm installation
  4. Copy the "Admin API access token" (⚠️ shown only once!)
  5. **Important:** If you lose this, you need to reinstall the app

### 5. **SHOPIFY_STOREFRONT_TOKEN** (Optional but recommended)
- **What it is:** Storefront API access token
- **Format:** Alphanumeric string
- **Example:** `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`
- **Where to find:**
  1. Same app, API credentials tab
  2. Scroll to "Storefront API" section
  3. Configure scopes if needed
  4. Generate and copy the token

---

## 🛠️ Configuration Locations

### **Local Development** (Your Computer)
File: `/backend/.env`

```bash
SHOPIFY_SHOP_DOMAIN=your-store-name.myshopify.com
SHOPIFY_API_KEY=your-api-key-here
SHOPIFY_API_SECRET=your-api-secret-here
SHOPIFY_ACCESS_TOKEN=shpat_your-access-token-here
SHOPIFY_STOREFRONT_TOKEN=your-storefront-token-here
```

**Status:** ✅ Currently SET (4/5 credentials)
- SHOPIFY_SHOP_DOMAIN: ✅ Set
- SHOPIFY_API_KEY: ✅ Set
- SHOPIFY_API_SECRET: ✅ Set
- SHOPIFY_ACCESS_TOKEN: ✅ Set
- SHOPIFY_STOREFRONT_TOKEN: ❌ Not set (optional)

### **Railway Deployment** (Production)
Location: Railway Dashboard → Your Project → Backend Service → Variables tab

Add each credential as a separate environment variable:

1. Click "+ New Variable"
2. Enter name: `SHOPIFY_SHOP_DOMAIN`
3. Enter value: `your-store-name.myshopify.com`
4. Click "Add"
5. Repeat for all 5 credentials

**Note:** Railway will auto-redeploy after adding variables.

---

## 🔑 Required API Scopes

When creating your Shopify app, select these scopes:

### Admin API Scopes:
```
✅ read_products
✅ write_products
✅ read_orders
✅ write_orders
✅ read_customers
✅ write_customers
✅ read_inventory
✅ write_inventory
✅ read_locations
✅ write_locations (optional)
```

### Storefront API Scopes (if using):
```
✅ unauthenticated_read_product_listings
✅ unauthenticated_read_product_inventory
```

---

## 📝 Step-by-Step: Get Credentials from Shopify

### Step 1: Access Shopify Admin
1. Log in to your Shopify store
2. Go to: **Settings** (bottom left)

### Step 2: Create App (if not done)
1. Click **Apps and sales channels**
2. Click **Develop apps** (or "Develop apps for your store")
3. Click **Create an app**
4. Name: "POS System" or "Multi-Location POS"
5. Click **Create app**

### Step 3: Configure API Scopes
1. Click on your app name
2. Go to **Configuration** tab
3. Click **Configure** under "Admin API integration"
4. Select all scopes listed above
5. Click **Save**

### Step 4: Install App
1. Go to **API credentials** tab
2. Click **Install app** (top right button)
3. Review permissions
4. Click **Install**

### Step 5: Copy All Credentials
1. **Admin API access token:** Copy it NOW (shown only once!)
2. **API key:** Copy from "API credentials" tab
3. **API secret:** Click "Show" and copy
4. **Shop domain:** Your store URL (e.g., `store-name.myshopify.com`)
5. **Storefront token:** Scroll down, generate if needed

---

## ✅ How to Verify It's Working

### Local Development:
1. Run your backend: `cd backend && npm start`
2. Check console logs for:
   ```
   ✅ Successfully connected to Shopify
   📦 Loaded X products from Shopify
   ```
3. Open frontend, go to POS page
4. You should see real products (not demo products)

### Railway Deployment:
1. Add all credentials to Railway Variables
2. Wait for auto-redeploy (2-3 minutes)
3. Open your deployed URL
4. Check Railway logs for connection success
5. POS page should show real products

---

## 🚨 Troubleshooting

### "Demo products showing"
- **Cause:** Credentials not set or incorrect
- **Fix:** Double-check all 5 environment variables

### "401 Unauthorized"
- **Cause:** Wrong access token or app not installed
- **Fix:** Reinstall app, get new access token

### "403 Forbidden"
- **Cause:** Missing API scopes
- **Fix:** Add required scopes, reinstall app

### "Products not loading"
- **Cause:** Wrong shop domain or network issue
- **Fix:** Verify domain format: `store-name.myshopify.com` (no https://)

### "Access token starts with wrong prefix"
- **Cause:** Using wrong type of token
- **Fix:** Admin API token should start with `shpat_`

---

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
   - `.env` is in `.gitignore` ✅
   - Never share credentials publicly

2. **Use different credentials for dev/production**
   - Create separate Shopify apps if possible

3. **Rotate tokens regularly**
   - Regenerate access tokens every few months

4. **Limit API scopes**
   - Only select scopes your app actually needs

5. **Monitor API usage**
   - Check Shopify dashboard for unusual activity

---

## 📞 Need Help?

### Check Logs:
**Local:**
```bash
cd backend
npm start
# Look for Shopify connection messages
```

**Railway:**
1. Go to Railway dashboard
2. Click backend service
3. Click "Deployments" → Latest deployment
4. Check logs for errors

### Common Log Messages:
- ✅ `Successfully connected to Shopify` - Working!
- ❌ `Shopify connection error` - Check credentials
- ❌ `Error fetching products` - Check API scopes
- ⚠️ `Using demo products` - Credentials not set

---

## 📚 Additional Resources

- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin-rest)
- [Shopify App Development Guide](https://shopify.dev/docs/apps)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)

---

## 🎯 Quick Reference

| Credential | Format | Where to Find | Required? |
|-----------|--------|---------------|-----------|
| SHOPIFY_SHOP_DOMAIN | `store.myshopify.com` | Shopify Admin URL | ✅ Yes |
| SHOPIFY_API_KEY | 32 chars | API credentials tab | ✅ Yes |
| SHOPIFY_API_SECRET | 32 chars | API credentials tab | ✅ Yes |
| SHOPIFY_ACCESS_TOKEN | `shpat_...` | After app install | ✅ Yes |
| SHOPIFY_STOREFRONT_TOKEN | String | Storefront API section | ⚠️ Optional |

---

**Last Updated:** November 9, 2025

