# 🏠 Professional Cleaning Management App

Full-stack professional cleaning management system with Angular frontend and Next.js backend.

## 📋 Project Overview

This application was converted from a single HTML/JS file into a modern, scalable full-stack application with:

- **Frontend**: Angular 19 with standalone components
- **Backend**: Next.js 15 with App Router API
- **Features**: Worker authentication, work tracking, task management, inventory logging, issue reporting

## 🏗️ Architecture

```
appartment/
├── cleaning-app-frontend/     # Angular application (port 4200)
│   ├── src/app/               # Components, services, guards
│   ├── src/assets/            # Static assets
│   └── package.json
│
├── cleaning-app-backend/      # Next.js API (port 3001)
│   ├── app/api/               # API routes
│   ├── lib/                   # Utilities & types
│   ├── data/                  # JSON storage (auto-created)
│   └── package.json
│
└── אפליקציית ניקיון מקצועית.html  # Original HTML/JS app
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd cleaning-app-backend
npm install

# Frontend (in new terminal)
cd cleaning-app-frontend
npm install
```

### 2. Start Development Servers

```bash
# Backend (Terminal 1)
cd cleaning-app-backend
npm run dev
# Runs on http://localhost:3001

# Frontend (Terminal 2)
cd cleaning-app-frontend
npm start
# Runs on http://localhost:4200
```

### 3. Access the App

Open browser to: **http://localhost:4200**

### 4. Login Credentials

Use any name with one of these access codes:
- `עובדת1234`
- `ניקיון2024`
- `test`
- `1234`

## ✨ Features

### 🔐 Authentication
- Worker login with access codes
- JWT token-based authentication
- Auto-redirect to login when unauthorized

### 🏡 Apartment Management
- Select from 6 apartments (דירה 6-11)
- Special badges for new/special apartments
- Visual grid layout with icons

### ⏱️ Work Tracking
- Start/stop work sessions
- Real-time timer display
- GPS location tracking
- Work history

### ✅ Task Checklist
6 comprehensive categories with 30 tasks:
1. סריקה ראשונית (Initial Scan)
2. מטבח (Kitchen)
3. חדרי שינה וסלון (Bedrooms & Living Room)
4. חדרי רחצה (Bathrooms)
5. ריצוף וחללים (Flooring & Spaces)
6. בדיקה סופית (Final Check)

### 📦 Inventory Management
- Log cleaning supplies usage
- Track quantities per task
- View inventory history

### 🛠️ Issue Reporting
- Report problems during cleaning
- Categories: maintenance, cleaning, supplies, safety, other
- Image upload support
- Issue history tracking

### 📊 Work Summary
- Session duration
- Tasks completed
- Inventory used
- Issues reported
- Complete work report

### 🌍 Multi-Language
- Hebrew (RTL) - Primary
- English (LTR)
- Dynamic language switching

## 📱 Mobile Support

- Mobile-first responsive design
- Touch-optimized controls
- PWA-ready (can be installed on devices)
- Works offline (future enhancement)

## 🎨 UI/UX

