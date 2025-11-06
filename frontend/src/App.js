import React, { useState, useEffect } from 'react';
import './App.css';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX, FiMenu, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// API URL configuration - works in both development and production
const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

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
  const [shopifyOrders, setShopifyOrders] = useState([]);
  const [shopifyCustomers, setShopifyCustomers] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('any');
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersPerPage] = useState(100);
  const [productsCurrentPage, setProductsCurrentPage] = useState(1);
  const [productsPerPage] = useState(100);
  const [dashboardDateFilter, setDashboardDateFilter] = useState('today'); // today, yesterday, custom
  const [dashboardCompareDate, setDashboardCompareDate] = useState('yesterday'); // For comparison
  const [dashboardCustomDate, setDashboardCustomDate] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // all, admin, client
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(undefined);
  const [locations, setLocations] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    phone: '',
    manager: ''
  });
  const [posProducts, setPosProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [posSearchTerm, setPosSearchTerm] = useState('');
  const [selectedLocationForAnalytics, setSelectedLocationForAnalytics] = useState('');
  const [showCart, setShowCart] = useState(false); // Mobile cart modal visibility
  const [posCurrentPage, setPosCurrentPage] = useState(1);
  const [posProductsPerPage] = useState(12); // Products per page
  
  // Location-based inventory state
  const [shopifyLocations, setShopifyLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(localStorage.getItem('selectedLocationId') || null);
  const [detectedCity, setDetectedCity] = useState(null);
  const [showAllLocations, setShowAllLocations] = useState(user?.role === 'admin'); // Admin can see all
  const [locationAnalyticsData, setLocationAnalyticsData] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // State for city filter on locations page
  const [selectedCity, setSelectedCity] = useState('all');

  // State for company settings
  const [companySettings, setCompanySettings] = useState({
    name: 'SS ENTERPRISES',
    address: 'C-7/31, Sector-7, Rohini Delhi-110085',
    gstin: '08AGFPV7804C1ZQ',
    stateName: 'Rajasthan',
    stateCode: '08',
    phone: '+91 9876543210',
    email: 'ssenterprises255@gmail.com',
    // IGST rates based on product type:
    // Sunglasses: 18% IGST
    // Frames/Eyeglasses: 5% IGST
    bankName: 'Kotak Mahindra Bank',
    accountNumber: '2512756589',
    ifscCode: 'KKBK0004485'
  });

  // State for customer information form
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // State for backup management
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [editingBackup, setEditingBackup] = useState(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // State for user-location assignments
  const [assignments, setAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAssignmentLocationId, setSelectedAssignmentLocationId] = useState(''); // Renamed to avoid conflict with location-based inventory
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: ''
  });

  const handleLogin = (email, password) => {
    // First, check for hardcoded admin account
    if (email === 'admin@possystem.com' && password === 'admin123') {
      const adminUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@possystem.com',
        password: 'admin123',
        role: { name: 'admin', permissions: { users: { create: true, read: true, update: true, delete: true } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '1'
      };
      
      Cookies.set('token', 'demo-token', { expires: 7 });
      setUser(adminUser);
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
      return { success: true };
    }
    
    // Check for users in localStorage
    const savedUsers = localStorage.getItem('pos_users_data');
    if (savedUsers) {
      const usersData = JSON.parse(savedUsers);
      const foundUser = usersData.users?.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        if (foundUser.status !== 'active') {
          return { success: false, message: 'Account is inactive. Please contact administrator.' };
        }
        
        const loggedInUser = {
          id: foundUser.id,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          email: foundUser.email,
          role: { name: foundUser.role, permissions: foundUser.permissions },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
          roleId: foundUser.role === 'super_admin' ? '0' : foundUser.role === 'admin' ? '1' : '2'
      };
    
        Cookies.set('token', 'demo-token', { expires: 7 });
        setUser(loggedInUser);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
        return { success: true };
      }
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    setIsMobileSidebarOpen(false); // Close mobile menu on logout
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setIsMobileSidebarOpen(false); // Close mobile menu when navigating
    
    if (page === 'dashboard') {
      // Refresh dashboard data
      loadSalesData();
      loadShopifyProducts();
      loadLocations();
    } else if (page === 'products') {
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
    // Check if users were cleared by cleanup
    const savedUsers = localStorage.getItem('pos_users_data');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsersData(parsedUsers);
      return;
    }

    // Demo users data with different roles and permissions
    const demoUsersData = {
      users: [
        {
          id: '1',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@possystem.com',
          password: 'super123',
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
          password: 'rajesh123',
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
          password: 'priya123',
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
          password: 'amit123',
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
          password: 'sneha123',
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
          password: 'vikram123',
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
      // Load real sales data from localStorage
      const savedSalesData = localStorage.getItem('pos_sales_data');
      const location = locationData?.cities?.find(city => city.id === locationId) || 
                      locations?.find(loc => loc.id.toString() === locationId || loc.name.toLowerCase() === locationId.toLowerCase());
      
      if (!location) {
        toast.error('Location not found');
        return;
      }

      let productSalesMap = {};
      let totalLocationSales = 0;
      let totalLocationRevenue = 0;
      
      // Parse real sales data if available
      if (savedSalesData) {
        const parsedSalesData = JSON.parse(savedSalesData);
        
        if (parsedSalesData.orders && parsedSalesData.orders.length > 0) {
          // Filter orders by location
          const locationOrders = parsedSalesData.orders.filter(order => {
            const orderLocation = order.location?.city || order.city || '';
            return orderLocation.toLowerCase() === location.name?.toLowerCase() || 
                   orderLocation.toLowerCase() === location.city?.toLowerCase();
          });

          // Aggregate product sales data
          locationOrders.forEach(order => {
            order.items?.forEach(item => {
              const productKey = item.title || item.name;
              if (!productSalesMap[productKey]) {
                productSalesMap[productKey] = {
                  id: item.id || productKey,
                  title: productKey,
                  sales: 0,
                  revenue: 0
                };
              }
              productSalesMap[productKey].sales += item.quantity || 1;
              productSalesMap[productKey].revenue += (item.price * (item.quantity || 1));
              totalLocationRevenue += (item.price * (item.quantity || 1));
            });
            totalLocationSales++;
          });
        }
      }

      // Convert map to array and sort
      const productsArray = Object.values(productSalesMap);
      
      if (productsArray.length === 0) {
        // No real data, show empty state with message
      const analyticsData = {
          location: location,
          topSellingProducts: [],
          leastSellingProducts: [],
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          isEmpty: true
        };
        setLocationAnalyticsData(analyticsData);
        return;
      }

      const sortedProducts = productsArray.sort((a, b) => b.sales - a.sales);
      
      const analyticsData = {
        location: location,
        topSellingProducts: sortedProducts.slice(0, 5),
        leastSellingProducts: sortedProducts.slice(-5).reverse(),
        totalProducts: productsArray.length,
        totalSales: totalLocationSales,
        totalRevenue: totalLocationRevenue,
        isEmpty: false
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

  // Load locations from localStorage
  const loadLocations = () => {
    const savedLocations = localStorage.getItem('pos_locations');
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      // Initialize with demo locations
      const demoLocations = [
        {
          id: 1,
          name: 'Main Store',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: '123 Main Street, Andheri, Mumbai',
          phone: '+91 98765 43210',
          manager: 'Rajesh Kumar',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Mall Branch',
          city: 'Delhi',
          state: 'Delhi',
          address: '456 Mall Road, Connaught Place, Delhi',
          phone: '+91 98765 43211',
          manager: 'Priya Sharma',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      setLocations(demoLocations);
      localStorage.setItem('pos_locations', JSON.stringify(demoLocations));
    }
  };

  // Add new location
  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.city || !newLocation.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    const location = {
      id: Date.now(),
      ...newLocation,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const updatedLocations = [...locations, location];
    setLocations(updatedLocations);
    localStorage.setItem('pos_locations', JSON.stringify(updatedLocations));
    
    // Reset form
    setNewLocation({
      name: '',
      city: '',
      state: '',
      address: '',
      phone: '',
      manager: ''
    });
    setShowAddLocationModal(false);
    toast.success('Location added successfully!');
  };

  // Remove location
  const handleRemoveLocation = (locationId) => {
    if (window.confirm('Are you sure you want to remove this location?')) {
      const updatedLocations = locations.filter(loc => loc.id !== locationId);
      setLocations(updatedLocations);
      localStorage.setItem('pos_locations', JSON.stringify(updatedLocations));
      toast.success('Location removed successfully!');
    }
  };

  // Toggle location status
  const toggleLocationStatus = (locationId) => {
    const updatedLocations = locations.map(loc => 
      loc.id === locationId 
        ? { ...loc, status: loc.status === 'active' ? 'inactive' : 'active' }
        : loc
    );
    setLocations(updatedLocations);
    localStorage.setItem('pos_locations', JSON.stringify(updatedLocations));
    toast.success('Location status updated!');
  };

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

  // Load Shopify Orders
  const loadShopifyOrders = async (status = 'any') => {
    try {
      setOrdersLoading(true);
      let token = localStorage.getItem('token');
      // If token is null or "null" string, use demo-token
      if (!token || token === 'null' || token === 'undefined') {
        token = 'demo-token';
      }
      const response = await fetch(`${API_URL}/api/shopify/orders?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Could not fetch Shopify orders (likely credentials not configured)');
        // Load only local orders if Shopify fails
        const localSalesData = JSON.parse(localStorage.getItem('pos_sales_data') || '{}');
        const localOrders = localSalesData.orders || [];
        setShopifyOrders(localOrders);
        setOrdersLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        const shopifyOrdersList = data.data.orders || [];
        
        // 🔥 MERGE localStorage orders with Shopify orders
        const localSalesData = JSON.parse(localStorage.getItem('pos_sales_data') || '{}');
        const localOrders = localSalesData.orders || [];
        
        // Filter out localStorage orders that already exist in Shopify (by ID)
        const shopifyOrderIds = new Set(shopifyOrdersList.map(o => o.id));
        const uniqueLocalOrders = localOrders.filter(o => !shopifyOrderIds.has(o.id));
        
        // Merge: localStorage orders first (most recent), then Shopify orders
        const mergedOrders = [...uniqueLocalOrders, ...shopifyOrdersList];
        
        console.log(`🔥 Merged orders: ${uniqueLocalOrders.length} from localStorage + ${shopifyOrdersList.length} from Shopify = ${mergedOrders.length} total`);
        
        setShopifyOrders(mergedOrders);
        toast.success(`Loaded ${mergedOrders.length} orders (${uniqueLocalOrders.length} local + ${shopifyOrdersList.length} Shopify)`);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.warn('⚠️ Error loading orders (using local orders only):', error.message);
      // Don't show toast error - just use local data gracefully
      const localSalesData = JSON.parse(localStorage.getItem('pos_sales_data') || '{}');
      const localOrders = localSalesData.orders || [];
      setShopifyOrders(localOrders);
      console.log(`📦 Using ${localOrders.length} local orders`);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load Shopify Customers
  const loadShopifyCustomers = async () => {
    try {
      setCustomersLoading(true);
      let token = localStorage.getItem('token');
      // If token is null or "null" string, use demo-token
      if (!token || token === 'null' || token === 'undefined') {
        token = 'demo-token';
      }
      const response = await fetch(`${API_URL}/api/shopify/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      if (data.success) {
        setShopifyCustomers(data.data.customers || []);
        toast.success(`Loaded ${data.data.count} customers`);
      } else {
        toast.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
      setShopifyCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // 🚨 FINAL DEBUG TOOL: Add console helper to inspect localStorage orders
  useEffect(() => {
    // Add global helper function to window object
    window.inspectOrders = () => {
      const salesData = JSON.parse(localStorage.getItem('pos_sales_data') || '{}');
      const orders = salesData.orders || [];
      
      console.log('═══════════════════════════════════════');
      console.log('📦 LOCALSTORAGE ORDERS INSPECTOR');
      console.log('═══════════════════════════════════════');
      console.log(`Total orders in localStorage: ${orders.length}`);
      console.log('---');
      
      orders.slice(0, 10).forEach((order, index) => {
        console.log(`\n📋 Order #${index + 1}: ${order.id}`);
        console.log(`  👤 Customer Name: ${order.customerName || order.clientName || '(NONE)'}`);
        console.log(`  🏠 Address: ${order.customerAddress || order.address || '(NONE)'}`);
        console.log(`  📝 GST: ${order.customerGstNumber || order.gstNumber || '(NONE)'}`);
        console.log(`  📅 Date: ${order.transactionDate || order.date || '(NONE)'}`);
        console.log(`  💰 Total: ₹${order.total || 0}`);
      });
      
      console.log('\n═══════════════════════════════════════');
      console.log('💡 TIP: To test customer details on invoice:');
      console.log('1. Go to POS page');
      console.log('2. Add a product to cart');
      console.log('3. Click "Complete Sale"');
      console.log('4. Fill in customer details (Name, Phone, Address, GST)');
      console.log('5. Complete the sale');
      console.log('6. Go to Invoice page and click Preview on that NEW order');
      console.log('═══════════════════════════════════════');
      
      return orders;
    };
    
    console.log('✅ Debug tool loaded! Type window.inspectOrders() in console to inspect orders');
  }, []);

  // Ensure data loads when selectedDate changes
  useEffect(() => {
    if (currentPage === 'locations' && selectedDate) {
      loadLocationData();
    }
  }, [selectedDate, customDate, currentPage]);

  // Load Shopify Orders when page changes or filter changes
  useEffect(() => {
    if (currentPage === 'shopify-orders') {
      loadShopifyOrders(orderStatusFilter);
      setOrdersCurrentPage(1); // Reset to first page when filter changes
    }
  }, [currentPage, orderStatusFilter]);

  // Load Shopify Orders for dashboard analytics
  useEffect(() => {
    if (currentPage === 'dashboard') {
      loadShopifyOrders('any'); // Load all orders for analytics
    }
  }, [currentPage]);

  // Load assigned locations when sales page is accessed (for client users)
  useEffect(() => {
    if (currentPage === 'sales' && user && user.role && (user.role.name === 'client' || user.role === 'client')) {
      loadUserAssignedLocations();
    }
  }, [currentPage, user]);

  // Load Shopify Customers when page changes
  useEffect(() => {
    if (currentPage === 'shopify-customers') {
      loadShopifyCustomers();
    }
  }, [currentPage]);

  // Load POS products when POS page is accessed
  useEffect(() => {
    const initializePOS = async () => {
      if (currentPage === 'pos') {
        // Fetch Shopify locations first
        await fetchShopifyLocations();
        
        // Load user's assigned locations
        const userAssignedLocationIds = await loadUserAssignedLocations();
        
        let locationToUse = selectedLocationId;
        
        // For non-admin users with assigned locations, restrict to their locations
        if (userAssignedLocationIds && userAssignedLocationIds.length > 0) {
          console.log(`🔒 User restricted to ${userAssignedLocationIds.length} assigned locations`);
          
          // If no location selected or selected location is not in assigned list, use first assigned location
          if (!locationToUse || !userAssignedLocationIds.includes(parseInt(locationToUse))) {
            locationToUse = userAssignedLocationIds[0].toString();
            setSelectedLocationId(locationToUse);
            localStorage.setItem('selectedLocationId', locationToUse);
            console.log(`📍 Auto-selected first assigned location: ${locationToUse}`);
          }
        } else if (!locationToUse) {
          // Admin or user with no restrictions - auto-detect location
          locationToUse = await detectCustomerLocation();
        }
        
        // Load products with location filter
        if (posProducts.length === 0 || locationToUse !== selectedLocationId) {
          loadPosProducts(locationToUse);
        }
      }
    };
    
    initializePOS();
  }, [currentPage, user]); // Re-run when page or user changes
  
  // Reload products when showAllLocations toggle changes (admin only)
  useEffect(() => {
    if (currentPage === 'pos' && user?.role === 'admin') {
      loadPosProducts(showAllLocations ? null : selectedLocationId);
    }
  }, [showAllLocations]);

  // Load location data when Location Analytics page is accessed
  useEffect(() => {
    if (currentPage === 'location-analytics') {
      if (!locationData) {
      loadLocationData();
      }
      fetchShopifyLocations(); // Fetch Shopify locations for analytics
    }
  }, [currentPage, locationData]);

  // Load assignments when Assign Locations page is accessed
  useEffect(() => {
    if (currentPage === 'assign-locations') {
      loadAssignments();
      fetchShopifyLocations(); // Load Shopify locations instead of database locations
      if (!usersData) {
        loadUsersData();
      }
    }
  }, [currentPage]);

  // Load initial data on component mount
  useEffect(() => {
    loadSalesData();
    loadShopifyProducts(); // Load products for dashboard
    loadLocations(); // Load locations for dashboard
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset products pagination when search term changes
  useEffect(() => {
    setProductsCurrentPage(1);
  }, [productSearchTerm]);

  // Load real invoice data when locations page is accessed
  useEffect(() => {
    if (currentPage === 'locations') {
      loadRealInvoiceData();
      fetchShopifyLocations(); // Fetch Shopify locations for filter
    }
  }, [currentPage]);

  // Load backups when data management page is accessed
  useEffect(() => {
    if (currentPage === 'data') {
      loadBackups();
    }
  }, [currentPage]);

  // Clear any demo data on component mount
  useEffect(() => {
    // Clear any existing demo data to start fresh
    const savedData = localStorage.getItem('pos_sales_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Check if it contains demo data (John Smith, Sarah Johnson, etc.) OR orders without proper createdBy structure
      const hasDemoData = parsed.orders?.some(order => {
        // Check for demo client names
        const isDemoName = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown', 'Lisa Anderson', 'Sale', 'Sale2'].some(
          name => order.clientName?.includes(name)
        );
        
        // Check if order has old format (no createdBy object with user details)
        const hasOldFormat = !order.createdBy || typeof order.createdBy === 'string' || 
          !order.createdBy.id || !order.createdBy.firstName;
        
        return isDemoName || hasOldFormat;
      });
      
      if (hasDemoData) {
        localStorage.removeItem('pos_sales_data');
        console.log('Cleared demo/old format data from localStorage');
        // Set empty sales data
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
      }
    }
  }, []);

  // Filter and search functions for sales
  const getFilteredOrders = () => {
    if (!salesData) return [];
    
    let filtered = salesData.orders;
    
    // Apply location-based access control for client users
    if (user && user.role && (user.role.name === 'client' || user.role === 'client')) {
      // If user has assigned locations, filter orders by those locations
      if (assignedLocations && assignedLocations.length > 0) {
        const assignedLocationIds = assignedLocations.map(loc => parseInt(loc.id));
        
        console.log(`🔒 Client filtering by assigned locations:`, assignedLocationIds);
        console.log(`📦 Total orders before filter:`, filtered.length);
        
        filtered = filtered.filter(order => {
          const orderLocationId = parseInt(order.location?.shopifyLocationId || order.shopifyLocationId || 0);
          const isMatch = assignedLocationIds.includes(orderLocationId);
          
          if (isMatch) {
            console.log(`✅ Order ${order.id} matches location ${orderLocationId}`);
          }
          
          return isMatch;
        });
        
        console.log(`📊 Showing ${filtered.length} orders from ${assignedLocationIds.length} assigned locations`);
      } else {
        // No assigned locations - show no orders
        console.log('⚠️ Client has no assigned locations - showing no orders');
        filtered = [];
      }
    }
    
    // Apply status filter
    if (salesFilter === 'defected') {
      filtered = filtered.filter(order => order.status === 'defected');
    } else if (salesFilter === 'completed') {
      filtered = filtered.filter(order => order.status === 'completed');
    }

    // Apply city filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(order => (order.location?.city || order.city) === cityFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        (order.clientName || order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items || []).some(item => 
          (item.productName || item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  // Calculate stats from filtered orders (for client users who see only their sales)
  const getFilteredStats = () => {
    const filteredOrders = getFilteredOrders();
    
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    const defectedOrders = filteredOrders.filter(order => order.status === 'defected').length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const defectedRevenue = filteredOrders.filter(order => order.status === 'defected').reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalOrders,
      completedOrders,
      defectedOrders,
      totalRevenue,
      defectedRevenue,
      averageOrderValue
    };
  };

  // Get dashboard statistics based on user role
  const getDashboardStats = () => {
    if (!salesData || !salesData.orders) {
      return {
        todaySales: 0,
        totalOrders: 0,
        totalProducts: products.length,
        totalLocations: locations ? locations.length : 0
      };
    }

    // Get today's date
    const today = new Date().toLocaleDateString('en-IN');
    
    // Filter orders based on user role and assigned locations
    let userOrders = salesData.orders;
    if (user && user.role && (user.role.name === 'client' || user.role === 'client')) {
      // Client users see only sales from their assigned locations
      if (assignedLocations && assignedLocations.length > 0) {
        const assignedLocationIds = assignedLocations.map(loc => parseInt(loc.id));
        
        userOrders = salesData.orders.filter(order => {
          const orderLocationId = parseInt(order.location?.shopifyLocationId || order.shopifyLocationId || 0);
          return assignedLocationIds.includes(orderLocationId);
        });
        
        console.log(`📊 Dashboard stats: Showing ${userOrders.length} orders from ${assignedLocationIds.length} locations`);
      } else {
        // No assigned locations - show no orders
        console.log('📊 Dashboard stats: No assigned locations - showing 0 orders');
        userOrders = [];
      }
    }

    // Calculate today's sales
    const todayOrders = userOrders.filter(order => {
      try {
        const orderDate = new Date(order.timestamp || order.createdAt).toLocaleDateString('en-IN');
        return orderDate === today;
      } catch {
        return false;
      }
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = userOrders.length;
    const totalProducts = products.length;
    const totalLocations = locations ? locations.length : 0;

    return {
      todaySales,
      totalOrders,
      totalProducts,
      totalLocations
    };
  };

  // Enhanced analytics with date filtering and comparison (using Shopify data)
  const getEnhancedAnalytics = () => {
    console.log(`📊 Analytics: Processing ${shopifyOrders?.length || 0} Shopify orders`);
    
    if (!shopifyOrders || shopifyOrders.length === 0) {
      return {
        current: { sales: 0, orders: 0, sessions: 0, conversion: 0 },
        previous: { sales: 0, orders: 0, sessions: 0, conversion: 0 },
        comparison: { sales: 0, orders: 0, sessions: 0, conversion: 0 },
        chartData: []
      };
    }

    // Filter orders based on user role (using Shopify location data)
    let userOrders = shopifyOrders;
    if (user && user.role && (user.role.name === 'client' || user.role === 'client')) {
      if (assignedLocations && assignedLocations.length > 0) {
        const assignedLocationIds = assignedLocations.map(loc => parseInt(loc.id));
        userOrders = shopifyOrders.filter(order => {
          const orderLocationId = parseInt(order.location_id || 0);
          return assignedLocationIds.includes(orderLocationId);
        });
      } else {
        userOrders = [];
      }
    }

    // Get current and previous date ranges
    const now = new Date();
    let currentDate, previousDate;
    
    if (dashboardDateFilter === 'today') {
      currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      previousDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (dashboardDateFilter === 'yesterday') {
      currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      previousDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    } else {
      currentDate = dashboardCustomDate ? new Date(dashboardCustomDate) : new Date();
      previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
    }

    // Filter orders for current and previous periods (using Shopify date format)
    const currentOrders = userOrders.filter(order => {
      const orderDate = new Date(order.created_at || order.timestamp || order.createdAt);
      return orderDate.toLocaleDateString('en-IN') === currentDate.toLocaleDateString('en-IN');
    });

    const previousOrders = userOrders.filter(order => {
      const orderDate = new Date(order.created_at || order.timestamp || order.createdAt);
      return orderDate.toLocaleDateString('en-IN') === previousDate.toLocaleDateString('en-IN');
    });

    // Calculate metrics (using Shopify total_price field)
    const currentSales = currentOrders.reduce((sum, order) => {
      const price = parseFloat(order.total_price || order.current_total_price || order.total || 0);
      return sum + price;
    }, 0);
    const previousSales = previousOrders.reduce((sum, order) => {
      const price = parseFloat(order.total_price || order.current_total_price || order.total || 0);
      return sum + price;
    }, 0);
    
    const currentOrdersCount = currentOrders.length;
    const previousOrdersCount = previousOrders.length;
    
    console.log(`📊 Current period: ${currentOrdersCount} orders, ₹${currentSales.toFixed(2)}`);
    console.log(`📊 Previous period: ${previousOrdersCount} orders, ₹${previousSales.toFixed(2)}`);
    
    // Mock sessions (you can integrate real analytics later)
    const currentSessions = Math.floor(currentOrdersCount * (Math.random() * 2 + 1));
    const previousSessions = Math.floor(previousOrdersCount * (Math.random() * 2 + 1));
    
    const currentConversion = currentSessions > 0 ? (currentOrdersCount / currentSessions) * 100 : 0;
    const previousConversion = previousSessions > 0 ? (previousOrdersCount / previousSessions) * 100 : 0;

    // Calculate comparison percentages
    const salesComparison = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;
    const ordersComparison = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;
    const sessionsComparison = previousSessions > 0 ? ((currentSessions - previousSessions) / previousSessions) * 100 : 0;
    const conversionComparison = previousConversion > 0 ? ((currentConversion - previousConversion) / previousConversion) * 100 : 0;

    // Generate hourly chart data (using Shopify created_at)
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      const currentHourOrders = currentOrders.filter(order => {
        const orderHour = new Date(order.created_at || order.timestamp || order.createdAt).getHours();
        return orderHour === hour;
      });
      const previousHourOrders = previousOrders.filter(order => {
        const orderHour = new Date(order.created_at || order.timestamp || order.createdAt).getHours();
        return orderHour === hour;
      });
      
      chartData.push({
        hour,
        current: currentHourOrders.length,
        previous: previousHourOrders.length
      });
    }

    return {
      current: {
        sales: currentSales,
        orders: currentOrdersCount,
        sessions: currentSessions,
        conversion: currentConversion
      },
      previous: {
        sales: previousSales,
        orders: previousOrdersCount,
        sessions: previousSessions,
        conversion: previousConversion
      },
      comparison: {
        sales: salesComparison,
        orders: ordersComparison,
        sessions: sessionsComparison,
        conversion: conversionComparison
      },
      chartData
    };
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


  const handleAddUser = () => {
    setEditingUser({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'client',
      location: '',
      status: 'active',
      permissions: {
        users: { create: false, read: false, update: false, delete: false, hidden: false },
        products: { create: false, read: true, update: false, delete: false, hidden: false },
        sales: { create: false, read: true, update: false, delete: false, hidden: false },
        locations: { create: false, read: false, update: false, delete: false, hidden: true },
        reports: { create: false, read: false, update: false, delete: false, hidden: true }
      }
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const savedUsers = localStorage.getItem('pos_users_data');
      if (savedUsers) {
        const usersDataParsed = JSON.parse(savedUsers);
        const updatedUsers = usersDataParsed.users.filter(u => u.id !== userId);
        
        const updatedUsersData = {
          users: updatedUsers,
          stats: {
            totalUsers: updatedUsers.length,
            activeUsers: updatedUsers.filter(u => u.status === 'active').length,
            inactiveUsers: updatedUsers.filter(u => u.status === 'inactive').length,
            adminUsers: updatedUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length,
            clientUsers: updatedUsers.filter(u => u.role === 'client').length
          }
        };
        
        localStorage.setItem('pos_users_data', JSON.stringify(updatedUsersData));
        setUsersData(updatedUsersData);
        toast.success('User deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = (userId) => {
    try {
      const savedUsers = localStorage.getItem('pos_users_data');
      if (savedUsers) {
        const usersDataParsed = JSON.parse(savedUsers);
        const updatedUsers = usersDataParsed.users.map(u => {
          if (u.id === userId) {
            return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
          }
          return u;
        });
        
        const updatedUsersData = {
          users: updatedUsers,
          stats: {
            totalUsers: updatedUsers.length,
            activeUsers: updatedUsers.filter(u => u.status === 'active').length,
            inactiveUsers: updatedUsers.filter(u => u.status === 'inactive').length,
            adminUsers: updatedUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length,
            clientUsers: updatedUsers.filter(u => u.role === 'client').length
          }
        };
        
        localStorage.setItem('pos_users_data', JSON.stringify(updatedUsersData));
        setUsersData(updatedUsersData);
        
        const newStatus = updatedUsers.find(u => u.id === userId)?.status;
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleCloseUserForm = () => {
    setEditingUser(null);
  };

  const handleSaveUser = (userData) => {
    try {
      const savedUsers = localStorage.getItem('pos_users_data');
      let usersDataParsed = savedUsers ? JSON.parse(savedUsers) : { users: [], stats: {} };
      
      if (userData.id) {
        // Update existing user
        const updatedUsers = usersDataParsed.users.map(u => {
          if (u.id === userData.id) {
            // Only update password if a new one was provided
            const updateData = { ...userData };
            if (!updateData.password || updateData.password.trim() === '') {
              delete updateData.password; // Keep existing password
            }
            return { ...u, ...updateData };
          }
          return u;
        });
        
        const updatedUsersData = {
          users: updatedUsers,
          stats: {
            totalUsers: updatedUsers.length,
            activeUsers: updatedUsers.filter(u => u.status === 'active').length,
            inactiveUsers: updatedUsers.filter(u => u.status === 'inactive').length,
            adminUsers: updatedUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length,
            clientUsers: updatedUsers.filter(u => u.role === 'client').length
          }
        };
        
        localStorage.setItem('pos_users_data', JSON.stringify(updatedUsersData));
        setUsersData(updatedUsersData);
        toast.success('User updated successfully!');
      } else {
        // Create new user
        const newUser = {
          ...userData,
          id: `user-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0]
        };
        
        const updatedUsers = [...usersDataParsed.users, newUser];
        
        const updatedUsersData = {
          users: updatedUsers,
          stats: {
            totalUsers: updatedUsers.length,
            activeUsers: updatedUsers.filter(u => u.status === 'active').length,
            inactiveUsers: updatedUsers.filter(u => u.status === 'inactive').length,
            adminUsers: updatedUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length,
            clientUsers: updatedUsers.filter(u => u.role === 'client').length
          }
        };
        
        localStorage.setItem('pos_users_data', JSON.stringify(updatedUsersData));
        setUsersData(updatedUsersData);
        toast.success('User created successfully!');
      }
      
    setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleCreateLocation = () => {
    setEditingLocation(null);
  };


  const handleCloseLocationForm = () => {
    setEditingLocation(undefined);
  };

  const handleSaveLocation = async (locationData) => {
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      if (locationData.id) {
        // Update existing location
        const response = await axios.put(
          `${apiUrl}/api/locations/${locationData.id}`,
          locationData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Location updated successfully!');
          await loadAllLocations();
    loadLocationData();
        }
      } else {
        // Create new location
        const response = await axios.post(
          `${apiUrl}/api/locations`,
          locationData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Location created successfully!');
          await loadAllLocations();
          loadLocationData();
        }
      }
      
    setEditingLocation(undefined);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(error.response?.data?.message || 'Failed to save location');
    }
  };

  const loadAllLocations = async () => {
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.get(
        `${apiUrl}/api/locations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setLocations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      // Don't show error toast for initial load
    }
  };

  const handleDeleteLocation = async (locationId, locationName) => {
    if (!window.confirm(`Are you sure you want to delete location "${locationName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.delete(
        `${apiUrl}/api/locations/${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Location deleted successfully!');
        await loadAllLocations();
        loadLocationData();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(error.response?.data?.message || 'Failed to delete location');
    }
  };

  // Backup Management Functions
  const loadBackups = async () => {
    try {
      setBackupLoading(true);
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.get(
        `${apiUrl}/api/backups`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setBackups(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleCreateBackup = async (backupData) => {
    try {
      setBackupLoading(true);
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.post(
        `${apiUrl}/api/backups`,
        backupData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Backup created successfully! Processing...');
        setShowBackupModal(false);
        
        // Reload backups after a delay to show the processing status
        setTimeout(() => {
          loadBackups();
        }, 1000);
        
        // Check status after processing time
        setTimeout(() => {
          loadBackups();
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(error.response?.data?.message || 'Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleUpdateBackup = async (backupId, updateData) => {
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.put(
        `${apiUrl}/api/backups/${backupId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Backup updated successfully!');
        setEditingBackup(null);
        loadBackups();
      }
    } catch (error) {
      console.error('Error updating backup:', error);
      toast.error(error.response?.data?.message || 'Failed to update backup');
    }
  };

  const handleDeleteBackup = async (backupId, backupName) => {
    if (!window.confirm(`Are you sure you want to delete backup "${backupName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.delete(
        `${apiUrl}/api/backups/${backupId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Backup deleted successfully!');
        loadBackups();
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error(error.response?.data?.message || 'Failed to delete backup');
    }
  };

  const handleDownloadBackup = async (backupId, backupName) => {
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.get(
        `${apiUrl}/api/backups/${backupId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backupName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Failed to download backup');
    }
  };

  const handleCleanupData = async () => {
    try {
      setCleanupLoading(true);
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.post(
        `${apiUrl}/api/data/cleanup`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Clear localStorage for all data except products
        localStorage.removeItem('pos_sales_data');
        localStorage.removeItem('pos_locations');
        localStorage.removeItem('pos_invoices');
        localStorage.removeItem('pos_backups');
        
        // Set empty users data (keep only super admin for login)
        const emptyUsersData = {
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
              lastLogin: new Date().toISOString().split('T')[0],
              location: 'Mumbai'
            }
          ],
          stats: {
            totalUsers: 1,
            activeUsers: 1,
            inactiveUsers: 0,
            adminUsers: 1,
            clientUsers: 0
          }
        };
        localStorage.setItem('pos_users_data', JSON.stringify(emptyUsersData));
        
        // Reset state variables
        setSalesData(null);
        setLocations([]);
        setBackups([]);
        setUsersData(emptyUsersData);
        
        // Close modal and show success
        setShowCleanupModal(false);
        toast.success('All data cleaned up successfully! Products remain intact. Refreshing page...');
        
        // Reload the page to reset everything
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error cleaning up data:', error);
      toast.error(error.response?.data?.message || 'Failed to cleanup data');
    } finally {
      setCleanupLoading(false);
    }
  };

  // User-Location Assignment Functions
  const loadAssignments = async () => {
    try {
      setAssignmentLoading(true);
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.get(
        `${apiUrl}/api/user-locations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Load current user's assigned locations
  const loadUserAssignedLocations = async () => {
    if (!user || !user.id) {
      console.log('⚠️  No user logged in, cannot load assigned locations');
      return [];
    }

    // Admins can see all locations
    if (user.role === 'admin' || user.role === 'super_admin') {
      console.log('✅ Admin user - can access all locations');
      setAssignedLocations([]);
      return [];
    }

    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      console.log(`📍 Loading assigned locations for user: ${user.id}`);
      
      const response = await axios.get(
        `${apiUrl}/api/user-locations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Filter for current user's active assignments
        const userAssignments = response.data.data.filter(
          assignment => assignment.userId === user.id && assignment.isActive
        );
        
        // Map database location IDs to Shopify location IDs
        const assignedLocationIds = userAssignments.map(a => a.locationId);
        console.log(`✅ User assigned to ${assignedLocationIds.length} database locations:`, assignedLocationIds);
        
        // Fetch Shopify locations to map IDs
        await fetchShopifyLocations();
        
        // Find matching Shopify locations
        const matchedLocations = shopifyLocations.filter(loc => 
          assignedLocationIds.includes(parseInt(loc.id))
        );
        
        console.log(`📍 Matched ${matchedLocations.length} Shopify locations:`, matchedLocations.map(l => ({id: l.id, name: l.name})));
        
        setAssignedLocations(matchedLocations);
        return matchedLocations.map(loc => parseInt(loc.id));
      }
    } catch (error) {
      console.error('Error loading user assigned locations:', error);
    }
    
    return [];
  };

  const handleAssignUserToLocation = async () => {
    if (!selectedUserId || !selectedAssignmentLocationId) {
      toast.error('Please select both user and location');
      return;
    }

    try {
      setAssignmentLoading(true);
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.post(
        `${apiUrl}/api/user-locations`,
        {
          userId: selectedUserId,
          locationId: parseInt(selectedAssignmentLocationId),
          isActive: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('User assigned to location successfully!');
        setSelectedUserId('');
        setSelectedLocationId('');
        await loadAssignments();
      }
    } catch (error) {
      console.error('Error assigning user to location:', error);
      toast.error(error.response?.data?.message || 'Failed to assign user to location');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.delete(
        `${apiUrl}/api/user-locations/${assignmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Assignment removed successfully!');
        await loadAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const handleToggleAssignmentStatus = async (assignmentId, currentStatus) => {
    try {
      const token = Cookies.get('token') || 'demo-token';
      const apiUrl = API_URL;
      
      const response = await axios.put(
        `${apiUrl}/api/user-locations/${assignmentId}`,
        {
          isActive: !currentStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success(`Assignment ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        await loadAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast.error('Failed to update assignment status');
    }
  };

  const loadShopifyProducts = async () => {
    setLoading(true);
    try {
      // Fetch real products from backend Shopify API (proxy)
      console.log('Fetching products from backend Shopify API...');
      
      const response = await fetch(`${API_URL}/api/shopify/products`, {
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

  // Fetch Shopify locations
  const fetchShopifyLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/shopify/locations`, {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.locations) {
          console.log('📍 Shopify Locations:', data.data.locations);
          setShopifyLocations(data.data.locations);
          return data.data.locations;
        }
      }
    } catch (error) {
      console.error('Error fetching Shopify locations:', error);
    }
    return [];
  };

  // Auto-detect customer location from IP
  const detectCustomerLocation = async () => {
    try {
      console.log('🌍 Auto-detecting customer location...');
      const response = await fetch(`${API_URL}/api/geolocation/detect`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Location detected:', data.data);
          setDetectedCity(data.data.detectedLocation.city);
          
          // If user hasn't manually selected a location, use the detected one
          if (!selectedLocationId && data.data.matchedLocationId) {
            const locationId = data.data.matchedLocationId.toString();
            setSelectedLocationId(locationId);
            localStorage.setItem('selectedLocationId', locationId);
            return locationId;
          }
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error);
    }
    return selectedLocationId;
  };

  // Handle manual location change by customer/admin
  const handleLocationChange = (locationId) => {
    console.log(`📍 Location changed to: ${locationId}`);
    setSelectedLocationId(locationId);
    localStorage.setItem('selectedLocationId', locationId);
    loadPosProducts(locationId);
  };

  const loadPosProducts = async (locationId = null) => {
    setPosLoading(true);
    try {
      // Fetch real products from backend Shopify API for POS
      // If locationId is provided and user is not admin (or admin hasn't toggled showAllLocations), filter by location
      const shouldFilterByLocation = locationId && (!user || user.role !== 'admin' || !showAllLocations);
      
      console.log(`Fetching POS products from backend Shopify API... ${shouldFilterByLocation ? `(filtered by location: ${locationId})` : '(all locations)'}`);
      
      const url = shouldFilterByLocation 
        ? `${API_URL}/api/shopify/products?locationId=${locationId}`
        : `${API_URL}/api/shopify/products`;
      
      const response = await fetch(url, {
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
      console.log('🔍 FULL Shopify API Response:', JSON.stringify(data, null, 2));

      if (data.success && data.data && data.data.products && data.data.products.length > 0) {
        console.log('📦 Total products received:', data.data.products.length);
        console.log('🖼️  First product raw data:', JSON.stringify(data.data.products[0], null, 2));
        
        // Transform Shopify products to POS format
        const transformedProducts = data.data.products.map((product, index) => {
          const variant = product.variants && product.variants[0];
          
          // Extract image URL - handle different image formats
          let imageUrl = '🕶️'; // Default emoji fallback
          
          console.log(`\n🔍 Processing product ${index + 1}: ${product.title}`);
          console.log('  - Has images array?', !!product.images, 'Length:', product.images?.length);
          console.log('  - Has image field?', !!product.image);
          console.log('  - Raw images:', product.images);
          console.log('  - Raw image:', product.image);
          
          if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            console.log('  - First image object:', firstImage);
            imageUrl = firstImage.src || firstImage.url || firstImage;
            console.log(`  ✅ Image extracted:`, imageUrl);
          } else if (product.image) {
            // Some Shopify responses have a single image field
            console.log('  - Single image object:', product.image);
            imageUrl = typeof product.image === 'string' ? product.image : (product.image.src || product.image.url || product.image);
            console.log(`  ✅ Single image extracted:`, imageUrl);
          } else {
            console.warn(`  ⚠️  NO IMAGE FOUND - product will show emoji`);
          }
          
         // Determine product type and GST rate based on product title/tags
         const isSunglasses = product.title.toLowerCase().includes('sunglasses') ||
                             product.title.toLowerCase().includes('sun') ||
                             product.tags?.some(tag => tag.toLowerCase().includes('sunglasses'));
         const isEyeglasses = product.title.toLowerCase().includes('eyeglasses') ||
                             product.title.toLowerCase().includes('eyeglass') ||
                             product.title.toLowerCase().includes('frame') ||
                             product.title.toLowerCase().includes('eyewear') ||
                             product.title.toLowerCase().includes('wayfarer') ||
                             product.tags?.some(tag => tag.toLowerCase().includes('eyeglasses')) ||
                             product.tags?.some(tag => tag.toLowerCase().includes('frames'));

         const productType = isEyeglasses ? 'eyeglasses' : (isSunglasses ? 'sunglasses' : 'sunglasses');
         const hsnCode = isEyeglasses ? '90031900' : '90041000';
         const gstRate = isEyeglasses ? 5 : 18;
          
          // Use location-specific inventory if available, otherwise use global inventory
          const locationInventory = variant && variant.location_inventory !== undefined 
            ? variant.location_inventory 
            : (variant ? (variant.inventory_quantity || 0) : 0);
          
          return {
            id: product.id,
            name: product.title,
            description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Premium eyewear product',
            price: variant ? parseFloat(variant.price) : 0,
            image: imageUrl,
            vendor: product.vendor || 'Voyage Eyewear',
            sku: variant ? variant.sku : '',
            inventory: locationInventory,
            locationFiltered: shouldFilterByLocation, // Flag to show if filtered by location
            productType: productType,
            hsnCode: hsnCode,
            gstRate: gstRate
          };
        });

        setPosProducts(transformedProducts);
        console.log(`Successfully loaded ${transformedProducts.length} POS products from Shopify!`, transformedProducts);
      } else {
        console.log('No products found in Shopify store for POS');
      }
    } catch (error) {
      console.error('❌ Error fetching POS Shopify products:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ API URL was:', `${API_URL}/api/shopify/products`);
      
      toast.error('⚠️ Could not connect to Shopify. Please check your Shopify credentials in environment variables!');
      
      // Fallback to demo products if Shopify API fails
      // Format these to match Shopify product structure
      const demoProducts = [
        {
          id: 1,
          title: "Designer Sunglasses",
          body_html: "Premium designer sunglasses with UV protection",
          vendor: "Voyage Eyewear",
          product_type: "Sunglasses",
          variants: [{
            id: 101,
            price: "2999",
          sku: "DES-SUN-001",
            inventory_quantity: 50
          }],
          image: { src: "https://cdn.shopify.com/s/files/1/0000/0000/products/sunglasses.jpg" },
          images: [{ src: "https://cdn.shopify.com/s/files/1/0000/0000/products/sunglasses.jpg" }],
          inventory_levels: []
        },
        {
          id: 2,
          title: "Sports Sunglasses",
          body_html: "Durable sports sunglasses for active lifestyle",
          vendor: "Voyage Eyewear",
          product_type: "Sunglasses",
          variants: [{
            id: 102,
            price: "1799",
             sku: "SPO-SUN-002",
            inventory_quantity: 30
          }],
          image: { src: "https://cdn.shopify.com/s/files/1/0000/0000/products/sports.jpg" },
          images: [{ src: "https://cdn.shopify.com/s/files/1/0000/0000/products/sports.jpg" }],
          inventory_levels: []
        },
        {
          id: 3,
          title: "Premium Eyeglasses",
          body_html: "High-quality eyeglasses for prescription lenses",
          vendor: "Voyage Eyewear",
          product_type: "Eyeglasses",
          variants: [{
            id: 103,
            price: "999",
             sku: "EYE-PRE-003",
            inventory_quantity: 25
          }],
          image: { src: "https://cdn.shopify.com/s/files/1/0000/0000/products/eyeglasses.jpg" },
          images: [{ src: "https://cdn.shopify.com/s/files/1/0000/0000/products/eyeglasses.jpg" }],
          inventory_levels: []
        },
        {
          id: 4,
          title: "Classic Sunglasses",
          body_html: "Classic sunglasses for everyday wear",
          vendor: "Voyage Eyewear",
          product_type: "Sunglasses",
          variants: [{
            id: 104,
            price: "1299",
          sku: "SUN-CLA-004",
            inventory_quantity: 40
          }],
          image: { src: "https://cdn.shopify.com/s/files/1/0000/0000/products/classic.jpg" },
          images: [{ src: "https://cdn.shopify.com/s/files/1/0000/0000/products/classic.jpg" }],
          inventory_levels: []
           },
           {
             id: 5,
          title: "Designer Eyeglasses",
          body_html: "Elegant designer eyeglasses for prescription glasses",
             vendor: "Voyage Eyewear",
          product_type: "Eyeglasses",
          variants: [{
            id: 105,
            price: "1499",
             sku: "EYE-DES-005",
            inventory_quantity: 35
          }],
          image: { src: "https://cdn.shopify.com/s/files/1/0000/0000/products/designer.jpg" },
          images: [{ src: "https://cdn.shopify.com/s/files/1/0000/0000/products/designer.jpg" }],
          inventory_levels: []
           },
           {
             id: 6,
          title: "Polarized Sunglasses",
          body_html: "Polarized sunglasses with anti-glare protection",
             vendor: "Voyage Eyewear",
          product_type: "Sunglasses",
          variants: [{
            id: 106,
            price: "2199",
             sku: "SUN-POL-006",
            inventory_quantity: 20
          }],
          image: { src: "https://cdn.shopify.com/s/files/1/0000/0000/products/polarized.jpg" },
          images: [{ src: "https://cdn.shopify.com/s/files/1/0000/0000/products/polarized.jpg" }],
          inventory_levels: []
        }
      ];
      
      setPosProducts(demoProducts);
      console.warn('⚠️ Using demo POS products - Shopify API connection failed');
      console.warn('💡 To fix: Set SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN in backend .env file');
    } finally {
      setPosLoading(false);
    }
  };

  const addToCart = (product) => {
    // Always add as a new cart item with unique cartItemId
    const cartItemId = `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCart([...cart, { 
        ...product, 
      cartItemId: cartItemId, // Unique identifier for this cart entry
        quantity: 1, 
        discountAmount: 0,
        discountPercentage: 0
      }]);
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(cart.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const updateDiscount = (cartItemId, discountType, discountValue) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        let discountAmount = 0;
        let discountPercentage = 0;
        
        if (discountType === 'percentage') {
          discountPercentage = Math.min(Math.max(discountValue, 0), 100); // Clamp between 0-100
          discountAmount = (item.price * item.quantity * discountPercentage) / 100;
        } else if (discountType === 'amount') {
          discountAmount = Math.min(Math.max(discountValue, 0), item.price * item.quantity); // Clamp between 0 and total price
          discountPercentage = (discountAmount / (item.price * item.quantity)) * 100;
        }
        
        return {
          ...item,
          discountAmount,
          discountPercentage
        };
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = item.discountAmount || 0;
      return total + (itemTotal - discountAmount);
    }, 0);
  };

  // Calculate total IGST (Integrated GST) based on product type
  // Sunglasses → 18% IGST
  // Frames/Eyeglasses → 5% IGST
  const getCartGST = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = item.discountAmount || 0;
      const discountedTotal = itemTotal - discountAmount;
      const igstRate = item.gstRate || 18; // Default to 18% IGST for Sunglasses
      const igstAmount = discountedTotal * igstRate / 100;
      return total + igstAmount;
    }, 0);
  };

  const getCartTotalWithGST = () => {
    return getCartSubtotal() + getCartGST();
  };

  const getCartDiscountTotal = () => {
    return cart.reduce((total, item) => total + (item.discountAmount || 0), 0);
  };


  const getGSTBreakdown = () => {
    const breakdown = {};
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = item.discountAmount || 0;
      const discountedTotal = itemTotal - discountAmount;
      
      // Determine IGST rate based on product type
      // Sunglasses → 18% IGST
      // Frames/Eyeglasses → 5% IGST
      const gstRate = item.gstRate || 18;
      const igstAmount = discountedTotal * gstRate / 100;

      if (!breakdown[gstRate]) {
        breakdown[gstRate] = {
          rate: gstRate,
          taxableAmount: 0,
          igst: 0, // IGST only (no CGST/SGST split)
          igstRate: gstRate,
          items: []
        };
      }

      breakdown[gstRate].taxableAmount += discountedTotal;
      breakdown[gstRate].igst += igstAmount;
      breakdown[gstRate].items.push({
        name: item.name,
        hsnCode: item.hsnCode || '90041000',
        productType: item.productType || 'sunglasses',
        quantity: item.quantity,
        rate: item.price,
        discountAmount: discountAmount,
        amount: discountedTotal,
        igstRate: gstRate,
        igstAmount: igstAmount
      });
    });

    return Object.values(breakdown);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPaymentMethod(null);
  };

  const toggleInvoiceExpansion = (invoiceId) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Get unique cities from sales data for filter (DEPRECATED - use Shopify locations)
  const getUniqueCities = () => {
    if (!salesData || !salesData.orders) return [];
    const cities = [...new Set(salesData.orders.map(order => order.location?.city || order.city))];
    return cities.filter(city => city && city !== 'Unknown City').sort();
  };

  // Filter invoices by selected Shopify location
  const getFilteredInvoices = () => {
    if (!salesData || !salesData.orders) return [];
    if (selectedCity === 'all') return salesData.orders;
    
    // Filter by Shopify location ID if selectedCity is a number (location ID)
    if (!isNaN(selectedCity)) {
      return salesData.orders.filter(order => {
        const orderLocationId = order.location?.shopifyLocationId || order.shopifyLocationId;
        return orderLocationId && orderLocationId.toString() === selectedCity.toString();
      });
    }
    
    // Fallback: Filter by city name (for backwards compatibility)
    return salesData.orders.filter(order => (order.location?.city || order.city) === selectedCity);
  };

  const downloadInvoice = async (order) => {
    try {
      toast.loading('Generating invoice PDF...', { id: 'download-invoice' });
      
      const token = Cookies.get('token') || 'demo-token';
      
      // 🔥 AGGRESSIVE FIX: Check localStorage for order with customer data FIRST!
      const localSalesData = JSON.parse(localStorage.getItem('pos_sales_data') || '{}');
      const localOrder = localSalesData.orders?.find(o => o.id === order.id);
      
      // Use local order if found (has full customer data), otherwise use passed order
      const orderToUse = localOrder || order;
      
      // 🔍 SUPER DEBUG: Show RAW order data BEFORE extraction
      console.log('═══════════════════════════════════════');
      console.log('🔬 RAW ORDER DATA BEFORE EXTRACTION:');
      console.log('═══════════════════════════════════════');
      console.log('📦 Full order object:', JSON.stringify(orderToUse, null, 2));
      console.log('---');
      console.log('🔑 Available fields:');
      console.log('  orderToUse.customerName:', orderToUse.customerName);
      console.log('  orderToUse.clientName:', orderToUse.clientName);
      console.log('  orderToUse.customerAddress:', orderToUse.customerAddress);
      console.log('  orderToUse.address:', orderToUse.address);
      console.log('  orderToUse.customerGstNumber:', orderToUse.customerGstNumber);
      console.log('  orderToUse.gstNumber:', orderToUse.gstNumber);
      console.log('═══════════════════════════════════════');
      
      // 🚀 SUPER AGGRESSIVE: Extract customer details with MULTIPLE fallback field names!
      // localStorage uses: clientName, address, gstNumber
      // Shopify uses: customerName, customerAddress, customerGstNumber
      const customerName = orderToUse.customerName || orderToUse.clientName || 'Customer';
      const customerAddress = orderToUse.customerAddress || orderToUse.address || '';
      const customerGstNumber = orderToUse.customerGstNumber || orderToUse.gstNumber || '';
      
      // 🚨 FINAL DEBUG: Show EVERYTHING about this order
      console.log('═══════════════════════════════════════');
      console.log('📥 INVOICE DOWNLOAD DEBUG - Order:', order.id);
      console.log('═══════════════════════════════════════');
      console.log('📦 Order source:', localOrder ? '✅ localStorage (HAS customer data)' : '❌ Shopify (NO customer data)');
      console.log('✅ EXTRACTED Customer Data:');
      console.log('  👤 Name:', customerName);
      console.log('  🏠 Address:', customerAddress || '(EMPTY - will show location city/state)');
      console.log('  📝 GST:', customerGstNumber || '(EMPTY - will show N/A)');
      console.log('═══════════════════════════════════════');
      
      // 🚨 ALERT user if this is an old Shopify order without customer data
      if (!localOrder && (customerName === 'Customer' || !customerAddress)) {
        toast.error('⚠️ This order has no customer details. Create a new order to test!', { id: 'download-invoice', duration: 5000 });
      }
      
      // Prepare order data for PDF generation
      const orderData = {
        invoiceNumber: orderToUse.id,
        timestamp: orderToUse.createdAt || orderToUse.date || new Date().toISOString(),
        customerName: customerName,
        customerAddress: customerAddress,
        customerGstNumber: customerGstNumber,
        location: orderToUse.location || {
          city: orderToUse.city || 'Mumbai',
          state: orderToUse.state || 'Maharashtra',
          gstNumber: '08AGFPK7804C1ZQ'
        },
        items: (orderToUse.items || []).map(item => ({
          title: item.title || item.name || 'Product',
          name: item.title || item.name || 'Product',
          hsnCode: item.hsnCode || '90041000',
          quantity: item.quantity || 1,
          price: item.price || 0,
          gstRate: item.gstRate || 18,
          discountAmount: item.discountAmount || 0
        }))
      };
      
      const response = await axios.post(
        `${API_URL}/api/invoices/${order.id}`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob' // Important for downloading files
        }
      );
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!', { id: 'download-invoice' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice: ' + (error.response?.data?.message || error.message), { id: 'download-invoice' });
    }
  };

  const previewInvoice = async (order) => {
    try {
      toast.loading('Generating invoice preview...', { id: 'preview-invoice' });
      
      const token = Cookies.get('token') || 'demo-token';
      
      // Check localStorage for order with customer data FIRST!
      const localSalesData = JSON.parse(localStorage.getItem('pos_sales_data') || '{}');
      const localOrder = localSalesData.orders?.find(o => o.id === order.id);
      
      // Use local order if found (has full customer data), otherwise use passed order
      const orderToUse = localOrder || order;
      
      // Extract customer details with fallback field names
      const customerName = orderToUse.customerName || orderToUse.clientName || 'Customer';
      const customerAddress = orderToUse.customerAddress || orderToUse.address || '';
      const customerGstNumber = orderToUse.customerGstNumber || orderToUse.gstNumber || '';
      
      console.log('📄 Generating invoice:', order.id, '| Customer:', customerName, '| Address:', customerAddress || '(none)');
      alert(`PREVIEW INVOICE DATA:\nFrom localStorage? ${!!localOrder}\nCustomer: ${customerName}\nAddress: "${customerAddress}"\nGST: ${customerGstNumber}`);
      
      // Prepare order data for PDF generation
      const orderData = {
        invoiceNumber: orderToUse.id,
        timestamp: orderToUse.createdAt || orderToUse.date || new Date().toISOString(),
        customerName: customerName,
        customerAddress: customerAddress,
        customerGstNumber: customerGstNumber,
        location: orderToUse.location || {
          city: orderToUse.city || 'Mumbai',
          state: orderToUse.state || 'Maharashtra',
          gstNumber: '08AGFPK7804C1ZQ'
        },
        items: (orderToUse.items || []).map(item => ({
          title: item.title || item.name || 'Product',
          name: item.title || item.name || 'Product',
          hsnCode: item.hsnCode || '90041000',
          quantity: item.quantity || 1,
          price: item.price || 0,
          gstRate: item.gstRate || 18,
          discountAmount: item.discountAmount || 0
        }))
      };
      
      const response = await axios.post(
        `${API_URL}/api/invoices/${order.id}?format=html`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob' // Get as blob for PDF
        }
      );
      
      // Create blob URL and open in new window for preview
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Opening invoice preview...', { id: 'preview-invoice' });
    } catch (error) {
      console.error('Error previewing invoice:', error);
      toast.error('Failed to preview invoice: ' + (error.response?.data?.message || error.message), { id: 'preview-invoice' });
    }
  };

  const sendInvoiceWhatsApp = async (order) => {
    try {
      // Prompt for phone number
      const phoneInput = prompt(
        'Enter customer WhatsApp number (with country code):\nExample: +918076616747',
        order.customerPhone || '+91'
      );
      
      if (!phoneInput) {
        return; // User cancelled
      }

      // Validate phone number format
      const phone = phoneInput.trim();
      if (!phone.startsWith('+')) {
        toast.error('Phone number must start with + and country code (e.g., +91)');
        return;
      }

      if (phone.length < 12) {
        toast.error('Please enter a valid phone number with country code');
        return;
      }

      toast.loading('Sending invoice via WhatsApp...', { id: 'whatsapp-send' });

        // Prepare order data for WhatsApp
        const whatsappData = {
          invoiceNumber: order.id,
          customerName: order.customerName || 'Customer',
          customerPhone: phone,
          items: (order.items || []).map(item => ({
            title: item.title || item.name || 'Product',
            name: item.title || item.name || 'Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            sku: item.sku || 'N/A',
            productType: item.productType || 'Product',
            hsnCode: item.hsnCode || '90041000',
            gstRate: item.gstRate || 18,
            discountAmount: item.discountAmount || 0,
            discountPercentage: item.discountPercentage || 0
          })),
          subtotal: order.subtotal || order.total,
          tax: order.tax || 0,
          total: order.total,
          paymentMethod: order.paymentMethod || 'Cash',
          location: order.location || { name: 'Store', city: order.city, state: order.state },
          timestamp: order.createdAt || order.date || new Date().toISOString(),
          gstBreakdown: order.gstBreakdown || []
        };

      // Send to backend
      const token = Cookies.get('token') || 'demo-token';
      const response = await axios.post(
        `${API_URL}/api/whatsapp/send-invoice`,
        whatsappData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('✅ Invoice sent successfully via WhatsApp!', { id: 'whatsapp-send' });
        console.log('WhatsApp sent:', response.data);
      } else {
        toast.error(`Failed: ${response.data.message || 'Unknown error'}`, { id: 'whatsapp-send' });
        console.error('WhatsApp send failed:', response.data);
      }

    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error(`Failed to send WhatsApp: ${error.response?.data?.message || error.message}`, { id: 'whatsapp-send' });
    }
  };

  const generateInvoiceHTML = (order) => {
    const gstBreakdown = order.gstBreakdown || [];
    const taxableAmount = order.subtotal || order.total;
    const totalTaxAmount = order.tax || 0;

        // Process individual items (don't group by HSN)
        const processedItems = (order.items || []).map(item => {
          // Determine product type and HSN code based on item properties
          const productType = item.productType || 'sunglasses';
          const hsnCode = item.hsnCode || (productType === 'eyeglasses' ? '90031900' : '90041000');
          const gstRate = item.gstRate || (productType === 'eyeglasses' ? 5 : 18);

          // Debug logging
          console.log(`Invoice Item: ${item.title || item.name}, productType: ${productType}, hsnCode: ${hsnCode}, gstRate: ${gstRate}%`);

          // Use actual product name instead of generic description
          const description = item.title || item.name || item.productName || (productType === 'sunglasses' ? 'Sunglasses' : 'Eyeglasses');
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const originalAmount = price * quantity;
          const discountAmount = item.discountAmount || 0;
          const discountPercentage = item.discountPercentage || 0;
          const amountBeforeGST = originalAmount - discountAmount;
          const gstAmount = (amountBeforeGST * gstRate) / 100;
          const totalAmount = amountBeforeGST + gstAmount;

          return {
            hsnCode,
            description,
            quantity,
            price,
            originalAmount,
            discountAmount,
            discountPercentage,
            amountBeforeGST,
            gstRate,
            gstAmount,
            totalAmount
          };
        });

    const totalQuantity = processedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalBeforeDiscount = processedItems.reduce((sum, item) => sum + item.originalAmount, 0);
    const totalDiscount = processedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const subtotalAfterDiscount = processedItems.reduce((sum, item) => sum + item.amountBeforeGST, 0);
    const totalGST = processedItems.reduce((sum, item) => sum + item.gstAmount, 0);
    const grandTotal = processedItems.reduce((sum, item) => sum + item.totalAmount, 0);
    
    return `
        <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${order.id}</title>
          <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    line-height: 1.3;
                    color: #000;
                    background: white;
                    padding: 10px;
                }

                .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 2px solid #000;
                }

                .header-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-bottom: 2px solid #000;
                }

                .company-section {
                    border-right: 2px solid #000;
                    padding: 10px;
                }

                .company-logo {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .company-details {
                    font-size: 9px;
                    line-height: 1.4;
                }

                .invoice-info-section {
                    padding: 10px;
                }

                .invoice-grid {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 2px 10px;
                    font-size: 9px;
                }

                .invoice-grid strong {
                    font-weight: 600;
                }

                .buyer-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-bottom: 2px solid #000;
                }

                .buyer-left, .buyer-right {
                    padding: 10px;
                    font-size: 9px;
                }

                .buyer-left {
                    border-right: 2px solid #000;
                }

                .section-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-decoration: underline;
                }

                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .items-table th {
                    border: 1px solid #000;
                    border-left: none;
                    border-right: none;
                    padding: 5px;
                    font-size: 9px;
                    font-weight: 600;
                    text-align: center;
                    background-color: #f5f5f5;
                }

                .items-table td {
                    border: 1px solid #000;
                    border-left: none;
                    border-right: none;
                    padding: 5px;
                    font-size: 9px;
                }

                .items-table td:first-child,
                .items-table th:first-child {
                    border-left: none;
                }

                .items-table td:last-child,
                .items-table th:last-child {
                    border-right: none;
                }

                .text-center {
                    text-align: center;
                }

                .text-right {
                    text-align: right;
                }

                .text-left {
                    text-align: left;
                }

                .discount-row {
                    font-style: italic;
                    background-color: #f9f9f9;
                }

                .total-row {
                    font-weight: bold;
                    background-color: #f5f5f5;
                }

                .tax-summary-section {
                    border-top: 2px solid #000;
                    padding: 10px;
                }

                .tax-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                .tax-table th, .tax-table td {
                    border: 1px solid #000;
                    padding: 5px;
                    font-size: 9px;
                    text-align: center;
                }

                .tax-table th {
                    background-color: #f5f5f5;
                    font-weight: 600;
                }

                .amount-words {
                    margin-top: 10px;
                    padding: 10px;
                    border-top: 2px solid #000;
                    font-size: 9px;
                    font-weight: bold;
                }

                .bank-details {
                    padding: 10px;
                    border-top: 2px solid #000;
                    font-size: 9px;
                }

                .declaration {
                    padding: 10px;
                    border-top: 2px solid #000;
                    font-size: 9px;
                }

                .footer {
                    padding: 10px;
                    border-top: 2px solid #000;
                    text-align: right;
                }

                .signature-section {
                    text-align: right;
                    margin-top: 30px;
                }

                .computer-generated {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 9px;
                    font-style: italic;
                }
          </style>
        </head>
        <body>
        <div class="invoice-container">
            <!-- Header Section -->
            <div class="header-section">
                <div class="company-section">
                    <div class="company-logo">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ctext x='5' y='30' font-size='30' fill='%23000'%3EV%3C/text%3E%3C/svg%3E" alt="Logo" style="width: 30px; height: 30px; vertical-align: middle;" />
                        ${companySettings.name}
                    </div>
                    <div class="company-details">
                        ${companySettings.address}<br/>
                        GSTIN/UIN: ${companySettings.gstin}<br/>
                        E-Mail: ${companySettings.email || 'info@voyageeyewear.com'}
                    </div>
                </div>
                <div class="invoice-info-section">
                    <div class="invoice-grid">
                        <strong>Invoice No.:</strong><span>${order.id}</span>
                        <strong>e-Way Bill No.:</strong><span>TT1866418</span>
                        <strong>Dated:</strong><span>${new Date(order.timestamp).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                        <strong>Delivery Note:</strong><span>Mode/Terms of Payment</span>
                        <strong>Reference No. & Date:</strong><span>Other References</span>
                        <strong>Buyer's Order No.:</strong><span></span>
                        <strong>Dated:</strong><span></span>
                        <strong>Dispatch Doc No.:</strong><span>Delivery Note Date</span>
                        <strong>Dispatched through:</strong><span>Destination</span>
                        <strong>Terms of Delivery:</strong><span></span>
                    </div>
                </div>
          </div>
          
            <!-- Buyer Information -->
            <div class="buyer-section">
                <div class="buyer-left">
                    <div class="section-title">Consignee (Ship to)</div>
                    <strong>${order.clientName}</strong><br/>
                    ${order.customerAddress || order.location?.city || order.city || 'Unknown City'}<br/>
                    ${order.location?.city || order.city || ''}, ${order.location?.state || order.state || ''}<br/>
                    GSTIN/UIN: ${companySettings.gstin}<br/>
                    State Name: ${order.location?.state || order.state || companySettings.stateName}, Code: ${companySettings.stateCode}
            </div>
                <div class="buyer-right">
                    <div class="section-title">Buyer (Bill to)</div>
                    <strong>${order.clientName}</strong><br/>
                    ${order.customerAddress || order.location?.city || order.city || 'Unknown City'}<br/>
                    ${order.location?.city || order.city || ''}, ${order.location?.state || order.state || ''}<br/>
                    Buyer's Order No.:<br/>
                    Dated:
            </div>
          </div>
          
            <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                        <th style="width: 30px;">SI No.</th>
                        <th style="width: 250px;">Description of Goods</th>
                        <th style="width: 80px;">HSN/SAC</th>
                        <th style="width: 70px;">Quantity</th>
                        <th style="width: 70px;">Rate</th>
                        <th style="width: 40px;">per</th>
                        <th style="width: 90px;">Amount</th>
              </tr>
            </thead>
            <tbody>
                    ${processedItems.map((item, index) => `
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td class="text-left">${item.description}</td>
                            <td class="text-center">${item.hsnCode}</td>
                            <td class="text-center"><strong>${item.quantity} pcs</strong></td>
                            <td class="text-right">${(item.price || 0).toFixed(2)}</td>
                            <td class="text-center">pcs</td>
                            <td class="text-right"><strong>${(item.originalAmount || 0).toFixed(2)}</strong></td>
                </tr>
              `).join('')}
                    ${totalDiscount > 0 ? `
                        <tr class="discount-row">
                            <td></td>
                            <td class="text-left"><em>Less:</em></td>
                            <td colspan="4" class="text-right"><em>DISCOUNT ALLOWED<br/>GST 18%<br/>IGST 5%</em></td>
                            <td class="text-right"><strong>(-)${totalDiscount.toFixed(2)}<br/>${(subtotalAfterDiscount * 0.18).toFixed(2)}<br/>${(subtotalAfterDiscount * 0.05).toFixed(2)}</strong></td>
                        </tr>
                        <tr class="discount-row">
                            <td></td>
                            <td class="text-left"><em>Less:</em></td>
                            <td colspan="4" class="text-right"><em>Rounded OFF</em></td>
                            <td class="text-right"><strong>(-)${((grandTotal) - Math.round(grandTotal)).toFixed(2)}</strong></td>
                        </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td></td>
                        <td class="text-left"><strong>Total</strong></td>
                        <td></td>
                        <td class="text-center"><strong>${totalQuantity} pcs</strong></td>
                        <td colspan="2"></td>
                        <td class="text-right"><strong>₹ ${Math.round(grandTotal).toFixed(2)}</strong></td>
                    </tr>
            </tbody>
          </table>

            <!-- Amount in Words -->
            <div class="amount-words">
                <strong>Amount Chargeable (in words):</strong> INR ${numberToWords(Math.round(grandTotal))} Only
            </div>

            <!-- Tax Summary -->
            <div class="tax-summary-section">
                <table class="tax-table">
                    <thead>
                        <tr>
                            <th rowspan="2">HSN/SAC</th>
                            <th rowspan="2">Taxable Value</th>
                            <th colspan="2">IGST</th>
                            <th rowspan="2">Total Tax Amount</th>
                        </tr>
                        <tr>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${processedItems.map(item => `
                            <tr>
                                <td>${item.hsnCode}</td>
                                <td class="text-right">${(item.amountBeforeGST || 0).toFixed(2)}</td>
                                <td class="text-center">${item.gstRate || 0}%</td>
                                <td class="text-right">${(item.gstAmount || 0).toFixed(2)}</td>
                                <td class="text-right">${(item.gstAmount || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td><strong>Total</strong></td>
                            <td class="text-right"><strong>${subtotalAfterDiscount.toFixed(2)}</strong></td>
                            <td></td>
                            <td class="text-right"><strong>${totalGST.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>${totalGST.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 10px; font-size: 9px;">
                    <strong>Tax Amount (in words):</strong> INR ${numberToWords(totalGST)} Only
                </div>
            </div>

            <!-- Bank Details -->
            <div class="bank-details">
                <strong>Company's Bank Details</strong><br/>
                <strong>Bank Name:</strong> ${companySettings.bankName || 'Kotak Mahindra Bank'}<br/>
                <strong>A/c No.:</strong> ${companySettings.accountNumber || '2512756589'}<br/>
                <strong>Branch & IFS Code:</strong> ${companySettings.ifscCode || 'KKBK0004485'}
            </div>

            <!-- Declaration -->
            <div class="declaration">
                <strong>Declaration:</strong><br/>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                <div class="signature-section">
                    <strong>for ${companySettings.name}</strong><br/>
                    <div style="margin-top: 40px;">
                        Authorised Signatory
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="computer-generated">
                This is a Computer Generated Invoice
            </div>
        </div>
        </body>
        </html>
      `;
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertHundreds = (n) => {
      let result = '';
      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n > 9) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };
    
    const convertThousands = (n) => {
      let result = '';
      if (n > 99999) {
        result += convertHundreds(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n > 999) {
        result += convertHundreds(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n > 0) {
        result += convertHundreds(n);
      }
      return result.trim();
    };
    
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);
    
    let result = convertThousands(integerPart);
    
    if (decimalPart > 0) {
      result += ' and ' + convertHundreds(decimalPart) + 'Paise';
    }
    
    return result;
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

    // Show customer form first
    setShowCustomerForm(true);
  };

  const handleCustomerFormSubmit = (e) => {
    if (e) e.preventDefault();
    
    // 🔥 DEBUG: Show full customerInfo state
    console.log('🔥 FULL CUSTOMER INFO AT SUBMIT:', JSON.stringify(customerInfo, null, 2));
    alert(`DEBUG CHECK:\nName: ${customerInfo.name}\nPhone: ${customerInfo.phone}\nAddress: "${customerInfo.address}"\nGST: ${customerInfo.gstNumber}`);
    
    if (!customerInfo.name || !customerInfo.name.trim()) {
      alert('Please enter customer name!');
      return;
    }

    if (!customerInfo.phone || !customerInfo.phone.trim()) {
      alert('Please enter customer phone number!');
      return;
    }

    // ✅ PASS customerInfo state directly
    processSale(customerInfo);
  };

  const processSale = (custInfo) => {
    // ✅ Use the passed customerInfo directly (avoid state timing issues)
    const customerData = custInfo || customerInfo;
    
    // Use customer information from form
    const clientInfo = {
      name: customerData.name || '',
      email: customerData.email || user.email,
      phone: customerData.phone || '',
      address: customerData.address || '',
      gstNumber: customerData.gstNumber || '',
      role: user.role.name
    };
    
    console.log('🔥 CLIENT INFO CREATED:', JSON.stringify(clientInfo, null, 2));
    alert(`CLIENT INFO:\nName: ${clientInfo.name}\nAddress: "${clientInfo.address}"\nGST: ${clientInfo.gstNumber}`);

    // Get location info from SELECTED SHOPIFY LOCATION
    let locationInfo;
    let kioskInfo;
    
    // Use the Shopify location that the user selected on POS page
    if (selectedLocationId && shopifyLocations && shopifyLocations.length > 0) {
      const selectedShopifyLocation = shopifyLocations.find(loc => loc.id.toString() === selectedLocationId.toString());
      
      if (selectedShopifyLocation) {
        console.log(`📍 Using selected Shopify location for invoice: ${selectedShopifyLocation.name} (${selectedShopifyLocation.city})`);
        
        // Extract GST number from tax_registration field (if available)
        let gstNumber = 'N/A';
        if (selectedShopifyLocation.tax_registration) {
          // Tax registration can be an array or object containing GST/tax IDs
          if (Array.isArray(selectedShopifyLocation.tax_registration)) {
            // Find GST registration (typically has tax_id or registration_number)
            const gstReg = selectedShopifyLocation.tax_registration.find(reg => 
              reg.country_iso === 'IN' || reg.tax_id || reg.registration_number
            );
            if (gstReg) {
              gstNumber = gstReg.tax_id || gstReg.registration_number || gstReg.number || 'N/A';
            }
          } else if (typeof selectedShopifyLocation.tax_registration === 'object') {
            gstNumber = selectedShopifyLocation.tax_registration.tax_id || 
                       selectedShopifyLocation.tax_registration.registration_number || 
                       selectedShopifyLocation.tax_registration.number || 'N/A';
          } else if (typeof selectedShopifyLocation.tax_registration === 'string') {
            gstNumber = selectedShopifyLocation.tax_registration;
          }
        }
        
        // Also check for GST in other possible fields
        if (gstNumber === 'N/A' && selectedShopifyLocation.gst_number) {
          gstNumber = selectedShopifyLocation.gst_number;
        }
        
        console.log(`💳 GST Number for ${selectedShopifyLocation.name}: ${gstNumber}`);
        
        locationInfo = {
          id: selectedShopifyLocation.id,
          shopifyLocationId: selectedShopifyLocation.id,
          name: selectedShopifyLocation.name,
          state: selectedShopifyLocation.province || selectedShopifyLocation.city,
          city: selectedShopifyLocation.city || selectedShopifyLocation.name,
          address: selectedShopifyLocation.address1 || 'N/A',
          country: selectedShopifyLocation.country_code || 'IN',
          gstNumber: gstNumber,
          phone: selectedShopifyLocation.phone || '',
          email: ''
        };
        
        // Generate kiosk/terminal info
        kioskInfo = {
          id: `KIOSK-${selectedShopifyLocation.id}-001`,
          name: `${selectedShopifyLocation.name} - Terminal 1`,
          locationId: selectedShopifyLocation.id,
          terminalNumber: '001'
        };
      } else {
        // Fallback if selected location not found
        console.warn('⚠️  Selected location not found in Shopify locations, using first available');
        const firstLocation = shopifyLocations[0];
        
        // Extract GST number from first location
        let gstNumber = 'N/A';
        if (firstLocation.tax_registration) {
          if (Array.isArray(firstLocation.tax_registration)) {
            const gstReg = firstLocation.tax_registration.find(reg => 
              reg.country_iso === 'IN' || reg.tax_id || reg.registration_number
            );
            if (gstReg) {
              gstNumber = gstReg.tax_id || gstReg.registration_number || gstReg.number || 'N/A';
            }
          } else if (typeof firstLocation.tax_registration === 'object') {
            gstNumber = firstLocation.tax_registration.tax_id || 
                       firstLocation.tax_registration.registration_number || 
                       firstLocation.tax_registration.number || 'N/A';
          } else if (typeof firstLocation.tax_registration === 'string') {
            gstNumber = firstLocation.tax_registration;
          }
        }
        if (gstNumber === 'N/A' && firstLocation.gst_number) {
          gstNumber = firstLocation.gst_number;
        }
        
        locationInfo = {
          id: firstLocation.id,
          shopifyLocationId: firstLocation.id,
          name: firstLocation.name,
          state: firstLocation.province || firstLocation.city,
          city: firstLocation.city || firstLocation.name,
          address: firstLocation.address1 || 'N/A',
          country: firstLocation.country_code || 'IN',
          gstNumber: gstNumber,
          phone: firstLocation.phone || '',
          email: ''
        };
        
        kioskInfo = {
          id: `KIOSK-${firstLocation.id}-001`,
          name: `${firstLocation.name} - Terminal 1`,
          locationId: firstLocation.id,
          terminalNumber: '001'
        };
      }
    } else {
      // Final fallback if no Shopify locations available
      console.warn('⚠️  No Shopify locations available, using fallback location');
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Maharashtra', 'Gujarat'];
    const randomIndex = Math.floor(Math.random() * cities.length);
    
      locationInfo = {
        id: null,
        shopifyLocationId: null,
        name: `${cities[randomIndex]} Store`,
      state: states[randomIndex],
      city: cities[randomIndex],
        address: `123 Business District, ${cities[randomIndex]}`,
        gstNumber: 'N/A',
        phone: '',
        email: ''
      };
      
      kioskInfo = {
        id: 'KIOSK-DEFAULT-001',
        name: 'Default Terminal',
        locationId: null,
        terminalNumber: '001'
      };
    }

    // Generate location-based invoice number using Shopify location city
    const generateLocationInvoiceNumber = (city, locationId) => {
      // Get city prefix (first 4 letters, uppercase)
      const cityPrefix = city.substring(0, 4).toUpperCase();
      const companySuffix = 'VOYA'; // Voyage Eyewear
      
      // Get or create sequence counter for this specific Shopify location
      const locationKey = `invoice_seq_shopify_${locationId}`;
      let sequenceNumber = parseInt(localStorage.getItem(locationKey) || '0');
      sequenceNumber += 1;
      
      // Save updated sequence
      localStorage.setItem(locationKey, sequenceNumber.toString());
      
      // Format as: CITY + VOYA + 4-digit sequence (e.g., DELHVOYA0001)
      const invoiceNumber = `${cityPrefix}${companySuffix}${sequenceNumber.toString().padStart(4, '0')}`;
      
      console.log(`✅ Generated invoice number: ${invoiceNumber} for location: ${city} (ID: ${locationId})`);
      
      return invoiceNumber;
    };

    const invoiceNumber = generateLocationInvoiceNumber(locationInfo.city, locationInfo.id);
    const orderId = invoiceNumber;
    const currentTime = new Date();

    const newOrder = {
      id: orderId,
      clientName: clientInfo.name,
      customerName: clientInfo.name, // ← ADD THIS for invoice generation
      shopifyLocationId: locationInfo.shopifyLocationId, // Store Shopify location ID for filtering
          location: {
        id: locationInfo.id,
        shopifyLocationId: locationInfo.shopifyLocationId,
        name: locationInfo.name,
      city: locationInfo.city,
        state: locationInfo.state,
        address: locationInfo.address,
        gstNumber: locationInfo.gstNumber,
        phone: locationInfo.phone,
        email: locationInfo.email
      },
      kiosk: {
        id: kioskInfo.id,
        name: kioskInfo.name,
        locationId: kioskInfo.locationId,
        terminalNumber: kioskInfo.terminalNumber
          },
      paymentMethod: selectedPaymentMethod,
      timestamp: currentTime.toISOString(),
      transactionDate: currentTime.toLocaleDateString('en-IN'),
      transactionTime: currentTime.toLocaleTimeString('en-IN'),
      items: cart.map(item => ({
        title: item.name,
        quantity: item.quantity,
        price: item.price,
            sku: item.sku || 'N/A',
            productType: item.productType,
            hsnCode: item.hsnCode,
            gstRate: item.gstRate,
            discountAmount: item.discountAmount || 0,
            discountPercentage: item.discountPercentage || 0
          })),
          subtotal: getCartSubtotal(),
          tax: getCartGST(),
          total: getCartTotalWithGST(),
          gstBreakdown: getGSTBreakdown(),
          customerEmail: clientInfo.email || user.email,
          customerPhone: clientInfo.phone,
          customerAddress: clientInfo.address,
          customerGstNumber: clientInfo.gstNumber || '',
      status: 'completed',
      invoiceNumber: invoiceNumber,
      notes: `Order created via POS at ${locationInfo.name} (${kioskInfo.name}) by ${clientInfo.role}`,
          createdBy: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role.name || user.role
          },
      createdAt: currentTime.toISOString(),
      accessControl: {
        locationId: locationInfo.id,
        allowedRoles: ['super_admin', 'admin', 'client'],
        locationSpecific: true
      }
    };

    // Log order creation
    console.log('✅ Order created:', newOrder.id, '| Customer:', newOrder.customerName, '| Address:', newOrder.customerAddress || '(empty)');
    alert(`ORDER CREATED IN LOCALSTORAGE:\nID: ${newOrder.id}\nCustomer: ${newOrder.customerName}\nAddress: "${newOrder.customerAddress}"\nGST: ${newOrder.customerGstNumber}`);

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

    // Send order to Shopify
    const sendToShopify = async () => {
      try {
        const shopifyOrderData = {
          customerName: clientInfo.name,
          customerEmail: clientInfo.email,
          customerPhone: clientInfo.phone,
          customerAddress: clientInfo.address,
          customerGstNumber: clientInfo.gstNumber || '',
          invoiceNumber: invoiceNumber,
          paymentMethod: selectedPaymentMethod,
          location: locationInfo,
          items: cart.map(item => ({
            title: item.name,
            price: item.price,
            quantity: item.quantity,
            sku: item.sku || '',
            productType: item.productType || 'Eyewear',
            hsnCode: item.hsnCode,
            gstRate: item.gstRate,
            discountAmount: item.discountAmount || 0,
            discountPercentage: item.discountPercentage || 0
          })),
          subtotal: getCartSubtotal(),
          tax: getCartGST(),
          total: getCartTotalWithGST(),
          notes: `Order created via POS by ${clientInfo.role}`,
          createdBy: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role.name || user.role
          },
          billingAddress: {
            address1: clientInfo.address || '',
            city: locationInfo.city,
            province: locationInfo.state,
            country: 'IN',
            zip: ''
          }
        };

        const response = await axios.post(
          `${API_URL}/api/shopify/orders`,
          shopifyOrderData,
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token') || 'demo-token'}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          console.log('✅ Order created in Shopify:', response.data.data);
          toast.success(`Order synced to Shopify! Order #${response.data.data.shopifyOrderNumber}`);
        }
      } catch (error) {
        console.error('⚠️ Shopify sync skipped:', error.message);
        // Don't show error to user - order is saved locally and sale is completed
      }
    };

    // Send to Shopify asynchronously (don't wait for response)
    sendToShopify();

    // Send invoice via WhatsApp asynchronously
    const sendWhatsAppInvoice = async () => {
      try {
        const token = Cookies.get('token') || 'demo-token';
        const apiUrl = API_URL;
        
        console.log('📱 Sending invoice via WhatsApp to:', clientInfo.phone);
        
        const whatsappData = {
          invoiceNumber: invoiceNumber,
          customerName: clientInfo.name,
          customerPhone: clientInfo.phone,
          customerEmail: clientInfo.email,
          customerAddress: clientInfo.address,
          customerGstNumber: clientInfo.gstNumber || '',
          items: cart.map(item => ({
            title: item.name || item.title,
            name: item.name || item.title,
            quantity: item.quantity,
            price: item.price,
            sku: item.sku || 'N/A',
            productType: item.productType,
            hsnCode: item.hsnCode,
            gstRate: item.gstRate,
            discountAmount: item.discountAmount || 0,
            discountPercentage: item.discountPercentage || 0
          })),
          subtotal: getCartSubtotal(),
          tax: getCartGST(),
          total: getCartTotalWithGST(),
          gstBreakdown: getGSTBreakdown(),
          paymentMethod: selectedPaymentMethod,
          location: locationInfo,
          timestamp: new Date().toISOString()
        };

        const response = await axios.post(`${apiUrl}/api/whatsapp/send-invoice`, whatsappData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          console.log('✅ WhatsApp invoice sent successfully!', response.data.messageId);
          toast.success('Invoice sent via WhatsApp!');
        } else {
          console.log('⚠️ WhatsApp invoice not sent:', response.data.message);
          // Don't show error to user - sale is already completed
        }
      } catch (error) {
        console.error('❌ Error sending WhatsApp invoice:', error.message);
        // Don't show error to user, just log it - sale is already completed
        console.log('WhatsApp delivery failed, but sale was successful');
      }
    };

    // Send WhatsApp invoice asynchronously (don't wait for response)
    sendWhatsAppInvoice();

    // Show success message
    toast.success(`Sale completed successfully! Invoice: ${invoiceNumber}`);
    alert(`Sale completed successfully!\nInvoice: ${invoiceNumber}\nLocation: ${locationInfo.city}\nSubtotal: ₹${getCartSubtotal().toLocaleString()}\nGST: ₹${getCartGST().toLocaleString()}\nTotal: ₹${getCartTotalWithGST().toLocaleString()}\nPayment: ${selectedPaymentMethod}\nCustomer: ${customerInfo.name}`);

    // Clear cart and reset payment method
    clearCart();
    
    // Close customer form and reset customer info
    setShowCustomerForm(false);
    setCustomerInfo({ name: '', address: '', phone: '', email: '', gstNumber: '' });
  };

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const result = handleLogin(loginEmail, loginPassword);
    
    if (!result.success) {
      setLoginError(result.message);
      toast.error(result.message);
    } else {
      toast.success('Login successful!');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="login-container">
          <div style={{ 
            maxWidth: '400px', 
            margin: '0 auto', 
            background: 'white', 
            padding: '2.5rem', 
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#1e293b' }}>
              🏪 POS System
            </h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
              Sign in to your account
            </p>
            
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
          </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              
              {loginError && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.5rem',
                  color: '#dc2626',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ {loginError}
            </div>
              )}
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Sign In
              </button>
            </form>
            
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: '#64748b'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#475569' }}>Demo Credentials:</p>
              <p style={{ margin: '0.25rem 0' }}>👑 Admin: admin@possystem.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label="Toggle Menu"
      >
        {isMobileSidebarOpen ? (
          <FiX size={24} />
        ) : (
          <FiMenu size={24} />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
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
              <button onClick={() => handleNavigation('locations')} className={`nav-item ${currentPage === 'locations' ? 'active' : ''}`}>Invoice</button>
              <button onClick={() => handleNavigation('location-analytics')} className={`nav-item ${currentPage === 'location-analytics' ? 'active' : ''}`}>Location Analytics</button>
              <button onClick={() => handleNavigation('assign-locations')} className={`nav-item ${currentPage === 'assign-locations' ? 'active' : ''}`}>Assign Locations</button>
              <button onClick={() => handleNavigation('shopify-orders')} className={`nav-item ${currentPage === 'shopify-orders' ? 'active' : ''}`}>Shopify Orders</button>
              <button onClick={() => handleNavigation('shopify-customers')} className={`nav-item ${currentPage === 'shopify-customers' ? 'active' : ''}`}>Shopify Customers</button>
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
        {currentPage === 'dashboard' && (() => {
          // Show loading state while fetching Shopify orders
          if (ordersLoading) {
            return (
              <div className="analytics-dashboard">
                <div className="loading-container" style={{ padding: '4rem', textAlign: 'center' }}>
                  <div className="loading-spinner"></div>
                  <p>Loading Shopify data for analytics...</p>
                </div>
              </div>
            );
          }

          const analytics = getEnhancedAnalytics();
          const now = new Date();
          const currentDateStr = dashboardDateFilter === 'today' ? now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                 dashboardDateFilter === 'yesterday' ? new Date(now.setDate(now.getDate() - 1)).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                 dashboardCustomDate ? new Date(dashboardCustomDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          const prevDate = new Date(now);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <>
              <div className="analytics-dashboard">
                {/* Date Filter Header */}
                <div className="analytics-header">
                  <div className="date-filters">
                    <button 
                      className={`date-filter-btn ${dashboardDateFilter === 'today' ? 'active' : ''}`}
                      onClick={() => setDashboardDateFilter('today')}
                    >
                      📅 Today
                    </button>
                    <button 
                      className={`date-filter-btn ${dashboardDateFilter === 'yesterday' ? 'active' : ''}`}
                      onClick={() => setDashboardDateFilter('yesterday')}
                    >
                      📆 Yesterday
                    </button>
                    <input
                      type="date"
                      className="date-filter-input"
                      value={dashboardCustomDate}
                      onChange={(e) => {
                        setDashboardCustomDate(e.target.value);
                        setDashboardDateFilter('custom');
                      }}
                    />
                    <button 
                      className="date-filter-btn"
                      onClick={() => loadShopifyOrders('any')}
                      style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}
                    >
                      🔄 Refresh Data
                    </button>
                  </div>
                  <div className="live-indicator">
                    <span className="live-dot"></span>
                    <span>0 live visitors • {shopifyOrders.length} Shopify orders</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="analytics-metrics-grid">
                  <div className="analytics-metric-card">
                    <div className="metric-header">
                      <h3>Sessions</h3>
                </div>
                    <div className="metric-value">{analytics.current.sessions}</div>
                    <div className={`metric-comparison ${analytics.comparison.sessions >= 0 ? 'positive' : 'negative'}`}>
                      {analytics.comparison.sessions >= 0 ? '↗' : '↘'} {Math.abs(analytics.comparison.sessions).toFixed(0)}%
                </div>
                  </div>

                  <div className="analytics-metric-card">
                    <div className="metric-header">
                      <h3>Total Sales</h3>
                    </div>
                    <div className="metric-value">₹{analytics.current.sales.toLocaleString()}</div>
                    <div className={`metric-comparison ${analytics.comparison.sales >= 0 ? 'positive' : 'negative'}`}>
                      {analytics.comparison.sales >= 0 ? '↗' : '↘'} {Math.abs(analytics.comparison.sales).toFixed(0)}%
                </div>
              </div>

                  <div className="analytics-metric-card">
                    <div className="metric-header">
                      <h3>Orders</h3>
                </div>
                    <div className="metric-value">{analytics.current.orders}</div>
                    <div className={`metric-comparison ${analytics.comparison.orders >= 0 ? 'positive' : 'negative'}`}>
                      {analytics.comparison.orders >= 0 ? '↗' : '↘'} {Math.abs(analytics.comparison.orders).toFixed(0)}%
              </div>
            </div>

                  <div className="analytics-metric-card">
                    <div className="metric-header">
                      <h3>Conversion Rate</h3>
                    </div>
                    <div className="metric-value">{analytics.current.conversion.toFixed(1)}%</div>
                    <div className={`metric-comparison ${analytics.comparison.conversion >= 0 ? 'positive' : 'negative'}`}>
                      {analytics.comparison.conversion >= 0 ? '↗' : '↘'} {Math.abs(analytics.comparison.conversion).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="analytics-chart-container">
                  <div className="chart-legend">
                    <span className="legend-item">
                      <span className="legend-dot current"></span>
                      {currentDateStr}
                    </span>
                    <span className="legend-item">
                      <span className="legend-dot previous"></span>
                      {prevDateStr}
                    </span>
                  </div>
                  <div className="chart-wrapper">
                    <svg className="analytics-chart" viewBox="0 0 1000 300" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="0" x2="1000" y2="0" stroke="#e5e7eb" strokeWidth="1"/>
                      <line x1="0" y1="75" x2="1000" y2="75" stroke="#e5e7eb" strokeWidth="1"/>
                      <line x1="0" y1="150" x2="1000" y2="150" stroke="#e5e7eb" strokeWidth="1"/>
                      <line x1="0" y1="225" x2="1000" y2="225" stroke="#e5e7eb" strokeWidth="1"/>
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="#e5e7eb" strokeWidth="1"/>
                      
                      {/* Chart lines */}
                      {(() => {
                        const maxValue = Math.max(...analytics.chartData.map(d => Math.max(d.current, d.previous)), 1);
                        const scaleY = (value) => 280 - (value / maxValue) * 260;
                        
                        // Current period line
                        const currentPath = analytics.chartData.map((d, i) => {
                          const x = (i / 23) * 1000;
                          const y = scaleY(d.current);
                          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                        }).join(' ');
                        
                        // Previous period line
                        const previousPath = analytics.chartData.map((d, i) => {
                          const x = (i / 23) * 1000;
                          const y = scaleY(d.previous);
                          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            <path d={currentPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
                            <path d={previousPath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="chart-x-axis">
                      <span>12 am</span>
                      <span>6 am</span>
                      <span>12 pm</span>
                      <span>6 pm</span>
                      <span>12 am</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {currentPage === 'products' && (
          <>
            <div className="content-header">
              <div>
                <h1>Products</h1>
                <p>Your Shopify products synchronized with POS system</p>
              </div>
            </div>

            <div className="products-page-header">
              <div className="products-search-bar">
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or vendor..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                />
              </div>
              <div className="products-actions">
                <button onClick={loadShopifyProducts} className="sync-btn" disabled={loading}>
                  {loading ? 'Syncing...' : 'Sync from Shopify'}
                </button>
              </div>
            </div>

            <div className="products-content">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading products from Shopify...</p>
                </div>
              ) : (
                (() => {
                  // Filter products first
                  const filteredProducts = products.filter(product => 
                    product.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    (product.sku && product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())) ||
                    product.vendor.toLowerCase().includes(productSearchTerm.toLowerCase())
                  );

                  // Calculate pagination for filtered products
                  const totalProducts = filteredProducts.length;
                  const totalPages = Math.ceil(totalProducts / productsPerPage);
                  const startIndex = (productsCurrentPage - 1) * productsPerPage;
                  const endIndex = startIndex + productsPerPage;
                  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

                  return (
                <>
                  <div className="products-header">
                    <div className="products-stats">
                          <span className="products-count">Total Products: {totalProducts}</span>
                      <span className="shopify-badge">🔗 Synced from Shopify</span>
                    </div>
                  </div>

                      {totalProducts > 0 ? (
                        <>
                  <div className="products-grid">
                            {paginatedProducts.map((product) => (
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

                          {totalPages > 1 && (
                            <div className="table-footer">
                              <span className="results-count">
                                Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} products
                              </span>
                              <div className="pagination-controls">
                                <button 
                                  className="pagination-btn"
                                  onClick={() => setProductsCurrentPage(1)}
                                  disabled={productsCurrentPage === 1}
                                >
                                  ⟨⟨ First
                                </button>
                                <button 
                                  className="pagination-btn"
                                  onClick={() => setProductsCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={productsCurrentPage === 1}
                                >
                                  ⟨ Prev
                                </button>
                                <span className="page-info">
                                  Page {productsCurrentPage} of {totalPages}
                                </span>
                                <button 
                                  className="pagination-btn"
                                  onClick={() => setProductsCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={productsCurrentPage === totalPages}
                                >
                                  Next ⟩
                                </button>
                                <button 
                                  className="pagination-btn"
                                  onClick={() => setProductsCurrentPage(totalPages)}
                                  disabled={productsCurrentPage === totalPages}
                                >
                                  Last ⟩⟩
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                    <div className="empty-state">
                      <h3>No products found</h3>
                          <p>{products.length === 0 ? 'Click "Sync from Shopify" to load your products' : 'No products match your search'}</p>
                    </div>
                  )}
                </>
                  );
                })()
              )}
            </div>
          </>
        )}


        {currentPage === 'locations' && (
          <>
            <div className="content-header">
              <h1>🧾 Invoice Management</h1>
              <p>View and manage recent client invoices</p>
            </div>

            <div className="locations-content">
              {/* Recent Invoices Section */}
              <div className="invoices-section">
                <div className="invoices-header">
                  <h2>🧾 Recent Client Invoices</h2>
                  <div className="city-filter">
                    <label htmlFor="cityFilter">Filter by Location:</label>
                    <select 
                      id="cityFilter"
                      value={selectedCity} 
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="city-filter-select"
                    >
                      <option value="all">All Locations</option>
                      {shopifyLocations && shopifyLocations.length > 0 && shopifyLocations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}{location.city && ` - ${location.city}`}
                        </option>
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
                      city: order.location?.city || order.city || 'Unknown City',
                      state: order.location?.state || order.state || 'Unknown State',
                      paymentMethod: order.paymentMethod || 'Cash',
                      timestamp: order.timestamp || new Date().toISOString(),
                      items: Array.isArray(order.items) ? order.items : [],
                      total: order.total || 0,
                      createdBy: order.createdBy || (user ? {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role?.name || user.role
                      } : null)
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
                            
                            {/* Created By Info */}
                            {safeOrder.createdBy && safeOrder.createdBy.firstName && safeOrder.createdBy.lastName && (
                              <div className="info-item">
                                <div className="info-label">👨‍💼 Created By</div>
                                <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem'
                                  }}>
                                    {safeOrder.createdBy.firstName.charAt(0)}{safeOrder.createdBy.lastName.charAt(0)}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                      {safeOrder.createdBy.firstName} {safeOrder.createdBy.lastName}
                                    </span>
                                    <span style={{ 
                                      fontSize: '0.75rem', 
                                      color: '#64748b',
                                      textTransform: 'capitalize'
                                    }}>
                                      {safeOrder.createdBy.role}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="info-item download-section">
                              <div className="info-label">📄 Invoice</div>
                              <div className="info-value">
                                <div className="invoice-buttons">
                                  <button 
                                    className="preview-invoice-btn"
                                    onClick={() => previewInvoice(safeOrder)}
                                    title="Preview Invoice"
                                  >
                                    👁️ Preview
                                  </button>
                                <button 
                                  className="download-invoice-btn"
                                  onClick={() => downloadInvoice(safeOrder)}
                                  title="Download Invoice PDF"
                                >
                                  📥 Download
                                </button>
                                <button 
                                  className="send-whatsapp-btn"
                                  onClick={() => sendInvoiceWhatsApp(safeOrder)}
                                  title="Send Invoice via WhatsApp"
                                >
                                  📱 Send WhatsApp
                                </button>
                                </div>
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

            </div>
          </>
        )}

        {currentPage === 'location-analytics' && (
          <>
            <div className="content-header">
              <h1>📍 Location Management</h1>
              <p>Manage your business locations and analyze their performance</p>
            </div>

            <div className="location-analytics-content">
              {/* Location Selector */}
              <div className="location-selector-section">
                <h2>📊 Analytics by Location</h2>
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
                    {shopifyLocations && shopifyLocations.length > 0 && shopifyLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}{location.city && ` - ${location.city}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analytics Display */}
              {selectedLocationForAnalytics && locationAnalyticsData && !locationAnalyticsData.isEmpty && (
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

              {selectedLocationForAnalytics && locationAnalyticsData && locationAnalyticsData.isEmpty && (
                <div className="empty-state">
                  <h3>📊 No Sales Data Yet for {locationAnalyticsData.location.name}</h3>
                  <p>This location doesn't have any sales recorded yet. Make some sales from the POS to see analytics here!</p>
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
                  <p>Choose a location from the dropdown above to see detailed product performance analytics based on real POS sales data</p>
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
              
              {/* Client User Notice */}
              {user && user.role && (user.role.name === 'client' || user.role === 'client') && (
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '0.75rem',
                  margin: '1rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📍</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Assigned Locations Only</strong>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                      You are viewing sales from your assigned locations only. {assignedLocations.length > 0 ? `Currently showing ${assignedLocations.length} location(s).` : 'No locations assigned.'}
                    </span>
                  </div>
                </div>
              )}
              
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
              
              {user?.role?.name === 'admin' && (
              <div className="sales-filters">
                <div className="filter-group">
                  <label>Filter Orders:</label>
                  <div className="filter-buttons">
                      {(() => {
                        // Use filtered stats for client users, regular stats for admin users
                        const displayStats = (user && user.role && (user.role.name === 'client' || user.role === 'client')) 
                          ? getFilteredStats() 
                          : salesData?.stats || { totalOrders: 0, completedOrders: 0, defectedOrders: 0 };
                        
                        return (
                          <>
                    <button 
                      className={`filter-btn ${salesFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleSalesFilterChange('all')}
                    >
                              All Orders ({displayStats.totalOrders})
                    </button>
                    <button 
                      className={`filter-btn ${salesFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => handleSalesFilterChange('completed')}
                    >
                              Completed ({displayStats.completedOrders})
                    </button>
                    <button 
                      className={`filter-btn ${salesFilter === 'defected' ? 'active' : ''}`}
                      onClick={() => handleSalesFilterChange('defected')}
                    >
                              Defected ({displayStats.defectedOrders})
                    </button>
                          </>
                        );
                      })()}
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
                        {city} ({salesData?.orders?.filter(o => (o.location?.city || o.city) === city).length || 0})
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
              )}
            </div>

            <div className="sales-content">
              {salesData ? (
                <div className="sales-overview">
                  <div className="sales-stats">
                    {(() => {
                      // Use filtered stats for client users, regular stats for admin users
                      const displayStats = (user && user.role && (user.role.name === 'client' || user.role === 'client')) 
                        ? getFilteredStats() 
                        : salesData.stats;
                      
                      return (
                        <>
                    <div className="stat-card">
                            <h3>₹{displayStats.totalRevenue.toLocaleString()}</h3>
                      <p>Total Revenue</p>
                    </div>
                    <div className="stat-card">
                            <h3>{displayStats.totalOrders}</h3>
                      <p>Total Orders</p>
                    </div>
                    <div className="stat-card">
                            <h3>₹{displayStats.averageOrderValue.toLocaleString()}</h3>
                      <p>Avg Order Value</p>
                    </div>
                    <div className="stat-card defect-card">
                            <h3>{displayStats.defectedOrders}</h3>
                      <p>Defected Orders</p>
                            <span className="defect-amount">₹{displayStats.defectedRevenue.toLocaleString()}</span>
                    </div>
                        </>
                      );
                    })()}
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
                        <div key={order.id} className={`order-card ${order.status} ${expandedOrder === order.id ? 'expanded' : ''}`}>
                            <div 
                              className="order-header clickable-header" 
                              onClick={() => toggleOrderExpansion(order.id)}
                            >
                              <div className="order-info">
                                <h3>{order.id}</h3>
                                <span className="order-date">{new Date(order.timestamp || order.orderDate || new Date()).toLocaleDateString()}</span>
                                <span className={`status-badge ${order.status}`}>
                                  {order.status === 'defected' ? '🚨 Defected' : '✅ Completed'}
                                </span>
                                <span className="location-badge">
                                  📍 {order.location?.city || order.city || 'Unknown City'}, {order.location?.state || order.state || 'Unknown State'}
                                </span>
                              </div>
                              <div className="order-amount">
                                <span className="amount">₹{(order.total || 0).toLocaleString()}</span>
                                <span className="payment-method">{order.paymentMethod || 'Cash'}</span>
                              </div>
                              <div className="expand-icon">
                                {expandedOrder === order.id ? '▲' : '▼'}
                              </div>
                            </div>
                          
                          {/* Collapsible Content */}
                          <div className={`order-content ${expandedOrder === order.id ? 'expanded' : 'collapsed'}`}>
                          
                          {/* Enhanced Location & Kiosk Details */}
                          {order.location && (
                            <div className="location-details-box" style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '1rem',
                              borderRadius: '0.75rem',
                              marginBottom: '1rem'
                            }}>
                              <h4 style={{marginBottom: '0.5rem', fontSize: '1rem'}}>📍 Location & Terminal Details</h4>
                              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem'}}>
                                <div>
                                  <strong>Location:</strong> {order.location.name || 'N/A'}
                                </div>
                                <div>
                                  <strong>City:</strong> {order.location.city || 'N/A'}
                                </div>
                                <div>
                                  <strong>State:</strong> {order.location.state || 'N/A'}
                                </div>
                                <div>
                                  <strong>GST No:</strong> {order.location.gstNumber || 'N/A'}
                                </div>
                                {order.kiosk && (
                                  <>
                                    <div>
                                      <strong>Terminal:</strong> {order.kiosk.name || 'N/A'}
                                    </div>
                                    <div>
                                      <strong>Kiosk ID:</strong> {order.kiosk.id || 'N/A'}
                                    </div>
                                  </>
                                )}
                                {order.transactionDate && (
                                  <>
                                    <div>
                                      <strong>Date:</strong> {order.transactionDate}
                                    </div>
                                    <div>
                                      <strong>Time:</strong> {order.transactionTime}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="customer-info">
                            <div className="customer-details">
                                <h4>{order.clientName || order.customerName || 'Unknown Customer'}</h4>
                                <span className="customer-email">{order.customerEmail || order.clientEmail || 'N/A'}</span>
                                <span className="customer-phone">{order.customerPhone || order.clientPhone || 'N/A'}</span>
                            </div>
                            <div className="invoice-info">
                              <span className="invoice-number">Invoice: {order.invoiceNumber}</span>
                            </div>
                          </div>

                          <div className="order-items">
                              <h4>📦 Items ({(order.items || []).length})</h4>
                            <div className="items-list">
                                {(order.items || []).map((item) => (
                                <div key={item.id} className={`item-row ${item.isDefected ? 'defected' : ''}`}>
                                  <div className="item-info">
                                      <span className="item-name">{item.productName || item.title || 'Unknown Product'}</span>
                                      <span className="item-sku">SKU: {item.sku || 'N/A'}</span>
                                    {item.isDefected && (
                                      <span className="defect-reason">🚨 {item.defectReason}</span>
                                    )}
                                  </div>
                                  <div className="item-pricing">
                                      <span className="item-price">₹{(item.price || 0).toLocaleString()}</span>
                                      <span className="item-quantity">Qty: {item.quantity || 1}</span>
                                  </div>
                                </div>
                              ))}
                              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
              <h1>👥 User Management</h1>
              <p>Manage users, roles, and permissions for your POS system</p>
                </div>
                <button 
                  onClick={handleAddUser}
                  className="add-location-btn"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ➕ Add New User
                </button>
              </div>
              
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

        {currentPage === 'pos' && (() => {
          // Compute filtered POS products based on search term
          const filteredPosProducts = posProducts.filter(product => {
            if (!posSearchTerm) return true;
            const searchLower = posSearchTerm.toLowerCase();
            return (
              product.title?.toLowerCase().includes(searchLower) ||
              product.variants?.[0]?.sku?.toLowerCase().includes(searchLower) ||
              product.product_type?.toLowerCase().includes(searchLower) ||
              product.vendor?.toLowerCase().includes(searchLower)
            );
          });

          // Calculate total pages
          const totalPosPages = Math.ceil(filteredPosProducts.length / posProductsPerPage);

          return (
          <>
            <div className="content-header">
              <h1>Point of Sale (POS)</h1>
              <p>Process sales transactions and manage orders</p>
            </div>

            {/* Location Selector */}
            {shopifyLocations.length > 0 && (
              <div className="location-selector-bar">
                <div className="location-selector-content">
                  <div className="location-info">
                    <span className="location-icon">📍</span>
                    <div>
                      <strong>Shopping Location:</strong>
                      {detectedCity && (
                        <span className="detected-city"> (Detected: {detectedCity})</span>
                      )}
                    </div>
                  </div>
                  
                  <select 
                    value={selectedLocationId || ''} 
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="location-selector"
                    disabled={assignedLocations.length > 0 && assignedLocations.length === 1}
                  >
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <option value="">All Locations</option>
                    )}
                    {shopifyLocations
                      .filter(loc => {
                        // Admin can see all locations
                        if (user?.role === 'admin' || user?.role === 'super_admin') return true;
                        // Non-admin can only see assigned locations
                        if (assignedLocations.length === 0) return true; // Show all if no restrictions
                        return assignedLocations.includes(loc.id);
                      })
                      .map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.city && `- ${loc.city}`}
                        </option>
                      ))
                    }
                  </select>

                  {user?.role === 'admin' && (
                    <label className="admin-toggle">
                      <input 
                        type="checkbox" 
                        checked={showAllLocations}
                        onChange={(e) => setShowAllLocations(e.target.checked)}
                      />
                      <span>Show All Locations (Admin)</span>
                    </label>
                  )}
                </div>

                {selectedLocationId && !showAllLocations && (
                  <div className="location-filter-notice">
                    {assignedLocations.length > 0 ? (
                      <>🔒 You are restricted to {assignedLocations.length} assigned location{assignedLocations.length > 1 ? 's' : ''}. Showing products from selected location only.</>
                    ) : (
                      <>ℹ️ Showing products available at selected location only</>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pos-container">
              {/* Cart Overlay for mobile */}
              <div 
                className={`pos-cart-overlay ${showCart ? 'active' : ''}`}
                onClick={() => setShowCart(false)}
              />

              <div className="pos-main">
                {/* Products Section - Always visible on mobile */}
                <div className="pos-products">
                  <div className="pos-products-header">
                  <h3>Products</h3>
                    <div className="pos-search-bar">
                      <FiSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search products by name, SKU, or category..."
                        value={posSearchTerm}
                        onChange={(e) => setPosSearchTerm(e.target.value)}
                        className="pos-search-input"
                      />
                      {posSearchTerm && (
                        <button 
                          className="clear-search-btn"
                          onClick={() => setPosSearchTerm('')}
                          title="Clear search"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  </div>
                  {posLoading ? (
                    <div className="pos-loading">
                      <div className="loading-spinner"></div>
                      <p>Loading products...</p>
                    </div>
                  ) : filteredPosProducts.length === 0 ? (
                    <div className="no-products">
                      <p>No products available</p>
                    </div>
                  ) : (
                    <>
                      <div className="pos-products-grid">
                        {filteredPosProducts
                          .slice(
                            (posCurrentPage - 1) * posProductsPerPage,
                            posCurrentPage * posProductsPerPage
                          )
                          .map((product) => {
                            const inventoryItem = product.inventory_levels?.find(inv => 
                              showAllLocations ? true : inv.location_id?.toString() === selectedLocationId?.toString()
                            );
                            const availableQuantity = inventoryItem?.available || 0;

                            return (
                              <div key={product.id} className="pos-product-card" onClick={() => addToCart(product)}>
                                <img 
                                  src={product.image?.src || 'https://via.placeholder.com/150'} 
                                  alt={product.title}
                                  className="product-image"
                                />
                                <h4>{product.title}</h4>
                                <p className="product-price">₹{product.variants?.[0]?.price || '0'}</p>
                                {selectedLocationId && !showAllLocations && (
                                  <p className="product-stock">Stock: {availableQuantity}</p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                      {totalPosPages > 1 && (
                        <div className="pos-pagination">
                          <button 
                            onClick={() => setPosCurrentPage(Math.max(1, posCurrentPage - 1))}
                            disabled={posCurrentPage === 1}
                          >
                            Previous
                          </button>
                          <span>Page {posCurrentPage} of {totalPosPages}</span>
                          <button 
                            onClick={() => setPosCurrentPage(Math.min(totalPosPages, posCurrentPage + 1))}
                            disabled={posCurrentPage === totalPosPages}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Cart/Checkout Section - Modal on mobile */}
                <div className={`pos-sidebar ${showCart ? 'show-cart' : ''}`}>
                  {/* Cart Modal Header - mobile only */}
                  <div className="pos-cart-modal-header">
                    <h3>Shopping Cart</h3>
                    <button 
                      className="pos-cart-close-btn"
                      onClick={() => setShowCart(false)}
                      aria-label="Close cart"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="pos-cart">
                    <h3 className="desktop-cart-title">Shopping Cart</h3>
                    {cart.length === 0 ? (
                      <div className="empty-cart">
                        <p>Cart is empty</p>
                        <p>Add products to start a sale</p>
                      </div>
                    ) : (
                      <>
                        <div className="cart-items">
                          {cart.map((item) => {
                            const itemTotal = item.price * item.quantity;
                            const discountAmount = item.discountAmount || 0;
                            const discountedTotal = itemTotal - discountAmount;
                            
                            return (
                            <div key={item.cartItemId} className="cart-item">
                              <div className="cart-item-info">
                                <span className="cart-item-name">{item.name}</span>
                                <div className="cart-item-controls">
                                  <button 
                                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                    className="quantity-btn"
                                  >-</button>
                                  <span className="quantity">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                    className="quantity-btn"
                                  >+</button>
                                  <button 
                                    onClick={() => removeFromCart(item.cartItemId)}
                                    className="remove-btn"
                                  >×</button>
                                </div>
                              </div>
                                
                                {/* Discount Controls */}
                                <div className="discount-controls">
                                  <div className="discount-input-group">
                                    <label>Discount %:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={item.discountPercentage || 0}
                                      onChange={(e) => updateDiscount(item.cartItemId, 'percentage', parseFloat(e.target.value) || 0)}
                                      className="discount-input"
                                    />
                            </div>
                                  <div className="discount-input-group">
                                    <label>Discount ₹:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max={itemTotal}
                                      value={item.discountAmount || 0}
                                      onChange={(e) => updateDiscount(item.cartItemId, 'amount', parseFloat(e.target.value) || 0)}
                                      className="discount-input"
                                    />
                                  </div>
                                </div>
                                
                                <div className="cart-item-price">
                                  {discountAmount > 0 ? (
                                    <div className="price-breakdown">
                                      <span className="original-price">₹{itemTotal.toLocaleString()}</span>
                                      <span className="discount-amount">-₹{discountAmount.toLocaleString()}</span>
                                      <span className="final-price">₹{discountedTotal.toLocaleString()}</span>
                                    </div>
                                  ) : (
                                    <span>₹{itemTotal.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="cart-total">
                          <div className="total-breakdown">
                            <div className="total-row">
                              <span>Original Total:</span>
                              <span>₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            {getCartDiscountTotal() > 0 && (
                              <div className="total-row discount-row">
                                <span>Item Discounts:</span>
                                <span>-₹{getCartDiscountTotal().toLocaleString()}</span>
                              </div>
                            )}
                            <div className="total-row">
                              <span>Subtotal:</span>
                              <span>₹{getCartSubtotal().toLocaleString()}</span>
                            </div>
                            {getGSTBreakdown().map((gstGroup, index) => (
                              <div key={index} className="total-row gst-row">
                                <span>IGST @ {gstGroup.rate}%:</span>
                                <span>₹{(gstGroup.igst || 0).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="total-row final-total">
                              <strong>Total: ₹{getCartTotalWithGST().toLocaleString()}</strong>
                            </div>
                          </div>
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

                {/* Floating Complete Button - Mobile Only */}
                        <button 
                  className="pos-floating-complete"
                  onClick={() => setShowCart(true)}
                  disabled={cart.length === 0}
                >
                  <FiShoppingCart size={20} />
                  <span>View Cart</span>
                  {cart.length > 0 && (
                    <span className="cart-count">{cart.length}</span>
                  )}
                  <span>₹{getCartTotalWithGST().toLocaleString()}</span>
                              </button>
                            </div>
                          </div>
          </>
                  );
                })()}

        {currentPage === 'assign-locations' && (
          <>
            <div className="content-header">
              <h1>📍 Assign Locations to Users</h1>
              <p>Manage which users have access to which locations for better data isolation and security</p>
            </div>

            {/* Assignment Form */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              borderRadius: '1rem',
              marginBottom: '2rem',
              color: 'white',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                ➕ Create New Assignment
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '1rem',
                      background: 'white',
                      color: '#333'
                    }}
                  >
                    <option value="">-- Select a user --</option>
                    {usersData?.users?.filter(u => u.role === 'client').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Select Location
                  </label>
                  <select
                    value={selectedAssignmentLocationId}
                    onChange={(e) => setSelectedAssignmentLocationId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '1rem',
                      background: 'white',
                      color: '#333'
                    }}
                  >
                    <option value="">-- Select a location --</option>
                    {shopifyLocations?.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} {location.city && `(${location.city}${location.province ? `, ${location.province}` : ''})`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssignUserToLocation}
                  disabled={!selectedUserId || !selectedAssignmentLocationId || assignmentLoading}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: selectedUserId && selectedAssignmentLocationId ? '#10b981' : '#6b7280',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: selectedUserId && selectedAssignmentLocationId ? 'pointer' : 'not-allowed',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {assignmentLoading ? '⏳ Assigning...' : '✅ Assign Location'}
                </button>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.9rem'
              }}>
                💡 <strong>Note:</strong> Users will only see data from their assigned locations in Location Analytics, Sales, and Reports.
              </div>
            </div>

            {/* Assignments List */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#1e293b' }}>
                📋 Current Assignments ({assignments.length})
              </h2>

              {assignmentLoading && assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p>Loading assignments...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#64748b',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '2px dashed #cbd5e1'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                  <h3 style={{ marginBottom: '0.5rem', color: '#475569' }}>No Assignments Yet</h3>
                  <p>Start by assigning locations to users using the form above</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {assignments.map((assignment) => {
                    const assignedUser = usersData?.users?.find(u => u.id === assignment.userId);
                    const assignedLocation = shopifyLocations?.find(l => l.id === assignment.locationId);
                    
                    return (
                      <div
                        key={assignment.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.5rem',
                          background: assignment.isActive ? '#f0fdf4' : '#fef2f2',
                          border: `2px solid ${assignment.isActive ? '#86efac' : '#fecaca'}`,
                          borderRadius: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                              👤 User
                            </div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.1rem' }}>
                              {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unknown User'}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                              {assignedUser?.email || 'N/A'}
                            </div>
                          </div>

                          <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>→</div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                              📍 Location
                            </div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.1rem' }}>
                              {assignedLocation?.name || 'Unknown Location'}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                              {assignedLocation?.city || 'N/A'}{assignedLocation?.province ? `, ${assignedLocation.province}` : ''}{assignedLocation?.country ? `, ${assignedLocation.country}` : ''}
                            </div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                              Status
                            </div>
                            <span style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '9999px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: assignment.isActive ? '#10b981' : '#ef4444',
                              color: 'white'
                            }}>
                              {assignment.isActive ? '✅ Active' : '⏸️ Inactive'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                          <button
                            onClick={() => handleToggleAssignmentStatus(assignment.id, assignment.isActive)}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              background: assignment.isActive ? '#f59e0b' : '#10b981',
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {assignment.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              background: '#ef4444',
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {currentPage === 'data' && (
          <>
            <div className="content-header">
              <h1>💾 Data Management & Backups</h1>
              <p>Manage your daily backups, view backup history, and restore your data</p>
            </div>

            <div className="data-management-content">
              {/* Backup Management Section */}
              <div className="backup-management-section">
                <div className="section-header">
                  <h2>📦 Database Backups</h2>
                  <div className="header-actions">
                    <button 
                      className="btn-danger cleanup-btn"
                      onClick={() => setShowCleanupModal(true)}
                      disabled={backupLoading || cleanupLoading}
                      title="Clean up all data except products"
                    >
                      <FiTrash2 /> Clean Up Data
                    </button>
                    <button 
                      className="btn-secondary refresh-btn"
                      onClick={loadBackups}
                      disabled={backupLoading}
                    >
                      <FiRefreshCw /> Refresh
                    </button>
                    <button 
                      className="btn-primary create-backup-btn"
                      onClick={() => setShowBackupModal(true)}
                      disabled={backupLoading}
                    >
                      <FiPlus /> Create New Backup
                    </button>
                  </div>
                </div>

                {backupLoading && backups.length === 0 ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading backups...</p>
                  </div>
                ) : backups.length > 0 ? (
                  <div className="backups-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Backup Name</th>
                          <th>Type</th>
                          <th>Format</th>
                          <th>Status</th>
                          <th>Size</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backups.map((backup) => (
                          <tr key={backup.id}>
                            <td>
                              <div className="backup-name">
                                <strong>{backup.name}</strong>
                                {backup.description && (
                                  <small>{backup.description}</small>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`type-badge ${backup.type}`}>
                                {backup.type}
                              </span>
                            </td>
                            <td>
                              <span className="format-badge">{backup.format.toUpperCase()}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${backup.status}`}>
                                {backup.status === 'processing' && '⏳ '}
                                {backup.status === 'completed' && '✅ '}
                                {backup.status === 'failed' && '❌ '}
                                {backup.status === 'pending' && '⏸️ '}
                                {backup.status}
                              </span>
                            </td>
                            <td>
                              {backup.fileSize ? 
                                `${(backup.fileSize / 1024).toFixed(2)} KB` : 
                                'N/A'
                              }
                            </td>
                            <td>
                              {new Date(backup.createdAt).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <div className="backup-actions">
                                {backup.status === 'completed' && (
                                  <button 
                                    className="icon-btn download-btn"
                                    onClick={() => handleDownloadBackup(backup.id, backup.filePath)}
                                    title="Download backup"
                                  >
                                    📥
                                  </button>
                                )}
                                <button 
                                  className="icon-btn edit-btn"
                                  onClick={() => setEditingBackup(backup)}
                                  title="Edit backup"
                                >
                                  <FiEdit2 />
                                </button>
                                <button 
                                  className="icon-btn delete-btn"
                                  onClick={() => handleDeleteBackup(backup.id, backup.name)}
                                  title="Delete backup"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No backups found</h3>
                    <p>Create your first backup to secure your data</p>
                    <button 
                      className="btn-primary"
                      onClick={() => setShowBackupModal(true)}
                    >
                      <FiPlus /> Create First Backup
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentPage === 'shopify-orders' && (
          <React.Fragment>
            <div className="content-header">
              <h1>📦 Shopify Orders</h1>
              <p>View and manage all orders from your Shopify store</p>
            </div>

            <div className="filters-section">
              <div className="filter-group">
                <label>Order Status:</label>
                <select 
                  value={orderStatusFilter} 
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="any">All Orders</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button 
                className="btn-secondary refresh-btn"
                onClick={() => loadShopifyOrders(orderStatusFilter)}
                disabled={ordersLoading}
              >
                🔄 Refresh Orders
              </button>
            </div>

            {ordersLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading Shopify orders...</p>
              </div>
            ) : shopifyOrders.length > 0 ? (
              (() => {
                // Calculate pagination
                const totalOrders = shopifyOrders.length;
                const totalPages = Math.ceil(totalOrders / ordersPerPage);
                const startIndex = (ordersCurrentPage - 1) * ordersPerPage;
                const endIndex = startIndex + ordersPerPage;
                const paginatedOrders = shopifyOrders.slice(startIndex, endIndex);

                return (
                  <>
                    <div className="shopify-orders-table-container">
                      <table className="shopify-orders-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Channel</th>
                            <th>Total</th>
                            <th>Payment Status</th>
                            <th>Fulfillment Status</th>
                            <th>Items</th>
                            <th>Delivery Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedOrders.map((order) => {
                      const getShopifyOrderCustomerName = (o) => {
                        if (!o) return 'Guest';
                        if (o.customerName && String(o.customerName).trim()) return o.customerName;
                        if (o.customer && (o.customer.first_name || o.customer.last_name)) {
                          const parts = [o.customer.first_name, o.customer.last_name].filter(Boolean);
                          const n = parts.join(' ').trim();
                          if (n) return n;
                        }
                        if (o.shipping_address) {
                          const n = o.shipping_address.name || [o.shipping_address.first_name, o.shipping_address.last_name].filter(Boolean).join(' ').trim();
                          if (n) return n;
                        }
                        if (o.billing_address) {
                          const n = o.billing_address.name || [o.billing_address.first_name, o.billing_address.last_name].filter(Boolean).join(' ').trim();
                          if (n) return n;
                        }
                        if (o.contact_email || o.email) return (o.contact_email || o.email).split('@')[0];
                        return 'Guest';
                      };

                      return (
                        <tr key={order.id}>
                          <td>
                            <span className="order-number">#{order.order_number || order.name}</span>
                          </td>
                          <td>
                            <span className="order-date">
                              {new Date(order.created_at).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td>
                            <span className="customer-name">
                              {getShopifyOrderCustomerName(order)}
                            </span>
                          </td>
                          <td>
                            <span className="channel-name">
                              {order.source_name || order.gateway || 'Online Store'}
                            </span>
                          </td>
                          <td>
                            <span className="order-total">₹{parseFloat(order.total_price || 0).toLocaleString()}</span>
                          </td>
                          <td>
                            <span className={`status-badge payment-${order.financial_status?.toLowerCase()}`}>
                              {order.financial_status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge fulfillment-${order.fulfillment_status || 'unfulfilled'}`}>
                              {order.fulfillment_status || 'Unfulfilled'}
                            </span>
                          </td>
                          <td>
                            <span className="items-count">
                              {order.line_items?.length || 0} {order.line_items?.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                          <td>
                            <span className="delivery-status">
                              {order.fulfillment_status === 'fulfilled' ? 'Delivered' : 
                               order.fulfillment_status === 'partial' ? 'Partially delivered' :
                               'Shipping not requested'}
                            </span>
                          </td>
                        </tr>
                      );
                          })}
                        </tbody>
                      </table>
                      <div className="table-footer">
                        <span className="results-count">
                          Showing {startIndex + 1}-{Math.min(endIndex, totalOrders)} of {totalOrders} orders
                        </span>
                        <div className="pagination-controls">
                          <button 
                            className="pagination-btn"
                            onClick={() => setOrdersCurrentPage(1)}
                            disabled={ordersCurrentPage === 1}
                          >
                            ⟨⟨ First
                          </button>
                          <button 
                            className="pagination-btn"
                            onClick={() => setOrdersCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={ordersCurrentPage === 1}
                          >
                            ⟨ Prev
                          </button>
                          <span className="page-info">
                            Page {ordersCurrentPage} of {totalPages}
                          </span>
                          <button 
                            className="pagination-btn"
                            onClick={() => setOrdersCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={ordersCurrentPage === totalPages}
                          >
                            Next ⟩
                          </button>
                          <button 
                            className="pagination-btn"
                            onClick={() => setOrdersCurrentPage(totalPages)}
                            disabled={ordersCurrentPage === totalPages}
                          >
                            Last ⟩⟩
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No Orders Found</h3>
                <p>No orders match your current filter</p>
              </div>
            )}
          </React.Fragment>
        )}

        {currentPage === 'shopify-customers' && (
          <React.Fragment>
            <div className="content-header">
              <h1>👥 Shopify Customers</h1>
              <p>View and manage all customers from your Shopify store</p>
            </div>

            <div className="filters-section">
              <button 
                className="btn-secondary refresh-btn"
                onClick={loadShopifyCustomers}
                disabled={customersLoading}
              >
                🔄 Refresh Customers
              </button>
            </div>

            {customersLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading Shopify customers...</p>
              </div>
            ) : shopifyCustomers.length > 0 ? (
              <div className="shopify-customers-grid">
                {shopifyCustomers.map((customer) => (
                  <div key={customer.id} className="customer-card">
                    <div className="customer-header">
                      <h3>{customer.first_name} {customer.last_name}</h3>
                      {customer.verified_email && (
                        <span className="verified-badge">✅ Verified</span>
                      )}
                    </div>
                    
                    <div className="customer-details">
                      {customer.email && (
                        <div className="detail-row">
                          <span className="label">📧 Email:</span>
                          <span className="value">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="detail-row">
                          <span className="label">📱 Phone:</span>
                          <span className="value">{customer.phone}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="label">🛍️ Orders:</span>
                        <span className="value">{customer.orders_count || 0} orders</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">💰 Total Spent:</span>
                        <span className="value">₹{parseFloat(customer.total_spent || 0).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📅 Joined:</span>
                        <span className="value">{new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                      {customer.state && (
                        <div className="detail-row">
                          <span className="label">Status:</span>
                          <span className={`customer-status ${customer.state}`}>{customer.state}</span>
                        </div>
                      )}
                      {customer.default_address && (
                        <>
                          <div className="detail-row">
                            <span className="label">📍 Address:</span>
                            <span className="value">
                              {customer.default_address.address1}
                              {customer.default_address.address2 && `, ${customer.default_address.address2}`}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="label">🏙️ City:</span>
                            <span className="value">{customer.default_address.city}, {customer.default_address.province}</span>
                          </div>
                          {customer.default_address.zip && (
                            <div className="detail-row">
                              <span className="label">📮 Zip:</span>
                              <span className="value">{customer.default_address.zip}</span>
                            </div>
                          )}
                          {customer.default_address.country && (
                            <div className="detail-row">
                              <span className="label">🌍 Country:</span>
                              <span className="value">{customer.default_address.country}</span>
                            </div>
                          )}
                        </>
                      )}
                      {customer.tags && (
                        <div className="detail-row">
                          <span className="label">🏷️ Tags:</span>
                          <span className="value">{customer.tags || 'None'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Customers Found</h3>
                <p>No customers in your Shopify store</p>
              </div>
            )}
          </React.Fragment>
        )}

        {currentPage !== 'dashboard' && currentPage !== 'products' && currentPage !== 'locations' && currentPage !== 'location-analytics' && currentPage !== 'sales' && currentPage !== 'users' && currentPage !== 'pos' && currentPage !== 'data' && currentPage !== 'shopify-orders' && currentPage !== 'shopify-customers' && currentPage !== 'assign-locations' && (
          <div className="content-header">
            <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            <p>This section is coming soon...</p>
          </div>
        )}

        {/* Customer Information Form Modal */}
        {showCustomerForm && (
          <div className="modal-overlay">
            <div className="modal kiosk-modal">
              <div className="modal-header">
                <h2>👤 Customer Information</h2>
                <button 
                  onClick={() => {
                    setShowCustomerForm(false);
                    setCustomerInfo({ name: '', address: '', phone: '', email: '', gstNumber: '' });
                  }} 
                  className="close-btn"
                >×</button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCustomerFormSubmit();
              }} className="location-form">
                <div className="form-section">
                  <h3>📋 Enter Customer Details</h3>
                  
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter customer address"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email (Optional)</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>GST Number (Optional)</label>
                    <input
                      type="text"
                      value={customerInfo.gstNumber}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                      placeholder="e.g., 22AAAAA0000A1Z5"
                      maxLength="15"
                    />
                  </div>
                </div>

                <div className="form-footer">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCustomerForm(false);
                      setCustomerInfo({ name: '', address: '', phone: '', email: '', gstNumber: '' });
                    }} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Complete Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Location Form Modal */}
        {editingLocation !== undefined && (
          <LocationForm 
            location={editingLocation}
            onSave={handleSaveLocation}
            onClose={handleCloseLocationForm}
            users={usersData?.users || []}
          />
        )}

        {/* Backup Creation Modal */}
        {showBackupModal && (
          <BackupModal 
            onSave={handleCreateBackup}
            onClose={() => setShowBackupModal(false)}
          />
        )}

        {/* Backup Edit Modal */}
        {editingBackup && (
          <EditBackupModal 
            backup={editingBackup}
            onSave={(updateData) => handleUpdateBackup(editingBackup.id, updateData)}
            onClose={() => setEditingBackup(null)}
          />
        )}

        {/* Cleanup Confirmation Modal */}
        {showCleanupModal && (
          <CleanupConfirmationModal 
            onConfirm={handleCleanupData}
            onClose={() => setShowCleanupModal(false)}
            loading={cleanupLoading}
          />
        )}
      </div>
    </div>
  );
}

// Location Form Component
const LocationForm = ({ location, onSave, onClose, users }) => {
  const [formData, setFormData] = useState({
    id: location?.id || null,
    name: location?.name || '',
    address: location?.address || '',
    city: location?.city || '',
    state: location?.state || '',
    zipCode: location?.zipCode || '',
    country: location?.country || 'India',
    phone: location?.phone || '',
    email: location?.email || '',
    gstNumber: location?.gstNumber || '',
    type: location?.type || 'store',
    isActive: location?.isActive !== undefined ? location.isActive : true
  });

  const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please fill in the location name');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal kiosk-modal">
        <div className="modal-header">
          <h2>{location ? '✏️ Edit Location' : '➕ Add New Location'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="location-form">
          <div className="form-section">
            <h3>📍 Location Information</h3>
            
            <div className="form-group">
              <label>Location Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Main Store Mumbai"
                required
              />
            </div>

            <div className="form-row">
            <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="store">Store</option>
                  <option value="kiosk">Kiosk</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="office">Office</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Complete address"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., Maharashtra"
                />
            </div>
          </div>

            <div className="form-row">
            <div className="form-group">
                <label>ZIP Code</label>
              <input
                type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="e.g., 400001"
              />
            </div>
            <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="e.g., India"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📞 Contact Details</h3>
            
            <div className="form-row">
            <div className="form-group">
                <label>Phone Number</label>
              <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="location@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                placeholder="e.g., 27AABCU9603R1ZM"
                maxLength="15"
                style={{ textTransform: 'uppercase' }}
              />
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                15-digit GST identification number (optional)
              </small>
            </div>
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
    password: user?.password || '',
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
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                  required={!user}
                />
                {!user && <small style={{ color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                  Password will be used for login authentication
                </small>}
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

// Backup Modal Component
const BackupModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: `Backup_${new Date().toISOString().split('T')[0]}`,
    type: 'full',
    format: 'json',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal backup-modal">
        <div className="modal-header">
          <h2>💾 Create New Backup</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="backup-form">
          <div className="form-section">
            <div className="form-group">
              <label>Backup Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Daily_Backup_2025_01_01"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Backup Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="full">Full Backup</option>
                  <option value="incremental">Incremental</option>
                  <option value="data_export">Data Export</option>
                </select>
              </div>

              <div className="form-group">
                <label>Format *</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({...formData, format: e.target.value})}
                  required
                >
                  <option value="json">JSON</option>
                  <option value="sql">SQL</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional: Add notes about this backup"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Create Backup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Backup Modal Component
const EditBackupModal = ({ backup, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: backup.name || '',
    description: backup.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal backup-modal">
        <div className="modal-header">
          <h2>✏️ Edit Backup</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="backup-form">
          <div className="form-section">
            <div className="form-group">
              <label>Backup Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Backup name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add or update notes about this backup"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Update Backup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Cleanup Confirmation Modal Component
const CleanupConfirmationModal = ({ onConfirm, onClose, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal cleanup-modal">
        <div className="modal-header">
          <h2>⚠️ Confirm Data Cleanup</h2>
          <button onClick={onClose} className="close-btn" disabled={loading}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="warning-message">
            <div className="warning-icon">🗑️</div>
            <h3>Are you sure you want to clean up all data?</h3>
            <p>This action will permanently delete:</p>
            <ul className="cleanup-list">
              <li>✓ All sales records</li>
              <li>✓ All orders</li>
              <li>✓ All locations</li>
              <li>✓ All users (except admin)</li>
              <li>✓ All backups</li>
            </ul>
            <p className="keep-note">
              <strong>Products will be kept safe and will not be deleted.</strong>
            </p>
            <p className="danger-note">
              ⚠️ This action cannot be undone!
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="btn-danger confirm-cleanup-btn"
            disabled={loading}
          >
            {loading ? 'Cleaning Up...' : 'Yes, Clean Up All Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;