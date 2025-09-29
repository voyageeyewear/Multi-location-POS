# Database Schema Documentation

## Overview

The POS System uses PostgreSQL as the primary database with TypeORM for object-relational mapping. The schema supports multi-company, multi-location operations with role-based access control.

## Tables

### Companies

Stores company information and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Company name |
| description | TEXT | Company description |
| address | TEXT | Company address |
| phone | VARCHAR(20) | Company phone |
| email | VARCHAR(255) | Company email |
| website | VARCHAR(255) | Company website |
| logo | VARCHAR(500) | Logo image URL |
| settings | JSONB | Company-specific settings |
| isActive | BOOLEAN | Active status |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Roles

Defines user roles and permissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(100) | Role name (unique) |
| description | TEXT | Role description |
| permissions | JSONB | Role permissions |
| isSystemRole | BOOLEAN | System-defined role |
| companyId | UUID (FK) | Associated company |
| isActive | BOOLEAN | Active status |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

**Permissions Structure:**
```json
{
  "users": { "create": true, "read": true, "update": true, "delete": false },
  "products": { "create": true, "read": true, "update": true, "delete": true },
  "locations": { "create": true, "read": true, "update": true, "delete": true },
  "sales": { "create": true, "read": true, "update": true, "delete": true },
  "reports": { "create": true, "read": true, "update": true, "delete": true }
}
```

### Users

Stores user accounts and authentication information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| firstName | VARCHAR(100) | User first name |
| lastName | VARCHAR(100) | User last name |
| email | VARCHAR(255) | User email (unique) |
| password | VARCHAR(255) | Hashed password |
| phone | VARCHAR(20) | User phone |
| avatar | VARCHAR(500) | Avatar image URL |
| isActive | BOOLEAN | Active status |
| lastLoginAt | TIMESTAMP | Last login timestamp |
| emailVerified | BOOLEAN | Email verification status |
| emailVerificationToken | VARCHAR(255) | Email verification token |
| passwordResetToken | VARCHAR(255) | Password reset token |
| passwordResetExpires | TIMESTAMP | Password reset expiry |
| refreshToken | VARCHAR(500) | JWT refresh token |
| roleId | UUID (FK) | User role |
| companyId | UUID (FK) | User company |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Locations

Stores store/kiosk location information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Location name |
| address | TEXT | Location address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State/Province |
| zipCode | VARCHAR(20) | Postal code |
| country | VARCHAR(100) | Country |
| phone | VARCHAR(20) | Location phone |
| email | VARCHAR(255) | Location email |
| type | ENUM | Location type (store, kiosk, warehouse, office) |
| settings | JSONB | Location-specific settings |
| isActive | BOOLEAN | Active status |
| companyId | UUID (FK) | Associated company |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### UserLocations

Junction table for user-location assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| userId | UUID (FK) | User ID |
| locationId | UUID (FK) | Location ID |
| isPrimary | BOOLEAN | Primary location flag |
| permissions | JSONB | Location-specific permissions |
| createdAt | TIMESTAMP | Assignment timestamp |

### Products

Stores product information and inventory.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Product name |
| description | TEXT | Product description |
| sku | VARCHAR(100) | Stock keeping unit |
| barcode | VARCHAR(100) | Product barcode |
| price | DECIMAL(10,2) | Product price |
| cost | DECIMAL(10,2) | Product cost |
| category | VARCHAR(100) | Product category |
| brand | VARCHAR(100) | Product brand |
| image | VARCHAR(500) | Main product image |
| images | JSONB | Additional product images |
| attributes | JSONB | Product attributes |
| isActive | BOOLEAN | Active status |
| isDigital | BOOLEAN | Digital product flag |
| trackInventory | BOOLEAN | Inventory tracking flag |
| minStockLevel | INTEGER | Minimum stock level |
| shopifyProductId | BIGINT | Shopify product ID |
| shopifyVariantId | BIGINT | Shopify variant ID |
| lastSyncedAt | TIMESTAMP | Last Shopify sync |
| companyId | UUID (FK) | Associated company |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### ProductLocations

Stores inventory levels per location.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| productId | UUID (FK) | Product ID |
| locationId | UUID (FK) | Location ID |
| stock | INTEGER | Current stock level |
| reservedStock | INTEGER | Reserved stock |
| minStockLevel | INTEGER | Minimum stock level |
| maxStockLevel | INTEGER | Maximum stock level |
| price | DECIMAL(10,2) | Location-specific price |
| isActive | BOOLEAN | Active status |
| lastUpdated | TIMESTAMP | Last update timestamp |

### Sales

Stores sales transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| orderNumber | VARCHAR(50) | Unique order number |
| customerName | VARCHAR(255) | Customer name |
| customerEmail | VARCHAR(255) | Customer email |
| customerPhone | VARCHAR(20) | Customer phone |
| subtotal | DECIMAL(10,2) | Subtotal amount |
| taxAmount | DECIMAL(10,2) | Tax amount |
| discountAmount | DECIMAL(10,2) | Discount amount |
| total | DECIMAL(10,2) | Total amount |
| paymentMethod | ENUM | Payment method (cash, card, online, cod, other) |
| paymentStatus | ENUM | Payment status (pending, paid, failed, refunded, partially_refunded) |
| status | ENUM | Order status (pending, completed, cancelled, refunded) |
| notes | TEXT | Order notes |
| metadata | JSONB | Additional order data |
| userId | UUID (FK) | Cashier/User ID |
| locationId | UUID (FK) | Sale location |
| companyId | UUID (FK) | Associated company |
| createdAt | TIMESTAMP | Sale timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### SaleItems

