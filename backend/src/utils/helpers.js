const crypto = require('crypto');
const moment = require('moment');

// Generate unique order number
const generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now().toString().slice(-8);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Generate unique receipt number
const generateReceiptNumber = (prefix = 'RCP') => {
  const timestamp = Date.now().toString().slice(-8);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Generate unique SKU
const generateSKU = (prefix = 'SKU') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate tax amount
const calculateTax = (amount, taxRate) => {
  return Math.round((amount * taxRate) * 100) / 100;
};

// Calculate discount amount
const calculateDiscount = (amount, discountType, discountValue) => {
  if (discountType === 'percentage') {
    return Math.round((amount * discountValue / 100) * 100) / 100;
  } else if (discountType === 'fixed') {
    return Math.min(discountValue, amount);
  }
  return 0;
};

// Format currency
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Format datetime
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

// Parse date range
const parseDateRange = (startDate, endDate) => {
  const start = moment(startDate).startOf('day').toDate();
  const end = moment(endDate).endOf('day').toDate();
  return { start, end };
};

// Get date range for period
const getDateRangeForPeriod = (period) => {
  const now = moment();
  
  switch (period) {
    case 'today':
      return {
        start: now.clone().startOf('day').toDate(),
        end: now.clone().endOf('day').toDate()
      };
    case 'yesterday':
      return {
        start: now.clone().subtract(1, 'day').startOf('day').toDate(),
        end: now.clone().subtract(1, 'day').endOf('day').toDate()
      };
    case 'this_week':
      return {
        start: now.clone().startOf('week').toDate(),
        end: now.clone().endOf('week').toDate()
      };
    case 'last_week':
      return {
        start: now.clone().subtract(1, 'week').startOf('week').toDate(),
        end: now.clone().subtract(1, 'week').endOf('week').toDate()
      };
    case 'this_month':
      return {
        start: now.clone().startOf('month').toDate(),
        end: now.clone().endOf('month').toDate()
      };
    case 'last_month':
      return {
        start: now.clone().subtract(1, 'month').startOf('month').toDate(),
        end: now.clone().subtract(1, 'month').endOf('month').toDate()
      };
    case 'this_quarter':
      return {
        start: now.clone().startOf('quarter').toDate(),
        end: now.clone().endOf('quarter').toDate()
      };
    case 'last_quarter':
      return {
        start: now.clone().subtract(1, 'quarter').startOf('quarter').toDate(),
        end: now.clone().subtract(1, 'quarter').endOf('quarter').toDate()
      };
    case 'this_year':
      return {
        start: now.clone().startOf('year').toDate(),
        end: now.clone().endOf('year').toDate()
      };
    case 'last_year':
      return {
        start: now.clone().subtract(1, 'year').startOf('year').toDate(),
        end: now.clone().subtract(1, 'year').endOf('year').toDate()
      };
    default:
      return {
        start: now.clone().startOf('month').toDate(),
        end: now.clone().endOf('month').toDate()
      };
  }
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

// Build pagination metadata
const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Generate random string
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex');
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if value is empty
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Convert string to slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Truncate text
const truncate = (text, length = 100, suffix = '...') => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

// Group array by key
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// Sort array by key
const sortBy = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
};

// Sleep function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(delay * attempt);
    }
  }
};

module.exports = {
  generateOrderNumber,
  generateReceiptNumber,
  generateSKU,
  calculateTax,
  calculateDiscount,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseDateRange,
  getDateRangeForPeriod,
  paginate,
  buildPaginationMeta,
  sanitizeFilename,
  generateRandomString,
  deepClone,
  isEmpty,
  isValidEmail,
  isValidPhone,
  slugify,
  truncate,
  groupBy,
  sortBy,
  calculatePercentage,
  sleep,
  retry
};
