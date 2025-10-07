const axios = require('axios');

class ShopifyService {
  constructor() {
    this.shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    this.apiKey = process.env.SHOPIFY_API_KEY;
    this.apiSecret = process.env.SHOPIFY_API_SECRET;
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
    
    this.baseURL = `https://${this.shopDomain}`;
    this.adminAPIURL = `${this.baseURL}/admin/api/2023-10`;
    this.storefrontAPIURL = `${this.baseURL}/api/2023-10/graphql.json`;
  }

  // Get headers for Admin API requests
  getAdminHeaders() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Get headers for Storefront API requests
  getStorefrontHeaders() {
    return {
      'X-Shopify-Storefront-Access-Token': this.storefrontToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Test connection to Shopify
  async testConnection() {
    try {
      const response = await axios.get(`${this.adminAPIURL}/shop.json`, {
        headers: this.getAdminHeaders()
      });
      
      return {
        success: true,
        shop: response.data.shop,
        message: 'Successfully connected to Shopify'
      };
    } catch (error) {
      console.error('Shopify connection error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Get all Shopify locations (stores/warehouses)
  async getLocations() {
    try {
      const response = await axios.get(`${this.adminAPIURL}/locations.json`, {
        headers: this.getAdminHeaders()
      });

      console.log('📍 Shopify Locations:', response.data.locations.map(l => ({ id: l.id, name: l.name, city: l.city })));

      return {
        success: true,
        locations: response.data.locations
      };
    } catch (error) {
      console.error('Error fetching locations:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Get inventory levels for all products at a specific location
  async getInventoryLevels(locationId) {
    try {
      console.log(`📦 Fetching inventory for location: ${locationId}`);
      
      const response = await axios.get(`${this.adminAPIURL}/inventory_levels.json`, {
        headers: this.getAdminHeaders(),
        params: {
          location_ids: locationId,
          limit: 250
        }
      });

      return {
        success: true,
        inventoryLevels: response.data.inventory_levels
      };
    } catch (error) {
      console.error('Error fetching inventory levels:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Get all products from Shopify (with pagination to fetch ALL products)
  async getProducts(limit = 250, locationId = null) {
    try {
      let allProducts = [];
      let nextPageUrl = null;
      let pageCount = 0;
      
      console.log('🛍️  Fetching ALL products from Shopify...');

      // First request
      const firstResponse = await axios.get(`${this.adminAPIURL}/products.json`, {
        headers: this.getAdminHeaders(),
        params: {
          limit: 250, // Shopify max limit
          fields: 'id,title,body_html,handle,vendor,product_type,created_at,updated_at,status,images,variants'
        }
      });

      allProducts = [...firstResponse.data.products];
      pageCount++;
      console.log(`   Page ${pageCount}: Fetched ${firstResponse.data.products.length} products`);

      // Check for pagination link in headers
      const linkHeader = firstResponse.headers['link'];
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextMatch) {
          nextPageUrl = nextMatch[1];
        }
      }

      // Fetch remaining pages
      while (nextPageUrl) {
        const pageResponse = await axios.get(nextPageUrl, {
          headers: this.getAdminHeaders()
        });

        allProducts = [...allProducts, ...pageResponse.data.products];
        pageCount++;
        console.log(`   Page ${pageCount}: Fetched ${pageResponse.data.products.length} products`);

        // Check for next page
        const pageLinkHeader = pageResponse.headers['link'];
        nextPageUrl = null;
        if (pageLinkHeader) {
          const nextPageMatch = pageLinkHeader.match(/<([^>]+)>;\s*rel="next"/);
          if (nextPageMatch) {
            nextPageUrl = nextPageMatch[1];
          }
        }
      }

      console.log(`✅ Total products fetched: ${allProducts.length}`);

      // Debug first product
      if (allProducts.length > 0) {
        const firstProduct = allProducts[0];
        console.log('   First product title:', firstProduct.title);
        console.log('   Has images?', !!firstProduct.images && firstProduct.images.length > 0);
        if (firstProduct.images && firstProduct.images.length > 0) {
          console.log('   ✅ FIRST IMAGE SRC:', firstProduct.images[0].src);
        }
      }

      // If locationId is provided, fetch inventory levels and filter products
      if (locationId) {
        console.log(`📦 Filtering products for location: ${locationId}`);
        
        // Create a map of inventory item ID to quantity for this location
        const inventoryMap = new Map();
        
        // Fetch inventory levels for all variants
        for (const product of allProducts) {
          if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
              if (variant.inventory_item_id) {
                try {
                  const invResponse = await axios.get(
                    `${this.adminAPIURL}/inventory_levels.json`,
                    {
                      headers: this.getAdminHeaders(),
                      params: {
                        inventory_item_ids: variant.inventory_item_id,
                        location_ids: locationId
                      }
                    }
                  );
                  
                  if (invResponse.data.inventory_levels && invResponse.data.inventory_levels.length > 0) {
                    const level = invResponse.data.inventory_levels[0];
                    inventoryMap.set(variant.inventory_item_id, level.available || 0);
                    variant.location_inventory = level.available || 0;
                  } else {
                    variant.location_inventory = 0;
                  }
                } catch (err) {
                  console.error(`Error fetching inventory for variant ${variant.id}:`, err.message);
                  variant.location_inventory = 0;
                }
              }
            }
          }
        }

        // Filter out products with 0 stock at this location
        allProducts = allProducts.filter(product => {
          if (!product.variants || product.variants.length === 0) return false;
          
          // Check if ANY variant has stock > 0 at this location
          const hasStock = product.variants.some(v => (v.location_inventory || 0) > 0);
          return hasStock;
        });

        console.log(`✅ After location filtering: ${allProducts.length} products available at location ${locationId}`);
      }

      return {
        success: true,
        products: allProducts,
        count: allProducts.length
      };
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Get single product by ID
  async getProduct(productId) {
    try {
      const response = await axios.get(`${this.adminAPIURL}/products/${productId}.json`, {
        headers: this.getAdminHeaders()
      });

      return {
        success: true,
        product: response.data.product
      };
    } catch (error) {
      console.error('Error fetching product:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Create product in Shopify
  async createProduct(productData) {
    try {
      const response = await axios.post(`${this.adminAPIURL}/products.json`, {
        product: productData
      }, {
        headers: this.getAdminHeaders()
      });

      return {
        success: true,
        product: response.data.product
      };
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Update product in Shopify
  async updateProduct(productId, productData) {
    try {
      const response = await axios.put(`${this.adminAPIURL}/products/${productId}.json`, {
        product: productData
      }, {
        headers: this.getAdminHeaders()
      });

      return {
        success: true,
        product: response.data.product
      };
    } catch (error) {
      console.error('Error updating product:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Get orders from Shopify
  async getOrders(limit = 50, status = 'any') {
    try {
      const response = await axios.get(`${this.adminAPIURL}/orders.json`, {
        headers: this.getAdminHeaders(),
        params: {
          limit,
          status,
          fields: 'id,name,email,created_at,updated_at,financial_status,fulfillment_status,total_price,currency,line_items'
        }
      });

      return {
        success: true,
        orders: response.data.orders,
        count: response.data.orders.length
      };
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Create order in Shopify
  async createOrder(orderData) {
    try {
      // Split customer name properly
      const nameParts = orderData.customerName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'User'; // Default to 'User' if no last name
      
      // Format phone number for Shopify - only accept perfectly formatted numbers
      let formattedPhone = null;
      if (orderData.customerPhone) {
        let phone = orderData.customerPhone.toString().replace(/[\s\-\(\)\+]/g, '');
        // Only accept if it's exactly 10 digits
        if (phone.length === 10 && /^\d{10}$/.test(phone)) {
          formattedPhone = '+91' + phone;
        }
        // If not exactly 10 digits, we skip adding phone number entirely
      }
      
      // Format order data for Shopify API
      const shopifyOrder = {
        line_items: orderData.items.map(item => ({
          title: String(item.title || 'Product'),
          price: String(item.price || 0),
          quantity: parseInt(item.quantity) || 1,
          sku: String(item.sku || ''),
          requires_shipping: false,
          taxable: true,
          tax_lines: item.gstRate ? [{
            title: `GST ${item.gstRate}%`,
            price: String((item.price * item.quantity * (item.gstRate / 100)).toFixed(2)),
            rate: String((item.gstRate / 100).toFixed(4))
          }] : []
        })),
        customer: (() => {
          const customer = {
            first_name: firstName,
            last_name: lastName,
            email: orderData.customerEmail || 'customer@possystem.com',
            verified_email: false
          };
          // Only add phone if it's valid
          if (formattedPhone) {
            customer.phone = formattedPhone;
          }
          return customer;
        })(),
        billing_address: orderData.billingAddress ? (() => {
          const address = {
            first_name: firstName,
            last_name: lastName,
            address1: orderData.billingAddress.address1 || orderData.customerAddress || '',
            city: orderData.billingAddress.city || orderData.location?.city || '',
            province: orderData.billingAddress.province || orderData.location?.state || '',
            country: orderData.billingAddress.country || 'IN',
            zip: orderData.billingAddress.zip || ''
          };
          if (formattedPhone) address.phone = formattedPhone;
          return address;
        })() : undefined,
        shipping_address: orderData.shippingAddress ? (() => {
          const address = {
            first_name: firstName,
            last_name: lastName,
            address1: orderData.shippingAddress.address1 || orderData.customerAddress || '',
            city: orderData.shippingAddress.city || orderData.location?.city || '',
            province: orderData.shippingAddress.province || orderData.location?.state || '',
            country: orderData.shippingAddress.country || 'IN',
            zip: orderData.shippingAddress.zip || ''
          };
          if (formattedPhone) address.phone = formattedPhone;
          return address;
        })() : undefined,
        financial_status: 'paid',
        fulfillment_status: null,
        note: orderData.notes || `Order created via POS System - Invoice: ${orderData.invoiceNumber}`,
        note_attributes: [
          { name: 'POS Invoice Number', value: orderData.invoiceNumber || '' },
          { name: 'Payment Method', value: orderData.paymentMethod || 'Cash' },
          { name: 'Location', value: `${orderData.location?.city || 'N/A'}, ${orderData.location?.state || 'N/A'}` },
          { name: 'Created By', value: typeof orderData.createdBy === 'string' ? orderData.createdBy : orderData.createdBy?.email || orderData.createdBy?.firstName || 'POS User' }
        ].filter(attr => attr.value),  // Remove any attributes with empty values
        tags: 'POS, ' + (orderData.location?.city || ''),
        currency: 'INR',
        total_price: String(orderData.total || 0),
        subtotal_price: String(orderData.subtotal || 0),
        total_tax: String(orderData.tax || 0),
        transactions: [{
          kind: 'sale',
          status: 'success',
          amount: String(orderData.total || 0),
          gateway: String(orderData.paymentMethod || 'cash')
        }],
        processed_at: new Date().toISOString(),
        send_receipt: false,
        send_fulfillment_receipt: false
      };

      const response = await axios.post(`${this.adminAPIURL}/orders.json`, {
        order: shopifyOrder
      }, {
        headers: this.getAdminHeaders()
      });

      return {
        success: true,
        order: response.data.order,
        message: 'Order created successfully in Shopify'
      };
    } catch (error) {
      console.error('Error creating order in Shopify:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message,
        details: error.response?.data
      };
    }
  }

  // Get shop information
  async getShopInfo() {
    try {
      const response = await axios.get(`${this.adminAPIURL}/shop.json`, {
        headers: this.getAdminHeaders()
      });

      return {
        success: true,
        shop: response.data.shop
      };
    } catch (error) {
      console.error('Error fetching shop info:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Sync products from Shopify to POS system
  async syncProducts() {
    try {
      const productsResult = await this.getProducts(250); // Get up to 250 products
      
      if (!productsResult.success) {
        return productsResult;
      }

      const syncedProducts = productsResult.products.map(product => ({
        shopifyId: product.id,
        name: product.title,
        description: product.body_html,
        handle: product.handle,
        vendor: product.vendor,
        productType: product.product_type,
        status: product.status,
        images: product.images?.map(img => ({
          src: img.src,
          alt: img.alt || product.title
        })) || [],
        variants: product.variants?.map(variant => ({
          shopifyId: variant.id,
          title: variant.title,
          price: parseFloat(variant.price),
          compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
          sku: variant.sku,
          inventory: variant.inventory_quantity,
          weight: variant.weight,
          weightUnit: variant.weight_unit
        })) || [],
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));

      return {
        success: true,
        products: syncedProducts,
        count: syncedProducts.length,
        message: `Successfully synced ${syncedProducts.length} products from Shopify`
      };
    } catch (error) {
      console.error('Error syncing products:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get inventory levels
  async getInventoryLevels(locationId = null) {
    try {
      const params = { limit: 250 };
      if (locationId) {
        params.location_ids = locationId;
      }

      const response = await axios.get(`${this.adminAPIURL}/inventory_levels.json`, {
        headers: this.getAdminHeaders(),
        params
      });

      return {
        success: true,
        inventoryLevels: response.data.inventory_levels
      };
    } catch (error) {
      console.error('Error fetching inventory levels:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }

  // Get locations
  async getLocations() {
    try {
      const response = await axios.get(`${this.adminAPIURL}/locations.json`, {
        headers: this.getAdminHeaders()
      });

      return {
        success: true,
        locations: response.data.locations
      };
    } catch (error) {
      console.error('Error fetching locations:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }
}

module.exports = new ShopifyService();
