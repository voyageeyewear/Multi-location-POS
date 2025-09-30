import React, { useState, useEffect } from 'react';
import './App.css';
import { FiHome, FiShoppingBag, FiMapPin, FiTrendingUp, FiBarChart3, FiDatabase, FiUsers, FiShield, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSearch, FiFilter, FiRefreshCw, FiX, FiShoppingCart, FiCreditCard, FiDollarSign, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed selectedState since we're not showing detailed analytics anymore
  const [locationData, setLocationData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [salesData, setSalesData] = useState(null);
  const [salesFilter, setSalesFilter] = useState('all'); // all, defected, completed
  const [cityFilter, setCityFilter] = useState('all'); // all, or specific city
  const [searchTerm, setSearchTerm] = useState('');
  const [usersData, setUsersData] = useState(null);
  const [userFilter, setUserFilter] = useState('all'); // all, admin, client
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(undefined);
  const [posProducts, setPosProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedLocationForAnalytics, setSelectedLocationForAnalytics] = useState('');
  const [locationAnalyticsData, setLocationAnalyticsData] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  
  // State for city filter on locations page
  const [selectedCity, setSelectedCity] = useState('all');

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
      // Load location data
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
    // Try to load from localStorage first
    try {
      const savedSalesData = localStorage.getItem('pos_sales_data');
      if (savedSalesData) {
        const parsedData = JSON.parse(savedSalesData);
        console.log('Loaded sales data from localStorage:', parsedData);
        setSalesData(parsedData);
        return;
      }
    } catch (error) {
      console.error('Error loading sales data from localStorage:', error);
    }

    // Only load empty data if no sales data exists yet and nothing in localStorage
    if (!salesData) {
      const emptySalesData = {
        orders: [],
        stats: {
          totalOrders: 0,
          completedOrders: 0,
          defectedOrders: 0,
          totalRevenue: 0,
          defectedRevenue: 0,
          averageOrderValue: 0
        }
      };
      
      setSalesData(emptySalesData);
    }
  };

  const saveSalesData = (data) => {
    try {
      localStorage.setItem('pos_sales_data', JSON.stringify(data));
      console.log('Sales data saved to localStorage:', data);
    } catch (error) {
      console.error('Error saving sales data to localStorage:', error);
    }
  };

  const refreshSalesData = () => {
    // Refresh doesn't reset data, just forces a re-render
    // The sales data is already up-to-date with POS orders
    console.log('Sales data refreshed:', salesData);
  };

  const clearAllOrders = () => {
    if (window.confirm('Are you sure you want to clear all orders? This action cannot be undone.')) {
      const emptySalesData = {
        orders: [],
        stats: {
          totalOrders: 0,
          completedOrders: 0,
          defectedOrders: 0,
          totalRevenue: 0,
          defectedRevenue: 0,
          averageOrderValue: 0
        }
      };
      setSalesData(emptySalesData);
      saveSalesData(emptySalesData);
      console.log('All orders cleared');
    }
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

  const loadLocationData = async () => {
    try {
      setLoading(true);
      
      // Load demo data locally (no API calls to avoid 404 errors)
      const { dateLabel, multiplier } = generateDateSpecificData(selectedDate);
      
      const demoLocationData = {
        cities: [
          {
            id: 'mumbai',
            name: 'Mumbai',
            totalSales: Math.round(2450000 * multiplier),
            totalOrders: Math.round(1250 * multiplier),
            avgOrderValue: 1960,
            customerCount: Math.round(890 * multiplier)
          },
          {
            id: 'delhi',
            name: 'Delhi',
            totalSales: Math.round(2100000 * multiplier),
            totalOrders: Math.round(1150 * multiplier),
            avgOrderValue: 1826,
            customerCount: Math.round(920 * multiplier)
          },
          {
            id: 'bangalore',
            name: 'Bangalore',
            totalSales: Math.round(1890000 * multiplier),
            totalOrders: Math.round(980 * multiplier),
            avgOrderValue: 1928,
            customerCount: Math.round(720 * multiplier)
          },
          {
            id: 'chennai',
            name: 'Chennai',
            totalSales: Math.round(1560000 * multiplier),
            totalOrders: Math.round(820 * multiplier),
            avgOrderValue: 1902,
            customerCount: Math.round(650 * multiplier)
          },
          {
            id: 'kolkata',
            name: 'Kolkata',
            totalSales: Math.round(1450000 * multiplier),
            totalOrders: Math.round(750 * multiplier),
            avgOrderValue: 1933,
            customerCount: Math.round(620 * multiplier)
          },
          {
            id: 'hyderabad',
            name: 'Hyderabad',
            totalSales: Math.round(1380000 * multiplier),
            totalOrders: Math.round(710 * multiplier),
            avgOrderValue: 1944,
            customerCount: Math.round(590 * multiplier)
          },
          {
            id: 'pune',
            name: 'Pune',
            totalSales: Math.round(1320000 * multiplier),
            totalOrders: Math.round(680 * multiplier),
            avgOrderValue: 1941,
            customerCount: Math.round(580 * multiplier)
          },
          {
            id: 'ahmedabad',
            name: 'Ahmedabad',
            totalSales: Math.round(1250000 * multiplier),
            totalOrders: Math.round(640 * multiplier),
            avgOrderValue: 1953,
            customerCount: Math.round(550 * multiplier)
          }
        ],
        totalStats: {
          totalSales: Math.round(9320000 * multiplier),
          totalOrders: Math.round(4880 * multiplier),
          totalCustomers: Math.round(3760 * multiplier),
          avgOrderValue: 1909
        },
        dateInfo: {
          label: dateLabel,
          type: selectedDate
        }
      };
      
      setLocationData(demoLocationData);
      console.log('Location data loaded successfully:', demoLocationData);
    } catch (error) {
      console.error('Error loading location data:', error);
      toast.error('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationAnalyticsData = async (locationId) => {
    if (!locationId) {
      setLocationAnalyticsData(null);
      return;
    }

    try {
      // For demo purposes, generate location-specific product sales data
      const demoProducts = [
        { id: 'p1', title: 'Classic Aviator Sunglasses', sales: Math.floor(Math.random() * 150) + 50, revenue: Math.floor(Math.random() * 200000) + 50000 },
        { id: 'p2', title: 'Stylish Wayfarer Shades', sales: Math.floor(Math.random() * 120) + 40, revenue: Math.floor(Math.random() * 180000) + 40000 },
        { id: 'p3', title: 'Modern Round Frame Glasses', sales: Math.floor(Math.random() * 100) + 30, revenue: Math.floor(Math.random() * 160000) + 30000 },
        { id: 'p4', title: 'Sporty Wrap-Around Sunglasses', sales: Math.floor(Math.random() * 90) + 25, revenue: Math.floor(Math.random() * 140000) + 25000 },
        { id: 'p5', title: 'Vintage Cat-Eye Glasses', sales: Math.floor(Math.random() * 80) + 20, revenue: Math.floor(Math.random() * 120000) + 20000 },
        { id: 'p6', title: 'Minimalist Square Sunglasses', sales: Math.floor(Math.random() * 70) + 15, revenue: Math.floor(Math.random() * 100000) + 15000 },
        { id: 'p7', title: 'Oversized Fashion Sunglasses', sales: Math.floor(Math.random() * 60) + 10, revenue: Math.floor(Math.random() * 80000) + 10000 },
        { id: 'p8', title: 'Blue Light Blocking Glasses', sales: Math.floor(Math.random() * 50) + 5, revenue: Math.floor(Math.random() * 60000) + 5000 },
        { id: 'p9', title: 'Kids Funky Sunglasses', sales: Math.floor(Math.random() * 40) + 3, revenue: Math.floor(Math.random() * 40000) + 3000 },
        { id: 'p10', title: 'Gradient Lens Sunglasses', sales: Math.floor(Math.random() * 30) + 2, revenue: Math.floor(Math.random() * 20000) + 2000 }
      ];

      // Sort by sales to get top and bottom performers
      const sortedProducts = [...demoProducts].sort((a, b) => b.sales - a.sales);
      
      const analyticsData = {
        location: locationData?.cities?.find(city => city.id === locationId) || { name: locationId },
        topSellingProducts: sortedProducts.slice(0, 5),
        leastSellingProducts: sortedProducts.slice(-5).reverse(),
        totalProducts: demoProducts.length,
        totalSales: sortedProducts.reduce((sum, product) => sum + product.sales, 0),
        totalRevenue: sortedProducts.reduce((sum, product) => sum + product.revenue, 0)
      };

      setLocationAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error loading location analytics data:', error);
      toast.error('Failed to load location analytics data');
    }
  };

  const loadRealInvoiceData = async () => {
    try {
      // Only load real POS transactions from localStorage
      const savedSalesData = localStorage.getItem('pos_sales_data');
      if (savedSalesData) {
        const parsedData = JSON.parse(savedSalesData);
        if (parsedData.orders && parsedData.orders.length > 0) {
          setSalesData(parsedData);
          console.log('Loaded real POS transactions:', parsedData);
        } else {
          // No real transactions yet, show empty state
          setSalesData({ 
            orders: [], 
            stats: {
              totalOrders: 0,
              completedOrders: 0,
              defectedOrders: 0,
              totalRevenue: 0,
              defectedRevenue: 0,
              averageOrderValue: 0
            }
          });
          console.log('No real POS transactions found');
        }
      } else {
        // No saved data, show empty state
        setSalesData({ 
          orders: [], 
          stats: {
            totalOrders: 0,
            completedOrders: 0,
            defectedOrders: 0,
            totalRevenue: 0,
            defectedRevenue: 0,
            averageOrderValue: 0
          }
        });
        console.log('No saved POS transactions found');
      }
    } catch (error) {
      console.error('Error loading real invoice data:', error);
      toast.error('Could not load real invoice data');
    }
  };

  // Removed handleStateSelection since we're not showing detailed analytics anymore

  const handleDateChange = (dateType) => {
    setSelectedDate(dateType);
    // Force reload data with new date
    setTimeout(() => {
      loadLocationData();
    }, 100);
  };

  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    if (selectedDate === 'custom') {
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
  }, [selectedDate, customDate, currentPage]);

  // Load POS products when POS page is accessed
  useEffect(() => {
    if (currentPage === 'pos' && posProducts.length === 0) {
      loadPosProducts();
    }
  }, [currentPage, posProducts.length]);

  // Load location data when Location Analytics page is accessed
  useEffect(() => {
    if (currentPage === 'location-analytics' && !locationData) {
      loadLocationData();
    }
  }, [currentPage, locationData]);

  // Load sales data on component mount
  useEffect(() => {
    loadSalesData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load real invoice data when locations page is accessed
  useEffect(() => {
    if (currentPage === 'locations') {
      loadRealInvoiceData();
    }
  }, [currentPage]);

  // Clear any demo data on component mount
  useEffect(() => {
    // Clear any existing demo data to start fresh
    const savedData = localStorage.getItem('pos_sales_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Check if it contains demo data (John Smith, Sarah Johnson, etc.)
      const hasDemoData = parsed.orders?.some(order => 
        ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown', 'Lisa Anderson'].includes(order.clientName)
      );
      if (hasDemoData) {
        localStorage.removeItem('pos_sales_data');
        console.log('Cleared demo data from localStorage');
      }
    }
  }, []);

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

    // Apply city filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(order => order.location.city === cityFilter);
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
      // Fetch real products from backend Shopify API (proxy)
      console.log('Fetching products from backend Shopify API...');
      
      const response = await fetch('http://localhost:8000/api/shopify/products', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token', // Using demo token for now
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend Shopify API Response:', data);

      if (data.success && data.data && data.data.products && data.data.products.length > 0) {
        // Transform Shopify products to our format
        const transformedProducts = data.data.products.map(product => {
          const variant = product.variants && product.variants[0];
          const image = product.images && product.images[0];
          
          return {
            id: product.id.toString(),
            title: product.title,
            vendor: product.vendor || 'Voyage Eyewear',
            product_type: product.product_type || 'Eyewear',
            status: product.status,
            price: variant ? `₹${parseFloat(variant.price).toFixed(2)}` : '₹0.00',
            inventory: variant ? (variant.inventory_quantity || 0) : 0,
            image: image ? image.src : 'https://picsum.photos/200/200?random=' + product.id,
            sku: variant ? variant.sku : '',
            weight: variant ? variant.weight : 0,
            weight_unit: variant ? variant.weight_unit : 'kg',
            barcode: variant ? variant.barcode : '',
            requires_shipping: variant ? variant.requires_shipping : true,
            taxable: variant ? variant.taxable : true,
            created_at: product.created_at,
            updated_at: product.updated_at,
            published_at: product.published_at,
            tags: product.tags,
            body_html: product.body_html
          };
        });

        setProducts(transformedProducts);
        console.log(`Successfully loaded ${transformedProducts.length} products from Shopify!`, transformedProducts);
        toast.success(`Loaded ${transformedProducts.length} products from Shopify!`);
      } else {
        console.log('No products found in Shopify store');
        toast('No products found in your Shopify store');
      }
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Failed to fetch products from Shopify: ' + error.message;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'CORS error: Cannot fetch from Shopify API. This is likely due to browser security restrictions.';
      }
      
      toast.error(errorMessage);
      
      // Fallback to demo products if Shopify API fails
      const demoProducts = [
        {
          id: '1',
          title: 'Classic Eyewear Frame',
          vendor: 'GoEye',
          product_type: 'Eyewear',
          status: 'active',
          price: '$129.99',
          inventory: 25,
          image: 'https://picsum.photos/200/200?random=1'
        },
        {
          id: '2',
          title: 'Premium Sunglasses',
          vendor: 'GoEye',
          product_type: 'Sunglasses',
          status: 'active',
          price: '$199.99',
          inventory: 15,
          image: 'https://picsum.photos/200/200?random=2'
        },
        {
          id: '3',
          title: 'Blue Light Glasses',
          vendor: 'GoEye',
          product_type: 'Eyewear',
          status: 'active',
          price: '$89.99',
          inventory: 30,
          image: 'https://picsum.photos/200/200?random=3'
        },
        {
          id: '4',
          title: 'Reading Glasses',
          vendor: 'GoEye',
          product_type: 'Eyewear',
          status: 'active',
          price: '$59.99',
          inventory: 20,
          image: 'https://picsum.photos/200/200?random=4'
        },
        {
          id: '5',
          title: 'Designer Sunglasses',
          vendor: 'GoEye',
          product_type: 'Sunglasses',
          status: 'active',
          price: '$299.99',
          inventory: 8,
          image: 'https://picsum.photos/200/200?random=5'
        },
        {
          id: '6',
          title: 'Sports Eyewear',
          vendor: 'GoEye',
          product_type: 'Sports',
          status: 'active',
          price: '$179.99',
          inventory: 12,
          image: 'https://picsum.photos/200/200?random=6'
        }
      ];
      
      setProducts(demoProducts);
      console.log('Using demo products - Shopify API failed');
      toast('Using demo products - Shopify connection failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPosProducts = async () => {
    setPosLoading(true);
    try {
      // Fetch real products from backend Shopify API for POS
      console.log('Fetching POS products from backend Shopify API...');
      
      const response = await fetch('http://localhost:8000/api/shopify/products', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token', // Using demo token for now
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('POS Backend Shopify API Response:', data);

      if (data.success && data.data && data.data.products && data.data.products.length > 0) {
        // Transform Shopify products to POS format
        const transformedProducts = data.data.products.map(product => {
          const variant = product.variants && product.variants[0];
          const image = product.images && product.images[0];
          
          return {
            id: product.id,
            name: product.title,
            description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Premium eyewear product',
            price: variant ? parseFloat(variant.price) : 0,
            image: image ? image.src : '🕶️',
            vendor: product.vendor || 'Voyage Eyewear',
            sku: variant ? variant.sku : '',
            inventory: variant ? (variant.inventory_quantity || 0) : 0
          };
        });

        setPosProducts(transformedProducts);
        console.log(`Successfully loaded ${transformedProducts.length} POS products from Shopify!`, transformedProducts);
      } else {
        console.log('No products found in Shopify store for POS');
      }
    } catch (error) {
      console.error('Error fetching POS Shopify products:', error);
      
      // Fallback to demo products if Shopify API fails
      const demoProducts = [
        {
          id: 1,
          name: "Designer Sunglasses",
          description: "Premium designer sunglasses with UV protection",
          price: 2999,
          image: "🕶️",
          vendor: "Voyage Eyewear",
          sku: "DES-SUN-001",
          inventory: 50
        },
        {
          id: 2,
          name: "Sports Eyewear",
          description: "Durable sports eyewear for active lifestyle",
          price: 1799,
          image: "🥽",
          vendor: "Voyage Eyewear",
          sku: "SPO-EYE-002",
          inventory: 30
        },
        {
          id: 3,
          name: "Reading Glasses",
          description: "Comfortable reading glasses with blue light filter",
          price: 999,
          image: "👓",
          vendor: "Voyage Eyewear",
          sku: "REA-GLA-003",
          inventory: 25
        },
        {
          id: 4,
          name: "Sunglasses",
          description: "Classic sunglasses for everyday wear",
          price: 1299,
          image: "🌞",
          vendor: "Voyage Eyewear",
          sku: "SUN-CLA-004",
          inventory: 40
        }
      ];
      
      setPosProducts(demoProducts);
      console.log('Using demo POS products - Shopify API failed');
    } finally {
      setPosLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPaymentMethod(null);
  };

  const toggleInvoiceExpansion = (invoiceId) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  // Get unique cities from sales data for filter
  const getUniqueCities = () => {
    if (!salesData || !salesData.orders) return [];
    const cities = [...new Set(salesData.orders.map(order => order.city))];
    return cities.filter(city => city && city !== 'Unknown City').sort();
  };

  // Filter invoices by selected city
  const getFilteredInvoices = () => {
    if (!salesData || !salesData.orders) return [];
    if (selectedCity === 'all') return salesData.orders;
    return salesData.orders.filter(order => order.city === selectedCity);
  };

  const downloadInvoice = (order) => {
    try {
      // Create invoice HTML content
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #10b981; }
            .invoice-title { font-size: 20px; margin: 10px 0; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .client-info, .invoice-info { width: 48%; }
            .section-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
            .info-row { margin: 5px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8fafc; font-weight: bold; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #10b981; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">VOYAGE EYEWEAR</div>
            <div class="invoice-title">INVOICE</div>
            <div style="color: #6b7280;">Invoice #${order.id}</div>
          </div>
          
          <div class="invoice-details">
            <div class="client-info">
              <div class="section-title">Bill To:</div>
              <div class="info-row"><strong>Client:</strong> ${order.clientName}</div>
              <div class="info-row"><strong>Location:</strong> ${order.city}, ${order.state}</div>
              <div class="info-row"><strong>Payment:</strong> ${order.paymentMethod}</div>
            </div>
            <div class="invoice-info">
              <div class="section-title">Invoice Details:</div>
              <div class="info-row"><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</div>
              <div class="info-row"><strong>Time:</strong> ${new Date(order.timestamp).toLocaleTimeString()}</div>
              <div class="info-row"><strong>Status:</strong> Completed</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">Subtotal: ₹${order.subtotal.toLocaleString()}</div>
            <div class="total-row">Tax: ₹${order.tax.toLocaleString()}</div>
            <div class="total-row grand-total">Total: ₹${order.total.toLocaleString()}</div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${order.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Invoice ${order.id} downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const completeSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Please select a payment method!');
      return;
    }

    // Generate client info (in real app, this would come from user profile)
    const clientInfo = {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      role: user.role.name
    };

    // Generate location info (in real app, this would come from user's assigned locations)
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Maharashtra', 'Gujarat'];
    const randomIndex = Math.floor(Math.random() * cities.length);
    
    const locationInfo = {
      state: states[randomIndex],
      city: cities[randomIndex],
      address: `123 Business District, ${cities[randomIndex]}`
    };

    // Generate location-based invoice number
    const generateLocationInvoiceNumber = (city) => {
      // Get city prefix (first 4 letters, uppercase)
      const cityPrefix = city.substring(0, 4).toUpperCase();
      const companySuffix = 'VOYA'; // Voyage Eyewear
      
      // Get or create sequence counter for this city
      const locationKey = `invoice_seq_${city.toLowerCase()}`;
      let sequenceNumber = parseInt(localStorage.getItem(locationKey) || '0');
      sequenceNumber += 1;
      
      // Save updated sequence
      localStorage.setItem(locationKey, sequenceNumber.toString());
      
      // Format as: CITY + VOYA + 5-digit sequence
      const invoiceNumber = `${cityPrefix}${companySuffix}-${sequenceNumber.toString().padStart(5, '0')}`;
      return invoiceNumber;
    };

    const invoiceNumber = generateLocationInvoiceNumber(locationInfo.city);
    const orderId = invoiceNumber;
    const currentTime = new Date();

    const newOrder = {
      id: orderId,
      clientName: clientInfo.name,
      city: locationInfo.city,
      state: locationInfo.state,
      paymentMethod: selectedPaymentMethod,
      timestamp: currentTime.toISOString(),
      items: cart.map(item => ({
        title: item.name,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku || 'N/A'
      })),
      subtotal: getCartTotal() * 0.9, // 90% of total (before tax)
      tax: getCartTotal() * 0.1, // 10% tax
      total: getCartTotal(),
      customerEmail: clientInfo.email,
      customerPhone: '+91 98765 43210',
      status: 'completed',
      invoiceNumber: invoiceNumber,
      notes: `Order created via POS by ${clientInfo.role}`,
      createdBy: clientInfo.name,
      createdAt: currentTime.toISOString()
    };

    // Add to existing sales data
    if (salesData && salesData.orders) {
      const updatedSalesData = {
        ...salesData,
        orders: [newOrder, ...salesData.orders],
        stats: {
          totalOrders: (salesData.stats?.totalOrders || 0) + 1,
          completedOrders: (salesData.stats?.completedOrders || 0) + 1,
          defectedOrders: salesData.stats?.defectedOrders || 0,
          totalRevenue: (salesData.stats?.totalRevenue || 0) + getCartTotal(),
          defectedRevenue: salesData.stats?.defectedRevenue || 0,
          averageOrderValue: ((salesData.stats?.totalRevenue || 0) + getCartTotal()) / ((salesData.stats?.totalOrders || 0) + 1)
        }
      };
      console.log('Adding new order to sales data:', newOrder);
      console.log('Updated sales data:', updatedSalesData);
      setSalesData(updatedSalesData);
      saveSalesData(updatedSalesData);
    } else {
      // If no sales data exists, create initial data with this order
      const initialSalesData = {
        orders: [newOrder],
        stats: {
          totalOrders: 1,
          completedOrders: 1,
          defectedOrders: 0,
          totalRevenue: getCartTotal(),
          defectedRevenue: 0,
          averageOrderValue: getCartTotal()
        }
      };
      console.log('Creating initial sales data with first order:', newOrder);
      console.log('Initial sales data:', initialSalesData);
      setSalesData(initialSalesData);
      saveSalesData(initialSalesData);
    }

    // Show success message
    alert(`Sale completed successfully!\nInvoice: ${invoiceNumber}\nLocation: ${locationInfo.city}\nTotal: ₹${getCartTotal().toLocaleString()}\nPayment: ${selectedPaymentMethod}`);

    // Clear cart and reset payment method
    clearCart();
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
              <button onClick={() => handleNavigation('location-analytics')} className={`nav-item ${currentPage === 'location-analytics' ? 'active' : ''}`}>Location Analytics</button>
              <button onClick={() => handleNavigation('sales')} className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}>Sales</button>
              <button onClick={() => handleNavigation('reports')} className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}>Reports</button>
              <button onClick={() => handleNavigation('data')} className={`nav-item ${currentPage === 'data' ? 'active' : ''}`}>Data Management</button>
              <button onClick={() => handleNavigation('users')} className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}>Users</button>
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
                  <span className="tag">Location Analytics</span>
                  <span className="tag">Sales</span>
                  <span className="tag">Reports</span>
                  <span className="tag">Data Management</span>
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
                          <div>
                            <h3 className="product-title">{product.title}</h3>
                            <div className="product-meta">
                              <p className="product-vendor">{product.vendor}</p>
                              <p className="product-type">{product.product_type}</p>
                            </div>
                          </div>
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
              <h1>📍 Kiosk Locations & Invoices</h1>
              <p>View kiosk locations and client invoices</p>
            </div>

            <div className="locations-content">
              {/* Recent Invoices Section */}
              <div className="invoices-section">
                <div className="invoices-header">
                  <h2>🧾 Recent Client Invoices</h2>
                  <div className="city-filter">
                    <label htmlFor="cityFilter">Filter by City:</label>
                    <select 
                      id="cityFilter"
                      value={selectedCity} 
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="city-filter-select"
                    >
                      <option value="all">All Cities</option>
                      {getUniqueCities().map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {getFilteredInvoices().length > 0 ? (
                  <div className="invoices-grid">
                    {getFilteredInvoices().slice(0, 6).map((order) => {
                    // Ensure we have valid data
                    const safeOrder = {
                      id: order.id || `ORD-${Date.now()}`,
                      clientName: order.clientName || 'Unknown Client',
                      city: order.city || 'Unknown City',
                      state: order.state || 'Unknown State',
                      paymentMethod: order.paymentMethod || 'Cash',
                      timestamp: order.timestamp || new Date().toISOString(),
                      items: Array.isArray(order.items) ? order.items : [],
                      total: order.total || 0
                    };

                    // Format date and time safely
                    let formattedDate = 'Invalid Date';
                    let formattedTime = 'Invalid Time';
                    
                    try {
                      const date = new Date(safeOrder.timestamp);
                      if (!isNaN(date.getTime())) {
                        formattedDate = date.toLocaleDateString('en-IN');
                        formattedTime = date.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                      }
                    } catch (error) {
                      console.error('Date formatting error:', error);
                    }

                    return (
                      <div key={safeOrder.id} className={`invoice-card ${expandedInvoice === safeOrder.id ? 'expanded' : ''}`}>
                        <div 
                          className="invoice-header clickable-header" 
                          onClick={() => toggleInvoiceExpansion(safeOrder.id)}
                        >
                          <div className="header-content">
                            <h3>Invoice #{safeOrder.id}</h3>
                            <span className="invoice-status">✅ Completed</span>
                          </div>
                          <div className="expand-icon">
                            {expandedInvoice === safeOrder.id ? '▲' : '▼'}
                          </div>
                        </div>
                        
                        {/* Collapsible Content */}
                        <div className={`invoice-content ${expandedInvoice === safeOrder.id ? 'expanded' : 'collapsed'}`}>
                          {/* Main Info Section */}
                          <div className="invoice-main-info">
                            <div className="info-grid">
                            <div className="info-item">
                              <div className="info-label">👤 Client Name</div>
                              <div className="info-value">{safeOrder.clientName}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">📍 Location</div>
                              <div className="info-value">{safeOrder.city}, {safeOrder.state}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">📅 Date</div>
                              <div className="info-value">{formattedDate}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">🕐 Time</div>
                              <div className="info-value">{formattedTime}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">💳 Payment</div>
                              <div className="info-value">
                                <span className="payment-badge">{safeOrder.paymentMethod}</span>
                              </div>
                            </div>
                            <div className="info-item download-section">
                              <div className="info-label">📄 Invoice</div>
                              <div className="info-value">
                                <button 
                                  className="download-invoice-btn"
                                  onClick={() => downloadInvoice(safeOrder)}
                                  title="Download Invoice PDF"
                                >
                                  📥 Download
                                </button>
                              </div>
                            </div>
                            <div className="info-item total-highlight">
                              <div className="info-label">💰 Total Amount</div>
                              <div className="info-value total-amount">₹{safeOrder.total}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Items Summary */}
                        <div className="invoice-items-summary">
                          <div className="items-header">
                            <span className="items-count">📦 {safeOrder.items.length} Items</span>
                            <span className="items-preview">
                              {safeOrder.items.length > 0 ? (
                                <>
                                  {safeOrder.items.slice(0, 2).map((item, index) => (
                                    <span key={index} className="item-preview">
                                      {item.title || item.name || 'Unknown Item'} ({item.quantity || 1})
                                    </span>
                                  ))}
                                  {safeOrder.items.length > 2 && ` +${safeOrder.items.length - 2} more`}
                                </>
                              ) : (
                                <span className="no-items">No items available</span>
                              )}
                            </span>
                          </div>
                        </div>
                        </div> {/* End of collapsible content */}
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="empty-invoices-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>
                      {selectedCity === 'all' 
                        ? 'No POS Transactions Yet' 
                        : `No Transactions Found for ${selectedCity}`
                      }
                    </h3>
                    <p>
                      {selectedCity === 'all' 
                        ? 'Client invoices will appear here when customers make purchases through the POS system.'
                        : `No invoices found for ${selectedCity}. Try selecting a different city or "All Cities" to see all transactions.`
                      }
                    </p>
                    {selectedCity === 'all' && (
                      <div className="empty-state-tip">
                        <strong>💡 Tip:</strong> Have clients use the POS system to make purchases and their invoices will show up here automatically.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Kiosk Locations Section */}
              <div className="kiosks-section">
                <h2>📍 Kiosk Locations</h2>
                <div className="kiosks-grid">
                  {[
                    {
                      id: 'k1',
                      name: 'Mumbai Central Kiosk',
                      address: '123 MG Road, Near Central Station, Mumbai - 400001',
                      phone: '+91 98765 43210',
                      billing: {
                        gst: '27ABCDE1234F1Z5',
                        address: 'Voyage Eyewear Pvt Ltd, 123 MG Road, Mumbai - 400001',
                        invoicePrefix: 'VE/MUM/'
                      },
                      status: 'active'
                    },
                    {
                      id: 'k2',
                      name: 'Delhi Metro Kiosk',
                      address: '456 Connaught Place, New Delhi - 110001',
                      phone: '+91 98765 43211',
                      billing: {
                        gst: '07ABCDE1234F1Z6',
                        address: 'Voyage Eyewear Pvt Ltd, 456 Connaught Place, New Delhi - 110001',
                        invoicePrefix: 'VE/DEL/'
                      },
                      status: 'active'
                    },
                    {
                      id: 'k3',
                      name: 'Bangalore Mall Kiosk',
                      address: '789 Brigade Road, Bangalore - 560001',
                      phone: '+91 98765 43212',
                      billing: {
                        gst: '29ABCDE1234F1Z7',
                        address: 'Voyage Eyewear Pvt Ltd, 789 Brigade Road, Bangalore - 560001',
                        invoicePrefix: 'VE/BNG/'
                      },
                      status: 'active'
                    },
                    {
                      id: 'k4',
                      name: 'Chennai Airport Kiosk',
                      address: '321 Anna Salai, Chennai - 600002',
                      phone: '+91 98765 43213',
                      billing: {
                        gst: '33ABCDE1234F1Z8',
                        address: 'Voyage Eyewear Pvt Ltd, 321 Anna Salai, Chennai - 600002',
                        invoicePrefix: 'VE/CHE/'
                      },
                      status: 'active'
                    },
                    {
                      id: 'k5',
                      name: 'Kolkata Station Kiosk',
                      address: '654 Park Street, Kolkata - 700016',
                      phone: '+91 98765 43214',
                      billing: {
                        gst: '19ABCDE1234F1Z9',
                        address: 'Voyage Eyewear Pvt Ltd, 654 Park Street, Kolkata - 700016',
                        invoicePrefix: 'VE/KOL/'
                      },
                      status: 'active'
                    },
                    {
                      id: 'k6',
                      name: 'Hyderabad Plaza Kiosk',
                      address: '987 Banjara Hills, Hyderabad - 500034',
                      phone: '+91 98765 43215',
                      billing: {
                        gst: '36ABCDE1234F1Z0',
                        address: 'Voyage Eyewear Pvt Ltd, 987 Banjara Hills, Hyderabad - 500034',
                        invoicePrefix: 'VE/HYD/'
                      },
                      status: 'active'
                    }
                  ].map((kiosk) => (
                    <div key={kiosk.id} className="kiosk-card">
                      <div className="kiosk-header">
                        <h3>{kiosk.name}</h3>
                        <span className={`status-badge ${kiosk.status}`}>
                          {kiosk.status === 'active' ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </div>
                      
                      <div className="kiosk-info">
                        <div className="info-section">
                          <h4>📍 Address</h4>
                          <p>{kiosk.address}</p>
                        </div>
                        
                        <div className="info-section">
                          <h4>📞 Phone</h4>
                          <p>{kiosk.phone}</p>
                        </div>
                        
                        <div className="info-section">
                          <h4>🧾 Billing Details</h4>
                          <div className="billing-details">
                            <div className="billing-item">
                              <strong>GST Number:</strong>
                              <span>{kiosk.billing.gst}</span>
                            </div>
                            <div className="billing-item">
                              <strong>Billing Address:</strong>
                              <span>{kiosk.billing.address}</span>
                            </div>
                            <div className="billing-item">
                              <strong>Invoice Prefix:</strong>
                              <span>{kiosk.billing.invoicePrefix}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="kiosk-actions">
                        <button className="view-btn">
                          👁️ View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {currentPage === 'location-analytics' && (
          <>
            <div className="content-header">
              <h1>📍 Location Analytics</h1>
              <p>Analyze product performance by location - see which items sell most and least at each location</p>
            </div>

            <div className="location-analytics-content">
              {/* Location Selector */}
              <div className="location-selector-section">
                <h2>Select Location</h2>
                <div className="location-dropdown">
                  <select 
                    value={selectedLocationForAnalytics} 
                    onChange={(e) => {
                      setSelectedLocationForAnalytics(e.target.value);
                      loadLocationAnalyticsData(e.target.value);
                    }}
                    className="location-select"
                  >
                    <option value="">Choose a location...</option>
                    {locationData?.cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name} - ₹{(city.totalSales / 100000).toFixed(1)}L sales
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analytics Display */}
              {selectedLocationForAnalytics && locationAnalyticsData && (
                <div className="analytics-results">
                  <div className="analytics-header">
                    <h2>📊 Analytics for {locationAnalyticsData.location.name}</h2>
                    <div className="location-summary">
                      <div className="summary-card">
                        <h3>{locationAnalyticsData.totalProducts}</h3>
                        <p>Total Products</p>
                      </div>
                      <div className="summary-card">
                        <h3>{locationAnalyticsData.totalSales}</h3>
                        <p>Total Sales</p>
                      </div>
                      <div className="summary-card">
                        <h3>₹{(locationAnalyticsData.totalRevenue / 100000).toFixed(1)}L</h3>
                        <p>Total Revenue</p>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-grid">
                    {/* Top Selling Products */}
                    <div className="analytics-section top-selling">
                      <h3>🏆 Top Selling Products</h3>
                      <div className="product-list">
                        {locationAnalyticsData.topSellingProducts.map((product, index) => (
                          <div key={product.id} className="product-rank-item">
                            <div className="rank-number">{index + 1}</div>
                            <div className="product-info">
                              <h4>{product.title}</h4>
                              <div className="product-stats">
                                <span className="sales-count">{product.sales} sales</span>
                                <span className="revenue">₹{(product.revenue / 1000).toFixed(0)}K</span>
                              </div>
                            </div>
                            <div className="performance-indicator high">📈</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Least Selling Products */}
                    <div className="analytics-section least-selling">
                      <h3>📉 Least Selling Products</h3>
                      <div className="product-list">
                        {locationAnalyticsData.leastSellingProducts.map((product, index) => (
                          <div key={product.id} className="product-rank-item">
                            <div className="rank-number">{locationAnalyticsData.totalProducts - index}</div>
                            <div className="product-info">
                              <h4>{product.title}</h4>
                              <div className="product-stats">
                                <span className="sales-count">{product.sales} sales</span>
                                <span className="revenue">₹{(product.revenue / 1000).toFixed(0)}K</span>
                              </div>
                            </div>
                            <div className="performance-indicator low">📉</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="analytics-insights">
                    <h3>💡 Insights & Recommendations</h3>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <h4>Best Performer</h4>
                        <p>{locationAnalyticsData.topSellingProducts[0]?.title}</p>
                        <span className="insight-value">{locationAnalyticsData.topSellingProducts[0]?.sales} sales</span>
                      </div>
                      <div className="insight-card">
                        <h4>Needs Attention</h4>
                        <p>{locationAnalyticsData.leastSellingProducts[0]?.title}</p>
                        <span className="insight-value">{locationAnalyticsData.leastSellingProducts[0]?.sales} sales</span>
                      </div>
                      <div className="insight-card">
                        <h4>Revenue Leader</h4>
                        <p>{locationAnalyticsData.topSellingProducts[0]?.title}</p>
                        <span className="insight-value">₹{(locationAnalyticsData.topSellingProducts[0]?.revenue / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedLocationForAnalytics && !locationAnalyticsData && (
                <div className="loading-state">
                  <p>Loading analytics data...</p>
                </div>
              )}

              {!selectedLocationForAnalytics && (
                <div className="empty-state">
                  <h3>📍 Select a location to view analytics</h3>
                  <p>Choose a location from the dropdown above to see detailed product performance analytics</p>
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
              <div className="sales-actions">
                <button 
                  className="refresh-btn"
                  onClick={refreshSalesData}
                  title="Refresh sales data"
                >
                  🔄 Refresh
                </button>
                {salesData && salesData.orders.length > 0 && (
                  <button 
                    className="clear-orders-btn"
                    onClick={clearAllOrders}
                    title="Clear all orders"
                  >
                    🗑️ Clear All Orders
                  </button>
                )}
              </div>
              
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

                <div className="filter-group">
                  <label>Filter by City:</label>
                  <select 
                    className="city-filter-select"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <option value="all">All Cities ({getUniqueCities().length})</option>
                    {getUniqueCities().map(city => (
                      <option key={city} value={city}>
                        {city} ({salesData?.orders?.filter(o => o.location.city === city).length || 0})
                      </option>
                    ))}
                  </select>
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

                  {salesData.orders.length === 0 && (
                    <div className="no-orders-message">
                      <h3>📋 No Orders Yet</h3>
                      <p>Orders created through the POS system will appear here.</p>
                      <p>Try creating a sale as a client user to see orders here!</p>
                    </div>
                  )}

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
                                <span className="location-badge">
                                  📍 {order.location.city}, {order.location.state}
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
                    {cart.length === 0 ? (
                      <div className="empty-cart">
                        <p>Cart is empty</p>
                        <p>Add products to start a sale</p>
                      </div>
                    ) : (
                      <>
                        <div className="cart-items">
                          {cart.map((item) => (
                            <div key={item.id} className="cart-item">
                              <div className="cart-item-info">
                                <span className="cart-item-name">{item.name}</span>
                                <div className="cart-item-controls">
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="quantity-btn"
                                  >-</button>
                                  <span className="quantity">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="quantity-btn"
                                  >+</button>
                                  <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="remove-btn"
                                  >×</button>
                                </div>
                              </div>
                              <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="cart-total">
                          <strong>Total: ₹{getCartTotal().toLocaleString()}</strong>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="payment-section">
                    <h3>Payment</h3>
                    <div className="payment-methods">
                      <button 
                        className={`payment-btn cash ${selectedPaymentMethod === 'cash' ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('cash')}
                      >
                        Cash
                      </button>
                      <button 
                        className={`payment-btn card ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('card')}
                      >
                        Card
                      </button>
                      <button 
                        className={`payment-btn upi ${selectedPaymentMethod === 'upi' ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('upi')}
                      >
                        UPI
                      </button>
                    </div>
                    {selectedPaymentMethod && (
                      <div className="selected-payment">
                        <p>Selected: <strong>{selectedPaymentMethod.toUpperCase()}</strong></p>
                      </div>
                    )}
                      <button 
                        className="complete-sale-btn"
                        onClick={completeSale}
                        disabled={cart.length === 0 || !selectedPaymentMethod}
                      >
                        Complete Sale
                      </button>
                  </div>
                </div>

                <div className="pos-products">
                  <h3>Products</h3>
                  {posLoading ? (
                    <div className="loading-products">
                      <p>Loading products from Shopify...</p>
                    </div>
                  ) : (
                    <div className="product-grid">
                      {posProducts.map((product) => (
                        <div key={product.id} className="product-item">
                          <div className="product-image">
                            {product.image.startsWith('http') ? (
                              <img src={product.image} alt={product.name} />
                            ) : (
                              product.image
                            )}
                          </div>
                          <div className="product-name">{product.name}</div>
                          <div className="product-price">₹{product.price.toLocaleString()}</div>
                          <div className="product-sku">SKU: {product.sku}</div>
                          <div className="product-inventory">Stock: {product.inventory}</div>
                          <button 
                            className="add-to-cart"
                            onClick={() => addToCart(product)}
                            disabled={product.inventory <= 0}
                          >
                            {product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {currentPage !== 'dashboard' && currentPage !== 'products' && currentPage !== 'locations' && currentPage !== 'location-analytics' && currentPage !== 'sales' && currentPage !== 'users' && currentPage !== 'pos' && (
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
    address: location?.address || '',
    phone: location?.phone || '',
    status: location?.status || 'active',
    billing: {
      gst: location?.billing?.gst || '',
      address: location?.billing?.address || '',
      invoicePrefix: location?.billing?.invoicePrefix || ''
    }
  });

  const handleInputChange = (field, value) => {
    if (field.startsWith('billing.')) {
      const billingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billing: {
          ...prev.billing,
          [billingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields (Kiosk Name, Address, Phone)');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal kiosk-modal">
        <div className="modal-header">
          <h2>{location ? 'Edit Kiosk' : 'Add New Kiosk'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="location-form">
          <div className="form-section">
            <h3>📍 Kiosk Information</h3>
            
            <div className="form-group">
              <label>Kiosk Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Mumbai Central Kiosk"
                required
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Complete address of the kiosk"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
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
            </div>
          </div>

          <div className="form-section">
            <h3>🧾 Billing Details</h3>
            
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={formData.billing.gst}
                onChange={(e) => handleInputChange('billing.gst', e.target.value)}
                placeholder="27ABCDE1234F1Z5"
                maxLength="15"
              />
            </div>

            <div className="form-group">
              <label>Billing Address</label>
              <textarea
                value={formData.billing.address}
                onChange={(e) => handleInputChange('billing.address', e.target.value)}
                placeholder="Complete billing address"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Invoice Prefix</label>
              <input
                type="text"
                value={formData.billing.invoicePrefix}
                onChange={(e) => handleInputChange('billing.invoicePrefix', e.target.value)}
                placeholder="VE/MUM/"
                maxLength="20"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {location ? 'Update Kiosk' : 'Create Kiosk'}
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