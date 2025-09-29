# Deployment Guide

## Overview

This guide covers deploying the POS System to various environments, from development to production.

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- Git
- PM2 (for production)
- Nginx (for production)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd POS-System
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=pos_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Shopify Integration (Optional)
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_ACCESS_TOKEN=your_access_token
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SOCKET_URL=http://localhost:3001
```

### 4. Database Setup

```bash
# Create database
createdb pos_system

# Run migrations
cd backend
npm run migrate

# Seed database with initial data
npm run seed
```

## Development Deployment

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api-docs

## Production Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Install PM2

```bash
npm install -g pm2
```

### 3. Create PM2 Ecosystem File

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'pos-backend',
      script: './backend/src/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ]
};
```

### 4. Start Application with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/pos-system`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        root /path/to/POS-System/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/pos-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Docker Deployment

### 1. Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Create Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: pos_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DB_NAME: pos_system
    depends_on:
      - postgres
    ports:
      - "3001:3001"
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. Deploy with Docker

```bash
docker-compose up -d
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database username | postgres |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | pos_system |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | JWT expiry time | 24h |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| PORT | Server port | 8000 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL | http://localhost:8080 |
| CORS_ORIGIN | CORS origin | http://localhost:8080 |
| SHOPIFY_SHOP_DOMAIN | Shopify shop domain | - |
| SHOPIFY_API_KEY | Shopify API key | - |
| SHOPIFY_API_SECRET | Shopify API secret | - |
| SHOPIFY_ACCESS_TOKEN | Shopify access token | - |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8000 |
| REACT_APP_SOCKET_URL | WebSocket URL | http://localhost:8000 |

## Monitoring and Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart application
pm2 restart pos-backend

# Stop application
pm2 stop pos-backend
```

### 2. Log Files

Logs are stored in the `logs/` directory:
- `backend-error.log` - Backend error logs
- `backend-out.log` - Backend output logs
- `backend-combined.log` - Combined logs

### 3. Health Checks

The application provides health check endpoints:
- Backend: `GET /health`
- Database connection status
- Memory usage
- Environment information

## Backup and Recovery

### 1. Database Backup

```bash
# Create backup
pg_dump -h localhost -U postgres pos_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U postgres pos_system < backup_file.sql
```

### 2. Application Backup

```bash
# Backup application files
tar -czf pos_system_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/POS-System

# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/POS-System/uploads
```

## Security Considerations

### 1. SSL/TLS

- Use Let's Encrypt for free SSL certificates
- Configure strong SSL ciphers
- Enable HSTS headers

### 2. Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Database Security

- Use strong passwords
- Limit database access to application servers
- Enable SSL for database connections
- Regular security updates

### 4. Application Security

- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting
- Enable CORS properly
- Use helmet for security headers

## Scaling

### 1. Horizontal Scaling

- Use load balancer (Nginx, HAProxy)
- Multiple backend instances
- Database read replicas
- CDN for static assets

### 2. Vertical Scaling

- Increase server resources
- Optimize database queries
- Use caching (Redis)
- Compress responses

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database credentials
   - Verify database is running
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiry settings
   - Clear browser cookies

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Check disk space

4. **WebSocket Connection Issues**
   - Check proxy configuration
   - Verify CORS settings
   - Check firewall rules

### Log Analysis

```bash
# View application logs
pm2 logs pos-backend --lines 100

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx -f
```
