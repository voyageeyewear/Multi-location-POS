# POS System API Documentation

## Overview

The POS System API provides a comprehensive RESTful interface for managing multi-location point-of-sale operations. All endpoints require authentication unless otherwise specified.

## Base URL

```
http://localhost:8000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [] // Error details (if applicable)
}
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "role": {
        "name": "admin",
        "permissions": {}
      },
      "company": {
        "id": "uuid",
        "name": "Company Name"
      }
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

#### POST /auth/register
Register a new user (admin only).

#### POST /auth/refresh-token
Refresh access token using refresh token.

#### POST /auth/logout
Logout and invalidate refresh token.

#### GET /auth/profile
Get current user profile.

#### PUT /auth/change-password
Change user password.

### Users

#### GET /users
Get all users (admin only).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `role` - Filter by role
- `company` - Filter by company

#### GET /users/:id
Get user by ID.

#### POST /users
Create new user (admin only).

#### PUT /users/:id
Update user.

#### DELETE /users/:id
Delete user (admin only).

### Products

#### GET /products
Get all products.

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `category` - Filter by category
- `isActive` - Filter by active status

#### GET /products/:id
Get product by ID.

#### GET /products/search/:query
Search products by name or SKU.

#### POST /products
Create new product.

**Request:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "sku": "SKU-001",
  "barcode": "1234567890123",
  "price": 99.99,
  "cost": 50.00,
  "category": "Electronics",
  "brand": "Brand Name",
  "trackInventory": true,
  "minStockLevel": 10
}
```

#### PUT /products/:id
Update product.

#### DELETE /products/:id
Delete product.

#### GET /products/:id/inventory
Get product inventory across locations.

#### PUT /products/:id/inventory
Update product inventory at specific location.

### Locations

#### GET /locations
Get all locations.

#### GET /locations/:id
Get location by ID.

#### POST /locations
Create new location (admin only).

#### PUT /locations/:id
Update location.

#### DELETE /locations/:id
Delete location (admin only).

#### GET /locations/:id/stats
Get location statistics.

### Sales

#### GET /sales
Get all sales.

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `locationId` - Filter by location
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `status` - Filter by status
- `paymentMethod` - Filter by payment method

#### GET /sales/:id
Get sale by ID.

#### POST /sales
Create new sale.

**Request:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "locationId": "location-uuid",
  "paymentMethod": "cash",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": 99.99,
      "discountAmount": 0
    }
  ]
}
```

#### PUT /sales/:id
Update sale.

#### PUT /sales/:id/cancel
Cancel sale.

#### PUT /sales/:id/refund
Refund sale.

#### GET /sales/:id/receipt
Generate receipt for sale.

### Reports

#### GET /reports
Get all reports.

#### POST /reports
Generate new report.

**Request:**
```json
{
  "name": "Sales Report",
  "type": "sales",
  "format": "pdf",
  "parameters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "locationId": "location-uuid"
  }
}
```

#### GET /reports/:id
Get report by ID.

#### GET /reports/:id/download
Download report file.

#### DELETE /reports/:id
Delete report.

### Companies

#### GET /companies
Get all companies (super admin only).

#### GET /companies/:id
Get company by ID.

#### POST /companies
Create new company (super admin only).

#### PUT /companies/:id
Update company.

#### DELETE /companies/:id
Delete company (super admin only).

### Roles

#### GET /roles
Get all roles.

#### GET /roles/:id
Get role by ID.

#### POST /roles
Create new role (admin only).

#### PUT /roles/:id
Update role (admin only).

#### DELETE /roles/:id
Delete role (admin only).

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate limited to 100 requests per 15-minute window per IP address.

## WebSocket Events

The system supports real-time updates via WebSocket connections:

### Events

- `sale_created` - New sale created
- `sale_updated` - Sale updated
- `product_updated` - Product updated
- `inventory_updated` - Inventory updated
- `user_updated` - User profile updated
- `location_updated` - Location updated

### Connection

```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join company room
socket.emit('join-company', companyId);

// Join location room
socket.emit('join-location', locationId);

// Listen for events
socket.on('sale_created', (data) => {
  console.log('New sale:', data);
});
```

## Examples

### Creating a Sale

```javascript
const response = await fetch('/api/sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    customerName: 'John Doe',
    locationId: 'location-uuid',
    paymentMethod: 'cash',
    items: [
      {
        productId: 'product-uuid',
        quantity: 1,
        unitPrice: 99.99
      }
    ]
  })
});

const result = await response.json();
```

### Searching Products

```javascript
const response = await fetch('/api/products/search/headphones', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});

const products = await response.json();
```