- **Theme**: Purple gradient (#667eea → #764ba2)
- **Design**: Material Design inspired
- **Animations**: Smooth transitions and micro-interactions
- **RTL Support**: Full right-to-left for Hebrew
- **Accessibility**: ARIA labels, keyboard navigation

## 🔧 Technology Stack

### Frontend
- **Framework**: Angular 19
- **Language**: TypeScript 5.7
- **State Management**: Services + RxJS
- **HTTP**: HttpClient with interceptors
- **Routing**: Angular Router with guards
- **Forms**: Reactive Forms

### Backend
- **Framework**: Next.js 15
- **Language**: TypeScript 5.7
- **API**: RESTful with App Router
- **Auth**: JWT (jsonwebtoken)
- **Storage**: JSON files (upgradeable to database)
- **File Upload**: Multer (configured)

## 📂 Project Structure Details

### Frontend Structure
```
src/app/
├── components/           # All UI components
│   ├── login/
│   ├── main/
│   ├── apartment-selection/
│   ├── work-tracking/
│   ├── task-checklist/
│   ├── inventory/
│   ├── issues/
│   └── summary/
├── services/            # Business logic
│   ├── api.service.ts
│   ├── auth.service.ts
│   ├── work.service.ts
│   └── translation.service.ts
├── guards/              # Route protection
│   └── auth.guard.ts
├── interceptors/        # HTTP interceptors
│   └── auth.interceptor.ts
├── models/              # TypeScript interfaces
│   └── types.ts
└── app.routes.ts        # Routing configuration
```

### Backend Structure
```
app/api/
├── auth/login/          # Authentication
├── apartments/          # Apartment data
├── work-sessions/       # Work tracking
├── tasks/               # Task management
├── inventory/           # Inventory logging
├── issues/              # Issue reporting
└── reports/             # Work summaries

lib/
├── types.ts             # Shared interfaces
├── storage.ts           # Data persistence
└── auth.ts              # JWT utilities
```

## 🔌 API Documentation

See [Backend README](./cleaning-app-backend/README.md) for complete API documentation.

**Base URL**: `http://localhost:3001/api`

**Authentication**: Bearer token in `Authorization` header

## 🧪 Testing

### Test Backend
```bash
cd cleaning-app-backend
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","code":"test"}'
```

### Test Frontend
1. Open http://localhost:4200
2. Login with name "Test" and code "test"
3. Select apartment
4. Start work session
5. Complete tasks
6. View summary

## 📈 Future Enhancements

### Planned Features
- [ ] PostgreSQL/MongoDB integration
- [ ] Admin dashboard
- [ ] Real-time notifications
- [ ] Analytics and reports
- [ ] Multi-worker coordination
- [ ] Offline PWA support
- [ ] Image optimization for issues
- [ ] Barcode scanning for inventory
- [ ] Automated scheduling
- [ ] Performance reviews

### Database Migration
Current JSON storage can easily migrate to:
- **PostgreSQL** - Recommended for production
- **MongoDB** - Alternative NoSQL option
- **MySQL** - Traditional SQL option

Update `lib/storage.ts` to use database queries while keeping the same interface.

## 🚢 Deployment

### Frontend (Angular)
```bash
cd cleaning-app-frontend
npm run build
# Deploy dist/ folder to:
# - Netlify
# - Vercel
# - Firebase Hosting
# - AWS S3 + CloudFront
```

### Backend (Next.js)
```bash
cd cleaning-app-backend
npm run build
# Deploy to:
# - Vercel (recommended)
# - Railway
# - Heroku
# - AWS EC2/ECS
# - DigitalOcean App Platform
```

### Environment Variables
Create `.env.production` in backend:
```env
JWT_SECRET=your-production-secret-key
NODE_ENV=production
DATABASE_URL=your-database-url  # when migrating from JSON
```

## 🔐 Security

### Current Implementation
- ✅ JWT authentication
- ✅ CORS configured
- ✅ Input validation
- ✅ Error handling

### Production Recommendations
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Use environment variables for secrets
- [ ] Implement refresh tokens
- [ ] Add audit logging
- [ ] Enable CSRF protection
- [ ] Implement file upload limits
- [ ] Add API versioning

## 📝 Development Guidelines

### Adding New Features

#### Backend
1. Add types to `lib/types.ts`
2. Create API route in `app/api/`
3. Use `authenticateRequest()` for auth
4. Use storage layer from `lib/storage.ts`
5. Update README with new endpoint

#### Frontend
1. Add component in `src/app/components/`
2. Create service method in relevant service
3. Add route in `app.routes.ts`
4. Update translations if needed
5. Add navigation link

### Code Style
- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting (recommended)
- Conventional commits

## 🐛 Troubleshooting

### Backend won't start
```bash
cd cleaning-app-backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend won't start
```bash
cd cleaning-app-frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### CORS errors
Check `next.config.ts` - ensure frontend URL is allowed

### Auth token expired
Clear localStorage and login again

### Port already in use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 4200 (frontend)
npx kill-port 4200
```

## 📖 Documentation

- [Backend README](./cleaning-app-backend/README.md)
- [Frontend README](./cleaning-app-frontend/README.md)
- [Frontend Setup Guide](./cleaning-app-frontend/SETUP-GUIDE.md)
- [Frontend Architecture](./cleaning-app-frontend/ARCHITECTURE.md)
- [API Documentation](./cleaning-app-backend/README.md#api-endpoints)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

ISC

## 👨‍💻 Authors

Converted from HTML/JS to Angular + Next.js full-stack application.

## 🙏 Acknowledgments

- Original HTML/JS cleaning app
- Angular team for amazing framework
- Next.js team for powerful backend framework
- All contributors and testers