Stores individual items within a sale.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| saleId | UUID (FK) | Sale ID |
| productId | UUID (FK) | Product ID |
| quantity | INTEGER | Item quantity |
| unitPrice | DECIMAL(10,2) | Unit price |
| totalPrice | DECIMAL(10,2) | Total price |
| discountAmount | DECIMAL(10,2) | Item discount |
| taxAmount | DECIMAL(10,2) | Item tax |
| notes | TEXT | Item notes |
| createdAt | TIMESTAMP | Creation timestamp |

### Reports

Stores generated reports.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Report name |
| type | ENUM | Report type (sales, inventory, customer, financial, custom) |
| format | ENUM | Report format (pdf, excel, csv, json) |
| status | ENUM | Generation status (pending, generating, completed, failed) |
| parameters | JSONB | Report parameters |
| filePath | VARCHAR(500) | Report file path |
| fileSize | BIGINT | File size in bytes |
| generatedBy | UUID (FK) | User who generated report |
| companyId | UUID (FK) | Associated company |
| expiresAt | TIMESTAMP | Report expiry |
| createdAt | TIMESTAMP | Creation timestamp |
| completedAt | TIMESTAMP | Completion timestamp |

### Backups

Stores backup information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Backup name |
| type | ENUM | Backup type (full, incremental, data_export) |
| format | ENUM | Backup format (json, sql, excel, csv) |
| status | ENUM | Backup status (pending, processing, completed, failed) |
| filePath | VARCHAR(500) | Backup file path |
| fileSize | BIGINT | File size in bytes |
| description | TEXT | Backup description |
| metadata | JSONB | Backup metadata |
| createdBy | UUID (FK) | User who created backup |
| companyId | UUID (FK) | Associated company |
| createdAt | TIMESTAMP | Creation timestamp |
| completedAt | TIMESTAMP | Completion timestamp |

## Indexes

### Primary Indexes
- All tables have UUID primary keys
- Unique constraints on email, SKU, orderNumber

### Performance Indexes
- Users: email, roleId, companyId, isActive
- Products: sku, barcode, companyId, category, isActive, shopifyProductId
- Sales: orderNumber, userId, locationId, companyId, status, paymentStatus, createdAt
- Locations: companyId, type, isActive
- UserLocations: userId, locationId (unique composite)
- ProductLocations: productId, locationId (unique composite)

## Relationships

### One-to-Many
- Company → Users
- Company → Products
- Company → Locations
- Company → Sales
- Company → Reports
- Company → Backups
- Role → Users
- User → Sales
- Location → Sales
- Product → SaleItems
- Sale → SaleItems

### Many-to-Many
- Users ↔ Locations (via UserLocations)
- Products ↔ Locations (via ProductLocations)

## Data Types

### Enums

**Location Type:**
- store
- kiosk
- warehouse
- office

**Payment Method:**
- cash
- card
- online
- cod
- other

**Payment Status:**
- pending
- paid
- failed
- refunded
- partially_refunded

**Sale Status:**
- pending
- completed
- cancelled
- refunded

**Report Type:**
- sales
- inventory
- customer
- financial
- custom

**Report Format:**
- pdf
- excel
- csv
- json

**Backup Type:**
- full
- incremental
- data_export

## Sample Data

### Default Roles
- super_admin: Full system access
- admin: Company administrator
- manager: Store manager
- cashier: Point of sale operator

### Default Permissions
```json
{
  "super_admin": {
    "users": { "create": true, "read": true, "update": true, "delete": true },
    "companies": { "create": true, "read": true, "update": true, "delete": true },
    "roles": { "create": true, "read": true, "update": true, "delete": true },
    "products": { "create": true, "read": true, "update": true, "delete": true },
    "locations": { "create": true, "read": true, "update": true, "delete": true },
    "sales": { "create": true, "read": true, "update": true, "delete": true },
    "reports": { "create": true, "read": true, "update": true, "delete": true },
    "backups": { "create": true, "read": true, "update": true, "delete": true }
  },
  "admin": {
    "users": { "create": true, "read": true, "update": true, "delete": false },
    "products": { "create": true, "read": true, "update": true, "delete": true },
    "locations": { "create": true, "read": true, "update": true, "delete": true },
    "sales": { "create": true, "read": true, "update": true, "delete": true },
    "reports": { "create": true, "read": true, "update": true, "delete": true },
    "backups": { "create": true, "read": true, "update": false, "delete": false }
  },
  "cashier": {
    "products": { "create": false, "read": true, "update": false, "delete": false },
    "locations": { "create": false, "read": true, "update": false, "delete": false },
    "sales": { "create": true, "read": true, "update": false, "delete": false }
  }
}
```
