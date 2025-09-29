import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [salesData, setSalesData] = useState(null);
  const [salesFilter, setSalesFilter] = useState('all'); // all, defected, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [usersData, setUsersData] = useState(null);
  const [userFilter, setUserFilter] = useState('all'); // all, admin, client
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(undefined);

  const handleLogin = (role = 'admin') => {
    let demoUser;
    
    if (role === 'admin') {
      demoUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@possystem.com',
        role: { name: 'admin', permissions: { users: { create: true, read: true, update: true, delete: true } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '1'
      };
    } else if (role === 'client') {
      demoUser = {
        id: '2',
        firstName: 'Client',
        lastName: 'User',
        email: 'client@possystem.com',
        role: { name: 'client', permissions: { users: { create: false, read: false, update: false, delete: false } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '2'
      };
    }
    
    setUser(demoUser);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
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
    } else if (page === 'locations') {
      // Reset state selection and load data
      setSelectedState(null);
      setTimeout(() => {
        loadLocationData();
      }, 100);
    } else if (page === 'sales') {
      loadSalesData();
    } else if (page === 'users') {
      loadUsersData();
    }
  };

  const generateDateSpecificData = (dateType) => {
    let dateLabel = '';
    let multiplier = 1;
    
    switch(dateType) {
      case 'today':
        dateLabel = 'Today';
        multiplier = 1;
        break;
      case 'yesterday':
        dateLabel = 'Yesterday';
        multiplier = 1.2; // Yesterday had higher sales
        break;
      case 'custom':
        dateLabel = customDate ? new Date(customDate).toLocaleDateString() : 'Custom Date';
        multiplier = 0.9; // Custom date average
        break;
      default:
        dateLabel = 'Today';
        multiplier = 1;
    }

    return {
      dateLabel,
      multiplier
    };
  };

  const loadSalesData = () => {
    // Demo sales data with orders, customers, and defected items
    const demoSalesData = {
      orders: [
        {
          id: 'ORD-001',
          customerName: 'Rajesh Kumar',
          customerEmail: 'rajesh.kumar@email.com',
          customerPhone: '+91-9876543210',
          orderDate: '2024-09-29',
          status: 'completed',
          totalAmount: 2599,
          items: [
            {
              id: 'ITEM-001',
              productName: 'Voyage Wayfarer Eyeglasses',
              sku: 'VW-EYE-001',
              price: 1599,
              quantity: 1,
              isDefected: false,
              defectReason: null
            },
            {
              id: 'ITEM-002',
              productName: 'Premium Lens Coating',
              sku: 'PLC-001',
              price: 1000,
              quantity: 1,
              isDefected: false,
              defectReason: null
            }
          ],
          invoiceNumber: 'INV-2024-001',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'ORD-002',
          customerName: 'Priya Sharma',
          customerEmail: 'priya.sharma@email.com',
          customerPhone: '+91-9876543211',
          orderDate: '2024-09-28',
          status: 'defected',
          totalAmount: 3999,
          items: [
            {
              id: 'ITEM-003',
              productName: 'Celeste Silver Sunglasses',
              sku: 'CS-SUN-002',
              price: 2999,
              quantity: 1,
              isDefected: true,
              defectReason: 'Scratched lens surface'
            },
            {
              id: 'ITEM-004',
              productName: 'Premium Case',
              sku: 'PC-002',
              price: 1000,
              quantity: 1,
              isDefected: false,
              defectReason: null
            }
          ],
          invoiceNumber: 'INV-2024-002',
          paymentMethod: 'UPI'
        },
        {
          id: 'ORD-003',
          customerName: 'Amit Singh',
          customerEmail: 'amit.singh@email.com',
          customerPhone: '+91-9876543212',
          orderDate: '2024-09-27',
          status: 'completed',
          totalAmount: 4599,
          items: [
            {
              id: 'ITEM-005',
              productName: 'Hexagonal Polarized Sunglasses',
              sku: 'HP-SUN-003',
              price: 3599,
              quantity: 1,
              isDefected: false,
              defectReason: null
            },
            {
              id: 'ITEM-006',
              productName: 'Anti-Reflective Coating',
              sku: 'ARC-003',
              price: 1000,
              quantity: 1,
              isDefected: false,
              defectReason: null
            }
          ],
          invoiceNumber: 'INV-2024-003',
          paymentMethod: 'Cash'
        },
        {
          id: 'ORD-004',
          customerName: 'Sneha Patel',
          customerEmail: 'sneha.patel@email.com',
          customerPhone: '+91-9876543213',
          orderDate: '2024-09-26',
          status: 'defected',
          totalAmount: 1999,
          items: [
            {
              id: 'ITEM-007',
              productName: 'Classic Black Eyeglasses',
              sku: 'CB-EYE-004',
              price: 1999,
              quantity: 1,
              isDefected: true,
              defectReason: 'Frame misalignment'
            }
          ],
          invoiceNumber: 'INV-2024-004',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'ORD-005',
          customerName: 'Vikram Joshi',
          customerEmail: 'vikram.joshi@email.com',
          customerPhone: '+91-9876543214',
          orderDate: '2024-09-25',
          status: 'completed',
          totalAmount: 7999,
          items: [
            {
              id: 'ITEM-008',
              productName: 'Premium Gold Sunglasses',
              sku: 'PG-SUN-005',
              price: 6999,
              quantity: 1,
              isDefected: false,
              defectReason: null
            },
            {
              id: 'ITEM-009',
              productName: 'Premium Case + Cleaning Kit',
              sku: 'PCK-005',
              price: 1000,
              quantity: 1,
              isDefected: false,
              defectReason: null
            }
          ],
          invoiceNumber: 'INV-2024-005',
          paymentMethod: 'UPI'
        }
      ],
      stats: {
        totalOrders: 5,
        completedOrders: 3,
        defectedOrders: 2,
        totalRevenue: 21195,
        defectedRevenue: 5998,
        averageOrderValue: 4239
      }
    };
    
    setSalesData(demoSalesData);
  };

  const loadUsersData = () => {
    // Demo users data with different roles and permissions
    const demoUsersData = {
      users: [
        {
          id: '1',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@possystem.com',
          phone: '+91-9876543210',
          role: 'super_admin',
          permissions: {
            users: { create: true, read: true, update: true, delete: true, hidden: false },
            products: { create: true, read: true, update: true, delete: true, hidden: false },
            sales: { create: true, read: true, update: true, delete: true, hidden: false },
            locations: { create: true, read: true, update: true, delete: true, hidden: false },
            reports: { create: true, read: true, update: true, delete: true, hidden: false }
          },
          status: 'active',
          createdAt: '2024-01-15',
          lastLogin: '2024-09-29',
          location: 'Mumbai'
        },
        {
          id: '2',
          firstName: 'Rajesh',
          lastName: 'Kumar',
          email: 'rajesh.kumar@possystem.com',
          phone: '+91-9876543211',
          role: 'admin',
          permissions: {
            users: { create: true, read: true, update: true, delete: false, hidden: false },
            products: { create: true, read: true, update: true, delete: false, hidden: false },
            sales: { create: true, read: true, update: true, delete: false, hidden: false },
            locations: { create: false, read: true, update: false, delete: false, hidden: false },
            reports: { create: true, read: true, update: false, delete: false, hidden: false }
          },
          status: 'active',
          createdAt: '2024-02-20',
          lastLogin: '2024-09-28',
          location: 'Pune'
        },
        {
          id: '3',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@possystem.com',
          phone: '+91-9876543212',
          role: 'client',
          permissions: {
            users: { create: false, read: true, update: false, delete: false, hidden: false },
            products: { create: false, read: true, update: false, delete: false, hidden: false },
            sales: { create: false, read: true, update: false, delete: false, hidden: false },
            locations: { create: false, read: true, update: false, delete: false, hidden: false },
            reports: { create: false, read: true, update: false, delete: false, hidden: false }
          },
          status: 'active',
          createdAt: '2024-03-10',
          lastLogin: '2024-09-27',
          location: 'Nagpur'
        },
        {
          id: '4',
          firstName: 'Amit',
          lastName: 'Singh',
          email: 'amit.singh@possystem.com',
          phone: '+91-9876543213',
          role: 'client',
          permissions: {
            users: { create: false, read: false, update: false, delete: false, hidden: true },
            products: { create: false, read: true, update: false, delete: false, hidden: false },
            sales: { create: false, read: true, update: false, delete: false, hidden: false },
            locations: { create: false, read: false, update: false, delete: false, hidden: true },
            reports: { create: false, read: false, update: false, delete: false, hidden: true }
          },
          status: 'active',
          createdAt: '2024-04-05',
          lastLogin: '2024-09-26',
          location: 'Nashik'
        },
        {
          id: '5',
          firstName: 'Sneha',
          lastName: 'Patel',
          email: 'sneha.patel@possystem.com',
          phone: '+91-9876543214',
          role: 'client',
          permissions: {
            users: { create: false, read: true, update: false, delete: false, hidden: false },
            products: { create: false, read: true, update: false, delete: false, hidden: false },
            sales: { create: false, read: true, update: false, delete: false, hidden: false },
            locations: { create: false, read: true, update: false, delete: false, hidden: false },
            reports: { create: false, read: true, update: false, delete: false, hidden: false }
          },
          status: 'inactive',
          createdAt: '2024-05-12',
          lastLogin: '2024-09-20',
          location: 'Thane'
        },
        {
          id: '6',
          firstName: 'Vikram',
          lastName: 'Joshi',
          email: 'vikram.joshi@possystem.com',
          phone: '+91-9876543215',
          role: 'client',
          permissions: {
            users: { create: false, read: false, update: false, delete: false, hidden: true },
            products: { create: false, read: true, update: false, delete: false, hidden: false },
            sales: { create: false, read: false, update: false, delete: false, hidden: true },
            locations: { create: false, read: false, update: false, delete: false, hidden: true },
            reports: { create: false, read: false, update: false, delete: false, hidden: true }
          },
          status: 'active',
          createdAt: '2024-06-18',
          lastLogin: '2024-09-25',
          location: 'Aurangabad'
        }
      ],
      stats: {
        totalUsers: 6,
        activeUsers: 5,
        inactiveUsers: 1,
        adminUsers: 2,
        clientUsers: 4
      }
    };
    
    setUsersData(demoUsersData);
  };

  const loadLocationData = () => {
    const { dateLabel, multiplier } = generateDateSpecificData(selectedDate);
    
    // Demo location data with state-wise sales analytics
    const demoLocationData = {
      states: [
        {
          id: 'maharashtra',
          name: 'Maharashtra',
          cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
          totalSales: Math.round(2450000 * multiplier),
          totalOrders: Math.round(1250 * multiplier),
          avgOrderValue: 1960,
          topProducts: [
            { name: 'Voyage Wayfarer Eyeglasses', sales: Math.round(450000 * multiplier), units: Math.round(230 * multiplier) },
            { name: 'Celeste Silver Sunglasses', sales: Math.round(380000 * multiplier), units: Math.round(195 * multiplier) },
            { name: 'Hexagonal Polarized Sunglasses', sales: Math.round(320000 * multiplier), units: Math.round(165 * multiplier) }
          ],
          monthlyGrowth: 12.5,
          customerCount: Math.round(890 * multiplier)
        },
        {
          id: 'karnataka',
          name: 'Karnataka',
          cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
          totalSales: Math.round(1890000 * multiplier),
          totalOrders: Math.round(980 * multiplier),
          avgOrderValue: 1928,
          topProducts: [
            { name: 'Rimless Sunglasses', sales: Math.round(320000 * multiplier), units: Math.round(165 * multiplier) },
            { name: 'Blue Light Glasses', sales: Math.round(280000 * multiplier), units: Math.round(145 * multiplier) },
            { name: 'Voyage Black Rectangle', sales: Math.round(250000 * multiplier), units: Math.round(128 * multiplier) }
          ],
          monthlyGrowth: 8.3,
          customerCount: Math.round(720 * multiplier)
        },
        {
          id: 'tamil-nadu',
          name: 'Tamil Nadu',
          cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
          totalSales: Math.round(1560000 * multiplier),
          totalOrders: Math.round(820 * multiplier),
          avgOrderValue: 1902,
          topProducts: [
            { name: 'Sable Silver Oval Sunglasses', sales: Math.round(290000 * multiplier), units: Math.round(150 * multiplier) },
            { name: 'Reading Glasses', sales: Math.round(260000 * multiplier), units: Math.round(135 * multiplier) },
            { name: 'Designer Sunglasses', sales: Math.round(240000 * multiplier), units: Math.round(125 * multiplier) }
          ],
          monthlyGrowth: 15.2,
          customerCount: Math.round(650 * multiplier)
        },
        {
          id: 'gujarat',
          name: 'Gujarat',
          cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
          totalSales: Math.round(1320000 * multiplier),
          totalOrders: Math.round(680 * multiplier),
          avgOrderValue: 1941,
          topProducts: [
            { name: 'Sports Eyewear', sales: Math.round(280000 * multiplier), units: Math.round(145 * multiplier) },
            { name: 'Classic Eyewear Frame', sales: Math.round(240000 * multiplier), units: Math.round(125 * multiplier) },
            { name: 'Premium Sunglasses', sales: Math.round(220000 * multiplier), units: Math.round(115 * multiplier) }
          ],
          monthlyGrowth: 9.8,
          customerCount: Math.round(580 * multiplier)
        },
        {
          id: 'delhi',
          name: 'Delhi',
          cities: ['New Delhi', 'Central Delhi', 'East Delhi', 'West Delhi'],
          totalSales: Math.round(2100000 * multiplier),
          totalOrders: Math.round(1150 * multiplier),
          avgOrderValue: 1826,
          topProducts: [
            { name: 'Voyage Wayfarer Eyeglasses', sales: Math.round(420000 * multiplier), units: Math.round(215 * multiplier) },
            { name: 'Celeste Silver Sunglasses', sales: Math.round(380000 * multiplier), units: Math.round(195 * multiplier) },
            { name: 'Hexagonal Polarized Sunglasses', sales: Math.round(340000 * multiplier), units: Math.round(175 * multiplier) }
          ],
          monthlyGrowth: 18.7,
          customerCount: Math.round(920 * multiplier)
        }
      ],
      totalStats: {
        totalSales: Math.round(9320000 * multiplier),
        totalOrders: Math.round(4880 * multiplier),
        totalCustomers: Math.round(3760 * multiplier),
        avgOrderValue: 1909,
        monthlyGrowth: 12.9
      },
      dateInfo: {
        label: dateLabel,
        type: selectedDate
      }
    };
    
    setLocationData(demoLocationData);
  };

  const handleStateSelection = (state) => {
    setSelectedState(state);
  };

  const handleDateChange = (dateType) => {
    setSelectedDate(dateType);
    setSelectedState(null); // Reset state selection when date changes
    // Force reload data with new date
    setTimeout(() => {
      loadLocationData();
    }, 100);
  };

  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    if (selectedDate === 'custom') {
      setSelectedState(null);
      setTimeout(() => {
        loadLocationData();
      }, 100);
    }
  };

  // Ensure data loads when selectedDate changes
  useEffect(() => {
    if (currentPage === 'locations' && selectedDate) {
      loadLocationData();
    }
  }, [selectedDate, customDate, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter and search functions for sales
  const getFilteredOrders = () => {
    if (!salesData) return [];
    
    let filtered = salesData.orders;
    
    // Apply status filter
    if (salesFilter === 'defected') {
      filtered = filtered.filter(order => order.status === 'defected');
    } else if (salesFilter === 'completed') {
      filtered = filtered.filter(order => order.status === 'completed');
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  const handleSalesFilterChange = (filter) => {
    setSalesFilter(filter);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // User management functions
  const getFilteredUsers = () => {
    if (!usersData) return [];
    
    let filtered = usersData.users;
    
    // Apply role filter
    if (userFilter === 'admin') {
      filtered = filtered.filter(user => user.role === 'admin' || user.role === 'super_admin');
    } else if (userFilter === 'client') {
      filtered = filtered.filter(user => user.role === 'client');
    }
    
    // Apply search filter
    if (userSearchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.phone.includes(userSearchTerm) ||
        user.location.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleUserFilterChange = (filter) => {
    setUserFilter(filter);
  };

  const handleUserSearchChange = (term) => {
    setUserSearchTerm(term);
  };


  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // In a real app, this would make an API call
      console.log('Deleting user:', userId);
      // For demo, just reload the data
      loadUsersData();
    }
  };

  const handleToggleUserStatus = (userId) => {
    // In a real app, this would make an API call
    console.log('Toggling user status:', userId);
    // For demo, just reload the data
    loadUsersData();
  };

  const handleCloseUserForm = () => {
    setEditingUser(null);
  };

  const handleSaveUser = (userData) => {
    // In a real app, this would make an API call
    console.log('Saving user:', userData);
    // For demo, just reload the data
    loadUsersData();
    setEditingUser(null);
  };

  const handleCreateLocation = () => {
    setEditingLocation(null);
  };


  const handleCloseLocationForm = () => {
    setEditingLocation(undefined);
  };

  const handleSaveLocation = (locationData) => {
    // In a real app, this would make an API call
    console.log('Saving location:', locationData);
    // For demo, just reload the data
    loadLocationData();
    setEditingLocation(undefined);
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
            <p><strong>Choose Your Role:</strong></p>
          </div>
          <div className="account-options">
            <div className="account-card" onClick={() => handleLogin('admin')}>
              <div className="account-icon">👑</div>
              <h3>Admin Account</h3>
              <p>Full access to all features</p>
              <div className="account-details">
                <p><strong>Email:</strong> admin@possystem.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
            <div className="account-card" onClick={() => handleLogin('client')}>
              <div className="account-icon">👤</div>
              <h3>Client Account</h3>
              <p>Limited access for sales operations</p>
              <div className="account-details">
                <p><strong>Email:</strong> client@possystem.com</p>
                <p><strong>Password:</strong> client123</p>
              </div>
            </div>
          </div>
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
          
          {user?.role?.name === 'admin' && (
            <>
              <button onClick={() => handleNavigation('products')} className={`nav-item ${currentPage === 'products' ? 'active' : ''}`}>Products</button>
              <button onClick={() => handleNavigation('locations')} className={`nav-item ${currentPage === 'locations' ? 'active' : ''}`}>Locations</button>
              <button onClick={() => handleNavigation('sales')} className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}>Sales</button>
              <button onClick={() => handleNavigation('reports')} className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}>Reports</button>
              <button onClick={() => handleNavigation('data')} className={`nav-item ${currentPage === 'data' ? 'active' : ''}`}>Data Management</button>
              <button onClick={() => handleNavigation('users')} className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}>Users</button>
              <button onClick={() => handleNavigation('roles')} className={`nav-item ${currentPage === 'roles' ? 'active' : ''}`}>Roles</button>
            </>
          )}
          
          {user?.role?.name === 'client' && (
            <>
              <button onClick={() => handleNavigation('sales')} className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}>Sales</button>
              <button onClick={() => handleNavigation('pos')} className={`nav-item ${currentPage === 'pos' ? 'active' : ''}`}>POS</button>
            </>
          )}
          
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

        {currentPage === 'locations' && (
          <>
            <div className="content-header">
              <h1>Locations & Analytics</h1>
              <p>State-wise sales performance and analytics</p>
              
              {/* Date Filter */}
              <div className="date-filters">
                <div className="filter-group">
                  <label>Filter by Date:</label>
                  <div className="date-buttons">
                    <button 
                      className={`date-btn ${selectedDate === 'yesterday' ? 'active' : ''}`}
                      onClick={() => handleDateChange('yesterday')}
                    >
                      Yesterday
                    </button>
                    <button 
                      className={`date-btn ${selectedDate === 'today' ? 'active' : ''}`}
                      onClick={() => handleDateChange('today')}
                    >
                      Today
                    </button>
                    <button 
                      className={`date-btn ${selectedDate === 'custom' ? 'active' : ''}`}
                      onClick={() => handleDateChange('custom')}
                    >
                      Custom Date
                    </button>
                  </div>
                </div>
                
                {selectedDate === 'custom' && (
                  <div className="custom-date-group">
                    <label>Select Date:</label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      className="date-input"
                    />
                  </div>
                )}
                
                {locationData && (
                  <div className="current-date-display">
                    <span className="date-badge">
                      📅 Showing data for: <strong>{locationData.dateInfo.label}</strong>
                    </span>
                    <span className="debug-info" style={{fontSize: '0.75rem', color: '#6b7280', marginLeft: '1rem'}}>
                      (Selected: {selectedDate})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Add New Location Button */}
            <div className="action-group">
              <button onClick={handleCreateLocation} className="create-btn">
                ➕ Add New Location
              </button>
            </div>

            <div className="locations-content">
              {locationData ? (
                <>
                  {/* Overall Stats */}
                  <div className="overall-stats">
                    <div className="stat-card">
                      <h3>Total Sales</h3>
                      <p className="stat-value">₹{locationData.totalStats.totalSales.toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Orders</h3>
                      <p className="stat-value">{locationData.totalStats.totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Customers</h3>
                      <p className="stat-value">{locationData.totalStats.totalCustomers.toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Avg Order Value</h3>
                      <p className="stat-value">₹{locationData.totalStats.avgOrderValue}</p>
                    </div>
                  </div>

                  {/* State Selection */}
                  <div className="state-selection">
                    <h2>Select State to View Detailed Analytics</h2>
                    <div className="states-grid">
                      {locationData.states.map((state) => (
                        <div
                          key={state.id}
                          className={`state-card ${selectedState?.id === state.id ? 'selected' : ''}`}
                          onClick={() => handleStateSelection(state)}
                        >
                          <h3>{state.name}</h3>
                          <p>₹{state.totalSales.toLocaleString()} sales</p>
                          <p>{state.totalOrders} orders</p>
                          <p>{state.customerCount} customers</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* State Details */}
                  {selectedState && (
                    <div className="state-details">
                      <div className="state-header">
                        <h2>{selectedState.name} Analytics</h2>
                        <div className="growth-badge">
                          <span className="growth-text">+{selectedState.monthlyGrowth}% Monthly Growth</span>
                        </div>
                      </div>

                      <div className="state-stats">
                        <div className="stat-card">
                          <h4>Total Sales</h4>
                          <p className="stat-value">₹{selectedState.totalSales.toLocaleString()}</p>
                        </div>
                        <div className="stat-card">
                          <h4>Total Orders</h4>
                          <p className="stat-value">{selectedState.totalOrders.toLocaleString()}</p>
                        </div>
                        <div className="stat-card">
                          <h4>Avg Order Value</h4>
                          <p className="stat-value">₹{selectedState.avgOrderValue}</p>
                        </div>
                        <div className="stat-card">
                          <h4>Total Customers</h4>
                          <p className="stat-value">{selectedState.customerCount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="state-info-grid">
                        <div className="info-card">
                          <h3>Major Cities</h3>
                          <ul className="cities-list">
                            {selectedState.cities.map((city, index) => (
                              <li key={index}>{city}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="info-card">
                          <h3>Top Performing Products</h3>
                          <div className="top-products">
                            {selectedState.topProducts.map((product, index) => (
                              <div key={index} className="product-performance">
                                <div className="product-info">
                                  <h4>{product.name}</h4>
                                  <p>₹{product.sales.toLocaleString()} • {product.units} units</p>
                                </div>
                                <div className="performance-bar">
                                  <div 
                                    className="performance-fill" 
                                    style={{width: `${(product.sales / selectedState.topProducts[0].sales) * 100}%`}}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading location data...</p>
                </div>
              )}
            </div>
          </>
        )}

        {currentPage === 'sales' && (
          <>
            <div className="content-header">
              <h1>🛒 Sales & Orders Management</h1>
              <p>View and manage all orders, customers, and defected items</p>
              
              <div className="sales-filters">
                <div className="filter-group">
                  <label>Filter Orders:</label>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${salesFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleSalesFilterChange('all')}
                    >
                      All Orders ({salesData?.stats.totalOrders || 0})
                    </button>
                    <button 
                      className={`filter-btn ${salesFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => handleSalesFilterChange('completed')}
                    >
                      Completed ({salesData?.stats.completedOrders || 0})
                    </button>
                    <button 
                      className={`filter-btn ${salesFilter === 'defected' ? 'active' : ''}`}
                      onClick={() => handleSalesFilterChange('defected')}
                    >
                      Defected ({salesData?.stats.defectedOrders || 0})
                    </button>
                  </div>
                </div>
                
                <div className="search-group">
                  <label>Search:</label>
                  <input
                    type="text"
                    placeholder="Search by name, order ID, invoice, or SKU..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="sales-content">
              {salesData ? (
                <div className="sales-overview">
                  <div className="sales-stats">
                    <div className="stat-card">
                      <h3>₹{salesData.stats.totalRevenue.toLocaleString()}</h3>
                      <p>Total Revenue</p>
                    </div>
                    <div className="stat-card">
                      <h3>{salesData.stats.totalOrders}</h3>
                      <p>Total Orders</p>
                    </div>
                    <div className="stat-card">
                      <h3>₹{salesData.stats.averageOrderValue.toLocaleString()}</h3>
                      <p>Avg Order Value</p>
                    </div>
                    <div className="stat-card defect-card">
                      <h3>{salesData.stats.defectedOrders}</h3>
                      <p>Defected Orders</p>
                      <span className="defect-amount">₹{salesData.stats.defectedRevenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="orders-list">
                    <h2>📋 Orders ({getFilteredOrders().length})</h2>
                    <div className="orders-table">
                      {getFilteredOrders().map((order) => (
                        <div key={order.id} className={`order-card ${order.status}`}>
                          <div className="order-header">
                            <div className="order-info">
                              <h3>{order.id}</h3>
                              <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                              <span className={`status-badge ${order.status}`}>
                                {order.status === 'defected' ? '🚨 Defected' : '✅ Completed'}
                              </span>
                            </div>
                            <div className="order-amount">
                              <span className="amount">₹{order.totalAmount.toLocaleString()}</span>
                              <span className="payment-method">{order.paymentMethod}</span>
                            </div>
                          </div>
                          
                          <div className="customer-info">
                            <div className="customer-details">
                              <h4>{order.customerName}</h4>
                              <span className="customer-email">{order.customerEmail}</span>
                              <span className="customer-phone">{order.customerPhone}</span>
                            </div>
                            <div className="invoice-info">
                              <span className="invoice-number">Invoice: {order.invoiceNumber}</span>
                            </div>
                          </div>

                          <div className="order-items">
                            <h4>📦 Items ({order.items.length})</h4>
                            <div className="items-list">
                              {order.items.map((item) => (
                                <div key={item.id} className={`item-row ${item.isDefected ? 'defected' : ''}`}>
                                  <div className="item-info">
                                    <span className="item-name">{item.productName}</span>
                                    <span className="item-sku">SKU: {item.sku}</span>
                                    {item.isDefected && (
                                      <span className="defect-reason">🚨 {item.defectReason}</span>
                                    )}
                                  </div>
                                  <div className="item-pricing">
                                    <span className="item-price">₹{item.price.toLocaleString()}</span>
                                    <span className="item-quantity">Qty: {item.quantity}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading sales data...</p>
                </div>
              )}
            </div>
          </>
        )}

        {currentPage === 'users' && (
          <>
            <div className="content-header">
              <h1>👥 User Management</h1>
              <p>Manage users, roles, and permissions for your POS system</p>
              
              <div className="user-filters">
                <div className="filter-group">
                  <label>Filter Users:</label>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${userFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleUserFilterChange('all')}
                    >
                      All Users ({usersData?.stats.totalUsers || 0})
                    </button>
                    <button 
                      className={`filter-btn ${userFilter === 'admin' ? 'active' : ''}`}
                      onClick={() => handleUserFilterChange('admin')}
                    >
                      Admins ({usersData?.stats.adminUsers || 0})
                    </button>
                    <button 
                      className={`filter-btn ${userFilter === 'client' ? 'active' : ''}`}
                      onClick={() => handleUserFilterChange('client')}
                    >
                      Clients ({usersData?.stats.clientUsers || 0})
                    </button>
                  </div>
                </div>
                
                <div className="search-group">
                  <label>Search:</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or location..."
                    value={userSearchTerm}
                    onChange={(e) => handleUserSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
                
              </div>
            </div>

            <div className="users-content">
              {usersData ? (
                <div className="users-overview">
                  <div className="users-stats">
                    <div className="stat-card">
                      <h3>{usersData.stats.totalUsers}</h3>
                      <p>Total Users</p>
                    </div>
                    <div className="stat-card">
                      <h3>{usersData.stats.activeUsers}</h3>
                      <p>Active Users</p>
                    </div>
                    <div className="stat-card">
                      <h3>{usersData.stats.adminUsers}</h3>
                      <p>Admin Users</p>
                    </div>
                    <div className="stat-card">
                      <h3>{usersData.stats.clientUsers}</h3>
                      <p>Client Users</p>
                    </div>
                  </div>

                  <div className="users-list">
                    <h2>👥 Users ({getFilteredUsers().length})</h2>
                    <div className="users-table">
                      {getFilteredUsers().map((user) => (
                        <div key={user.id} className={`user-card ${user.status}`}>
                          <div className="user-header">
                            <div className="user-info">
                              <div className="user-avatar">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                              <div className="user-details">
                                <h3>{user.firstName} {user.lastName}</h3>
                                <span className="user-email">{user.email}</span>
                                <span className="user-phone">{user.phone}</span>
                              </div>
                            </div>
                            <div className="user-actions">
                              <span className={`role-badge ${user.role}`}>
                                {user.role === 'super_admin' ? '🔑 Super Admin' : 
                                 user.role === 'admin' ? '👨‍💼 Admin' : '👤 Client'}
                              </span>
                              <span className={`status-badge ${user.status}`}>
                                {user.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="user-meta">
                            <div className="meta-info">
                              <div className="meta-item">
                                <span className="meta-label">Location:</span>
                                <span className="meta-value">{user.location}</span>
                              </div>
                              <div className="meta-item">
                                <span className="meta-label">Created:</span>
                                <span className="meta-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="meta-item">
                                <span className="meta-label">Last Login:</span>
                                <span className="meta-value">{new Date(user.lastLogin).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="user-permissions">
                            <h4>🔐 Permissions</h4>
                            <div className="permissions-grid">
                              {Object.entries(user.permissions).map(([module, perms]) => (
                                <div key={module} className="permission-module">
                                  <div className="module-name">{module.charAt(0).toUpperCase() + module.slice(1)}</div>
                                  <div className="permission-badges">
                                    {perms.hidden ? (
                                      <span className="perm-badge hidden">🚫 Hidden</span>
                                    ) : (
                                      <>
                                        {perms.create && <span className="perm-badge create">Create</span>}
                                        {perms.read && <span className="perm-badge read">Read</span>}
                                        {perms.update && <span className="perm-badge update">Update</span>}
                                        {perms.delete && <span className="perm-badge delete">Delete</span>}
                                        {!perms.create && !perms.read && !perms.update && !perms.delete && (
                                          <span className="perm-badge none">No Access</span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="user-controls">
                            <button 
                              onClick={() => handleEditUser(user)} 
                              className="action-btn edit-btn"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleToggleUserStatus(user.id)} 
                              className={`action-btn ${user.status === 'active' ? 'deactivate-btn' : 'activate-btn'}`}
                            >
                              {user.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)} 
                              className="action-btn delete-btn"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading users data...</p>
                </div>
              )}
            </div>

            {/* User Form Modal for Editing */}
            {editingUser && (
              <UserForm 
                user={editingUser}
                onSave={handleSaveUser}
                onClose={handleCloseUserForm}
              />
            )}
          </>
        )}

        {currentPage === 'pos' && (
          <>
            <div className="content-header">
              <h1>Point of Sale (POS)</h1>
              <p>Process sales transactions and manage orders</p>
            </div>

            <div className="pos-container">
              <div className="pos-main">
                <div className="pos-screen">
                  <h2>Sales Terminal</h2>
                  <div className="cart-section">
                    <h3>Shopping Cart</h3>
                    <div className="cart-items">
                      <div className="cart-item">
                        <span>Designer Sunglasses</span>
                        <span>₹2,999</span>
                      </div>
                      <div className="cart-item">
                        <span>Sports Eyewear</span>
                        <span>₹1,799</span>
                      </div>
                    </div>
                    <div className="cart-total">
                      <strong>Total: ₹4,798</strong>
                    </div>
                  </div>
                  
                  <div className="payment-section">
                    <h3>Payment</h3>
                    <div className="payment-methods">
                      <button className="payment-btn cash">Cash</button>
                      <button className="payment-btn card">Card</button>
                      <button className="payment-btn upi">UPI</button>
                    </div>
                    <button className="complete-sale-btn">Complete Sale</button>
                  </div>
                </div>

                <div className="pos-products">
                  <h3>Products</h3>
                  <div className="product-grid">
                    <div className="product-item">
                      <div className="product-image">🕶️</div>
                      <div className="product-name">Designer Sunglasses</div>
                      <div className="product-price">₹2,999</div>
                      <button className="add-to-cart">Add to Cart</button>
                    </div>
                    <div className="product-item">
                      <div className="product-image">🥽</div>
                      <div className="product-name">Sports Eyewear</div>
                      <div className="product-price">₹1,799</div>
                      <button className="add-to-cart">Add to Cart</button>
                    </div>
                    <div className="product-item">
                      <div className="product-image">👓</div>
                      <div className="product-name">Reading Glasses</div>
                      <div className="product-price">₹999</div>
                      <button className="add-to-cart">Add to Cart</button>
                    </div>
                    <div className="product-item">
                      <div className="product-image">🌞</div>
                      <div className="product-name">Sunglasses</div>
                      <div className="product-price">₹1,299</div>
                      <button className="add-to-cart">Add to Cart</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentPage !== 'dashboard' && currentPage !== 'products' && currentPage !== 'locations' && currentPage !== 'sales' && currentPage !== 'users' && currentPage !== 'pos' && (
          <div className="content-header">
            <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            <p>This section is coming soon...</p>
          </div>
        )}

        {/* Location Form Modal */}
        {editingLocation !== undefined && (
          <LocationForm 
            location={editingLocation}
            onSave={handleSaveLocation}
            onClose={handleCloseLocationForm}
          />
        )}
      </div>
    </div>
  );
}

// Location Form Component
const LocationForm = ({ location, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    state: location?.state || '',
    city: location?.city || '',
    address: location?.address || '',
    pincode: location?.pincode || '',
    phone: location?.phone || '',
    manager: location?.manager || '',
    status: location?.status || 'active'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.state.trim() || !formData.city.trim()) {
      alert('Please fill in all required fields (Name, State, City)');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{location ? 'Edit Location' : 'Add New Location'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="location-form">
          <div className="form-row">
            <div className="form-group">
              <label>Location Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Downtown Store"
                required
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Mumbai"
                required
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="e.g., 400001"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Complete address of the location"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manager Name</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                placeholder="Store manager name"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Contact number"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {location ? 'Update Location' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple UserForm component
const UserForm = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'client',
    location: user?.location || '',
    permissions: user?.permissions || {
      users: { create: false, read: false, update: false, delete: false, hidden: false },
      products: { create: false, read: false, update: false, delete: false, hidden: false },
      sales: { create: false, read: false, update: false, delete: false, hidden: false },
      locations: { create: false, read: false, update: false, delete: false, hidden: false },
      reports: { create: false, read: false, update: false, delete: false, hidden: false }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePermissionChange = (module, permission, value) => {
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      
      if (permission === 'hidden' && value) {
        // If hidden is checked, disable all other permissions
        newPermissions[module] = {
          create: false,
          read: false,
          update: false,
          delete: false,
          hidden: true
        };
      } else if (permission !== 'hidden' && value) {
        // If any other permission is checked, uncheck hidden
        newPermissions[module] = {
          ...newPermissions[module],
          [permission]: value,
          hidden: false
        };
      } else {
        // Normal permission toggle
        newPermissions[module] = {
          ...newPermissions[module],
          [permission]: value
        };
      }
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const getPermissionTemplate = (role) => {
    const templates = {
      super_admin: {
        users: { create: true, read: true, update: true, delete: true, hidden: false },
        products: { create: true, read: true, update: true, delete: true, hidden: false },
        sales: { create: true, read: true, update: true, delete: true, hidden: false },
        locations: { create: true, read: true, update: true, delete: true, hidden: false },
        reports: { create: true, read: true, update: true, delete: true, hidden: false }
      },
      admin: {
        users: { create: true, read: true, update: true, delete: false, hidden: false },
        products: { create: true, read: true, update: true, delete: false, hidden: false },
        sales: { create: true, read: true, update: true, delete: false, hidden: false },
        locations: { create: false, read: true, update: false, delete: false, hidden: false },
        reports: { create: true, read: true, update: false, delete: false, hidden: false }
      },
      client: {
        users: { create: false, read: true, update: false, delete: false, hidden: false },
        products: { create: false, read: true, update: false, delete: false, hidden: false },
        sales: { create: false, read: true, update: false, delete: false, hidden: false },
        locations: { create: false, read: true, update: false, delete: false, hidden: false },
        reports: { create: false, read: true, update: false, delete: false, hidden: false }
      }
    };
    return templates[role] || templates.client;
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: getPermissionTemplate(role)
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-form-modal">
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Permissions</h3>
            <div className="permissions-form">
              {Object.entries(formData.permissions).map(([module, perms]) => (
                <div key={module} className="permission-module-form">
                  <h4>{module.charAt(0).toUpperCase() + module.slice(1)}</h4>
                  <div className="permission-checkboxes">
                    <label>
                      <input
                        type="checkbox"
                        checked={perms.create}
                        disabled={perms.hidden}
                        onChange={(e) => handlePermissionChange(module, 'create', e.target.checked)}
                      />
                      Create
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={perms.read}
                        disabled={perms.hidden}
                        onChange={(e) => handlePermissionChange(module, 'read', e.target.checked)}
                      />
                      Read
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={perms.update}
                        disabled={perms.hidden}
                        onChange={(e) => handlePermissionChange(module, 'update', e.target.checked)}
                      />
                      Update
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={perms.delete}
                        disabled={perms.hidden}
                        onChange={(e) => handlePermissionChange(module, 'delete', e.target.checked)}
                      />
                      Delete
                    </label>
                    <label className="hidden-permission">
                      <input
                        type="checkbox"
                        checked={perms.hidden}
                        onChange={(e) => handlePermissionChange(module, 'hidden', e.target.checked)}
                      />
                      <span className="hidden-label">🚫 Hidden (No Access)</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;