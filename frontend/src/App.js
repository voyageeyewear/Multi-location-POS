import React, { useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // Simple demo login
    const demoUser = {
      id: '1',
      firstName: 'Super',
      lastName: 'Admin',
      role: { name: 'super_admin' }
    };
    setUser(demoUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    
    if (page === 'products') {
      loadShopifyProducts();
    }
  };

  const loadShopifyProducts = async () => {
    setLoading(true);
    try {
      // Try to fetch from real Shopify API first
      const response = await fetch('http://localhost:8000/api/shopify/products', {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.products) {
          console.log(`Successfully loaded ${data.data.count} products from Shopify!`);
          // Transform Shopify products to our format
          const transformedProducts = data.data.products.map(product => ({
            id: product.id,
            title: product.title,
            vendor: product.vendor || 'Voyage Eyewear',
            product_type: product.product_type || 'Eyewear',
            status: product.status,
            price: product.variants && product.variants[0] ? `₹${parseFloat(product.variants[0].price).toFixed(2)}` : '₹0.00',
            inventory: product.variants && product.variants[0] ? product.variants[0].inventory_quantity || 0 : 0,
            image: product.images && product.images[0] ? product.images[0].src : 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Eyewear'
          }));
          
          setProducts(transformedProducts);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to demo products if API fails
      console.log('Using demo products - Shopify API not available');
      const demoProducts = [
        {
          id: '1',
          title: 'Classic Eyewear Frame',
          vendor: 'GoEye',
          product_type: 'Eyewear',
          status: 'active',
          price: '$129.99',
          inventory: 25,
          image: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Eyewear'
        },
        {
          id: '2',
          title: 'Premium Sunglasses',
          vendor: 'GoEye',
          product_type: 'Sunglasses',
          status: 'active',
          price: '$199.99',
          inventory: 15,
          image: 'https://via.placeholder.com/200x200/10b981/ffffff?text=Sunglasses'
        },
        {
          id: '3',
          title: 'Blue Light Glasses',
          vendor: 'GoEye',
          product_type: 'Eyewear',
          status: 'active',
          price: '$89.99',
          inventory: 30,
          image: 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Blue+Light'
        },
        {
          id: '4',
          title: 'Reading Glasses',
          vendor: 'GoEye',
          product_type: 'Eyewear',
          status: 'active',
          price: '$59.99',
          inventory: 20,
          image: 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Reading'
        },
        {
          id: '5',
          title: 'Designer Sunglasses',
          vendor: 'GoEye',
          product_type: 'Sunglasses',
          status: 'active',
          price: '$299.99',
          inventory: 8,
          image: 'https://via.placeholder.com/200x200/ec4899/ffffff?text=Designer'
        },
        {
          id: '6',
          title: 'Sports Eyewear',
          vendor: 'GoEye',
          product_type: 'Sports',
          status: 'active',
          price: '$179.99',
          inventory: 12,
          image: 'https://via.placeholder.com/200x200/06b6d4/ffffff?text=Sports'
        }
      ];
      
      setTimeout(() => {
        setProducts(demoProducts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>POS System Login</h1>
          <div className="demo-info">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: superadmin@possystem.com</p>
            <p>Password: admin123</p>
          </div>
          <button onClick={handleLogin} className="login-btn">
            Login (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>POS System</h2>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <p>{user.firstName} {user.lastName}</p>
          <p className="user-role">{user.role.name}</p>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => handleNavigation('dashboard')} className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}>Dashboard</button>
          <button onClick={() => handleNavigation('products')} className={`nav-item ${currentPage === 'products' ? 'active' : ''}`}>Products</button>
          <button onClick={() => handleNavigation('locations')} className={`nav-item ${currentPage === 'locations' ? 'active' : ''}`}>Locations</button>
          <button onClick={() => handleNavigation('sales')} className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}>Sales</button>
          <button onClick={() => handleNavigation('reports')} className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}>Reports</button>
          <button onClick={() => handleNavigation('data')} className={`nav-item ${currentPage === 'data' ? 'active' : ''}`}>Data Management</button>
          <button onClick={() => handleNavigation('users')} className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}>Users</button>
          <button onClick={() => handleNavigation('companies')} className={`nav-item ${currentPage === 'companies' ? 'active' : ''}`}>Companies</button>
          <button onClick={() => handleNavigation('roles')} className={`nav-item ${currentPage === 'roles' ? 'active' : ''}`}>Roles</button>
          <button onClick={() => handleNavigation('shopify')} className={`nav-item ${currentPage === 'shopify' ? 'active' : ''}`}>Shopify Sync</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </div>

      <div className="main-content">
        {currentPage === 'dashboard' && (
          <>
            <div className="content-header">
              <h1>Dashboard</h1>
              <p>Welcome back, {user.firstName}!</p>
            </div>

            <div className="dashboard-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Today's Sales</h3>
                  <p className="stat-value">$0.00</p>
                </div>
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <p className="stat-value">{products.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Locations</h3>
                  <p className="stat-value">0</p>
                </div>
              </div>

              <div className="welcome-section">
                <h2>Quick Actions</h2>
                <p>Use the sidebar menu to navigate to different sections:</p>
                <div className="action-tags">
                  <span className="tag">Products</span>
                  <span className="tag">Locations</span>
                  <span className="tag">Sales</span>
                  <span className="tag">Reports</span>
                  <span className="tag">Data Management</span>
                  <span className="tag">Roles</span>
                </div>
              </div>
            </div>
          </>
        )}

        {currentPage === 'products' && (
          <>
            <div className="content-header">
              <h1>Products</h1>
              <p>Your Shopify products synchronized with POS system</p>
              <button onClick={loadShopifyProducts} className="sync-btn" disabled={loading}>
                {loading ? 'Syncing...' : 'Sync from Shopify'}
              </button>
            </div>

            <div className="products-content">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading products from Shopify...</p>
                </div>
              ) : (
                <>
                  <div className="products-header">
                    <div className="products-stats">
                      <span className="products-count">Total Products: {products.length}</span>
                      <span className="shopify-badge">🔗 Synced from Shopify</span>
                    </div>
                  </div>

                  <div className="products-grid">
                    {products.map((product) => (
                      <div key={product.id} className="product-card">
                        <div className="product-image">
                          <img src={product.image} alt={product.title} />
                          <div className="product-status">{product.status}</div>
                        </div>
                        <div className="product-info">
                          <h3 className="product-title">{product.title}</h3>
                          <p className="product-vendor">{product.vendor}</p>
                          <p className="product-type">{product.product_type}</p>
                          <div className="product-details">
                            <span className="product-price">{product.price}</span>
                            <span className="product-inventory">Stock: {product.inventory}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {products.length === 0 && (
                    <div className="empty-state">
                      <h3>No products found</h3>
                      <p>Click "Sync from Shopify" to load your products</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {currentPage !== 'dashboard' && currentPage !== 'products' && (
          <div className="content-header">
            <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            <p>This section is coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;