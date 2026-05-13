# KazDispatch - TMS Platform for Kazakhstan
# Backend Documentation

## 🚀 Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
./start.sh

# 3. Backend API will be available at http://localhost:3000
# 4. Frontend will be available at http://localhost:5173
# 5. MinIO Console at http://localhost:9001
```

## 📋 Project Structure

```
TMS/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── companies/         # Company management
│   │   ├── drivers/           # Driver management
│   │   ├── vehicles/          # Vehicle management
│   │   ├── orders/            # Order management
│   │   ├── uploads/           # File upload handler
│   │   ├── notifications/     # Notifications & SMS
│   │   ├── reports/           # Reports & Analytics
│   │   ├── common/            # Guards, Filters, Pipes
│   │   ├── app.module.ts      # Main module
│   │   └── main.ts            # Entry point
│   ├── test/                  # Unit tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── pages/             # Pages
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand store
│   │   ├── styles/            # TailwindCSS styles
│   │   ├── locales/           # i18n translations
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   └── postgres/
│       └── init.sql
│
├── docker-compose.yml         # All services orchestration
├── .env.example               # Environment template
├── start.sh                   # Quick start script
└── README.md                  # This file

```

## 🏗️ Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Frontend | React 18 + TypeScript |
| UI Framework | TailwindCSS + shadcn/ui |
| Maps | Yandex Maps API |
| Real-time | Socket.io (WebSocket) |
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx |

### Services

1. **PostgreSQL** - Primary database (port 5432)
2. **Redis** - Cache & session store (port 6379)
3. **MinIO** - S3-compatible file storage (ports 9000, 9001)
4. **Backend API** - NestJS application (port 3000)
5. **Frontend** - React Vite app (port 5173)
6. **Nginx** - Reverse proxy & load balancer (ports 80, 443)

## 🔑 Default Credentials

```
PostgreSQL:
  User: kazdispatch
  Password: SecurePassword123!
  Database: kazdispatch_db

Redis:
  Password: RedisPass123!

MinIO:
  User: minioadmin
  Password: minioadmin123!

JWT Secret: your-super-secret-jwt-key-change-in-production-now-now
```

## 📍 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST   /api/auth/register              - Register company
POST   /api/auth/login                 - Login with email/phone
POST   /api/auth/send-otp              - Send OTP to phone
POST   /api/auth/verify-otp            - Verify OTP
POST   /api/auth/refresh               - Refresh JWT token
POST   /api/auth/logout                - Logout (revoke token)
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password        - Reset password with token
```

### User Management
```
GET    /api/users                      - List users in company
GET    /api/users/:id                  - Get user profile
PUT    /api/users/:id                  - Update user profile
DELETE /api/users/:id                  - Deactivate user
```

### Drivers
```
GET    /api/drivers                    - List drivers
POST   /api/drivers                    - Create driver
GET    /api/drivers/:id                - Get driver details
PUT    /api/drivers/:id                - Update driver
DELETE /api/drivers/:id                - Deactivate driver
POST   /api/drivers/:id/document       - Upload driver document
GET    /api/drivers/:id/trips          - Get driver trip history
```

### Vehicles
```
GET    /api/vehicles                   - List vehicles
POST   /api/vehicles                   - Create vehicle
GET    /api/vehicles/:id               - Get vehicle details
PUT    /api/vehicles/:id               - Update vehicle
DELETE /api/vehicles/:id               - Deactivate vehicle
POST   /api/vehicles/:id/document      - Upload vehicle document
```

### Orders/Trips
```
GET    /api/orders                     - List orders (with filters)
POST   /api/orders                     - Create order
GET    /api/orders/:id                 - Get order details
PUT    /api/orders/:id/status          - Update order status
POST   /api/orders/:id/assign          - Assign driver & vehicle
GET    /api/orders/:id/track           - Real-time tracking
POST   /api/orders/:id/location        - Update GPS location
POST   /api/orders/:id/photo           - Upload cargo photo
GET    /api/orders/:id/history         - Get status history
```

### File Uploads
```
POST   /api/uploads/presigned-url      - Get S3 presigned URL
POST   /api/uploads/confirm            - Confirm upload completion
DELETE /api/uploads/:fileId            - Delete uploaded file
```

### Reports & Analytics
```
GET    /api/reports/summary            - Dashboard summary stats
GET    /api/reports/orders             - Orders report with filters
GET    /api/reports/drivers            - Driver performance report
GET    /api/reports/vehicles           - Vehicle utilization report
GET    /api/reports/revenue            - Revenue analytics
```

## 🔐 Security Features

- ✅ JWT authentication (access + refresh tokens)
- ✅ Rate limiting (API & auth endpoints)
- ✅ Input validation (class-validator)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Audit logging (all data changes)
- ✅ File validation (type & size checks)
- ✅ RBAC (Role-Based Access Control)

## 📱 User Roles

1. **SUPER_ADMIN** - Platform administrator
2. **COMPANY_ADMIN** - Company owner/manager
3. **DISPATCHER** - Order dispatcher
4. **DRIVER** - Delivery driver
5. **CLIENT** - Order creator/customer

## 🌍 Localization

- 🇷🇺 Russian (по умолчанию)
- 🇰🇿 Kazakh

Switch language in settings or use header: `Accept-Language: kk` or `Accept-Language: ru`

## 📊 Database Schema

### Core Tables

1. **users** - System users with roles and permissions
2. **companies** - Transport companies (with БИН validation)
3. **drivers** - Drivers with ИИН, licenses, and documents
4. **vehicles** - Vehicles with VIN, registration, and documents
5. **orders** - Transport orders with status tracking
6. **order_status_log** - Order status history with GPS coordinates
7. **documents** - ТТН, acts, contracts (PDF storage in S3)
8. **photos** - Vehicle/driver/cargo photos (stored in MinIO)
9. **notifications** - Push/SMS notifications with delivery status
10. **audit_log** - Complete audit trail of all system changes

## 🚀 Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Kubernetes (future)
```bash
kubectl apply -f k8s/
```

### Environment Variables

See `.env.example` for all available configurations.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📞 SMS Integration

### Supported Providers

1. **Beeline KZ** - API for SMS delivery
2. **Kcell KZ** - Alternative SMS provider

Configuration in `.env`:
```
SMS_PROVIDER=beeline
BEELINE_API_KEY=your_key_here
```

## 📝 Documentation

- Swagger API docs: `http://localhost:3000/api/docs`
- Frontend Storybook (future): `http://localhost:6006`

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/awesome-feature`
2. Commit changes: `git commit -m 'Add awesome feature'`
3. Push branch: `git push origin feature/awesome-feature`
4. Create Pull Request

## 📄 License

MIT License - See LICENSE file

## 📧 Support

For issues or questions, please contact: support@kazdispatch.kz

---

**Made for Kazakhstan logistics market with ❤️**
