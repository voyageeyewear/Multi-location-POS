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
        
        // Collect all inventory_item_ids first
        const inventoryItemIds = [];
        for (const product of allProducts) {
          if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
              if (variant.inventory_item_id) {
                inventoryItemIds.push(variant.inventory_item_id);
              }
            }
          }
        }

        console.log(`📊 Found ${inventoryItemIds.length} inventory items to check`);

        // Batch inventory requests (Shopify allows up to 50 IDs per request)
        const batchSize = 50;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        for (let i = 0; i < inventoryItemIds.length; i += batchSize) {
          const batch = inventoryItemIds.slice(i, i + batchSize);
          
          try {
            console.log(`📦 Fetching inventory batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(inventoryItemIds.length / batchSize)}`);
            
            const invResponse = await axios.get(
              `${this.adminAPIURL}/inventory_levels.json`,
              {
                headers: this.getAdminHeaders(),
                params: {
                  inventory_item_ids: batch.join(','),
                  location_ids: locationId,
                  limit: 250
                }
              }
            );
            
            // Map inventory levels
            if (invResponse.data.inventory_levels) {
              invResponse.data.inventory_levels.forEach(level => {
                inventoryMap.set(level.inventory_item_id, level.available || 0);
              });
            }
            
            // Rate limit: Wait 500ms between batches to avoid hitting Shopify's 2 calls/second limit
            if (i + batchSize < inventoryItemIds.length) {
              await delay(500);
            }
          } catch (err) {
            console.error(`Error fetching inventory batch:`, err.message);
          }
        }

        console.log(`✅ Fetched inventory for ${inventoryMap.size} items`);

        // Apply inventory to variants
        for (const product of allProducts) {
          if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
              if (variant.inventory_item_id) {
                variant.location_inventory = inventoryMap.get(variant.inventory_item_id) || 0;
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

  // Get all orders from Shopify with pagination and enrich with customer names
  async getOrders(limit = 250, status = 'any') {
    try {
      console.log(`📦 Fetching Shopify orders (status: ${status})...`);
      
      let allOrders = [];
      let pageInfo = null;
      let hasNextPage = true;
      
      while (hasNextPage) {
        const params = {
          limit: limit
        };
        
        // Only add status and order params for first page (not when page_info is present)
        if (!pageInfo) {
          params.status = status; // any, open, closed, cancelled
          params.order = 'created_at desc';
        } else {
          params.page_info = pageInfo;
        }
        
        const response = await axios.get(`${this.adminAPIURL}/orders.json`, {
          headers: this.getAdminHeaders(),
          params: params
        });
        
        if (response.data.orders && response.data.orders.length > 0) {
          allOrders = allOrders.concat(response.data.orders);
          console.log(`✅ Fetched ${response.data.orders.length} orders (total: ${allOrders.length})`);
          
          // Check for next page
          const linkHeader = response.headers.link;
          if (linkHeader && linkHeader.includes('rel="next"')) {
            const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
            if (nextMatch) {
              const nextUrl = new URL(nextMatch[1]);
              pageInfo = nextUrl.searchParams.get('page_info');
            } else {
              hasNextPage = false;
            }
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }
        
        // Rate limit: Wait 500ms between requests
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`✅ Total orders fetched: ${allOrders.length}`);
      
      // Fetch all customers to create a customer ID -> name mapping
      console.log('\n🔍 Fetching all customers for name mapping...');
      const customersResult = await this.getCustomers(250);
      const customerMap = {};
      
      if (customersResult.success && customersResult.customers) {
        customersResult.customers.forEach(customer => {
          if (customer.id) {
            let customerName = '';
            
            // Try display_name first (GraphQL gives us this!)
            if (customer.display_name) {
              customerName = customer.display_name.trim();
            }
            // Try first_name + last_name
            else if (customer.first_name || customer.last_name) {
              customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
            }
            // Try email
            else if (customer.email) {
              customerName = customer.email.split('@')[0];
            }
            
            // Fallback
            customerMap[customer.id] = customerName || 'Guest';
          }
        });
        console.log(`✅ Created customer mapping for ${Object.keys(customerMap).length} customers`);
        
        // Debug: Show first 10 customer mappings
        const sampleMappings = Object.entries(customerMap).slice(0, 10);
        console.log('📊 Sample customer mappings:', sampleMappings);
      }
      
      // Enrich orders with customer names
      console.log('\n🔍 Enriching orders with customer names...');
      let matchedCount = 0;
      let unmatchedCount = 0;
      
      // Debug: Check first order's customer ID
      if (allOrders.length > 0 && allOrders[0].customer) {
        console.log('📊 First order customer ID:', allOrders[0].customer.id);
        console.log('📊 Is in map?', !!customerMap[allOrders[0].customer.id]);
        console.log('📊 Mapped name:', customerMap[allOrders[0].customer.id]);
      }
      
      for (let order of allOrders) {
        // Try to get customer name from customer ID mapping
        if (order.customer && order.customer.id && customerMap[order.customer.id]) {
          order.customerName = customerMap[order.customer.id];
          matchedCount++;
          continue;
        }
        unmatchedCount++;
        
        // Try shipping address
        if (order.shipping_address) {
          order.customerName = order.shipping_address.name || 
                              `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim();
          if (order.customerName) continue;
        }
        
        // Try billing address
        if (order.billing_address) {
          order.customerName = order.billing_address.name ||
                              `${order.billing_address.first_name || ''} ${order.billing_address.last_name || ''}`.trim();
          if (order.customerName) continue;
        }
        
        // Try customer object directly
        if (order.customer) {
          if (order.customer.first_name || order.customer.last_name) {
            order.customerName = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
            if (order.customerName) continue;
          }
        }
        
        // Try email
        if (order.contact_email || order.email) {
          const emailToUse = order.contact_email || order.email;
          order.customerName = emailToUse.split('@')[0];
          continue;
        }
        
        // Final fallback
        order.customerName = 'Guest';
      }
      
      console.log(`✅ Customer names enriched successfully!`);
      console.log(`📊 Stats: ${matchedCount} matched from customer map, ${unmatchedCount} used fallback`);
      
      return {
        success: true,
        orders: allOrders,
        count: allOrders.length
      };
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message,
        orders: []
      };
    }
  }

  // Get all customers from Shopify with pagination
  async getCustomers(limit = 250) {
    try {
      console.log('👥 Fetching Shopify customers via GraphQL...');
      
      const graphqlQuery = `
        query GetCustomers($first: Int!, $after: String) {
          customers(first: $first, after: $after) {
            edges {
              node {
                id
                displayName
                firstName
                lastName
                email
                phone
                numberOfOrders
                createdAt
                updatedAt
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;
      
      let allCustomers = [];
      let hasNextPage = true;
      let cursor = null;
      
      while (hasNextPage) {
        const response = await axios.post(
          `https://${this.shopDomain}/admin/api/2024-10/graphql.json`,
          {
            query: graphqlQuery,
            variables: {
              first: Math.min(limit, 250),
              after: cursor
            }
          },
          {
            headers: {
              'X-Shopify-Access-Token': this.accessToken,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.data && response.data.data.customers) {
          const customers = response.data.data.customers.edges.map(edge => {
            const node = edge.node;
            // Extract numeric ID from GraphQL ID
            const numericId = node.id.split('/').pop();
            return {
              id: parseInt(numericId),
              first_name: node.firstName,
              last_name: node.lastName,
              display_name: node.displayName,
              email: node.email,
              phone: node.phone,
              orders_count: node.numberOfOrders,
              created_at: node.createdAt,
              updated_at: node.updatedAt
            };
          });
          
          allCustomers = allCustomers.concat(customers);
          console.log(`✅ Fetched ${customers.length} customers (total: ${allCustomers.length})`);
          
          hasNextPage = response.data.data.customers.pageInfo.hasNextPage;
          cursor = response.data.data.customers.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
        
        // Rate limit: Wait 500ms between requests
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`✅ Total customers fetched: ${allCustomers.length}`);
      
      // Debug: Log first customer
      if (allCustomers.length > 0) {
        console.log('\n🔍 First customer from GraphQL:');
        console.log('display_name:', allCustomers[0].display_name);
        console.log('first_name:', allCustomers[0].first_name);
        console.log('last_name:', allCustomers[0].last_name);
      }
      
      return {
        success: true,
        customers: allCustomers,
        count: allCustomers.length
      };
    } catch (error) {
      console.error('Error fetching customers via GraphQL:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || error.message,
        customers: []
      };
    }
  }
}

module.exports = new ShopifyService();
