# Cleaning App - Backend API

Professional cleaning management system backend built with Next.js 15 and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd cleaning-app-backend
npm install
```

### Run Modes

הוראות מלאות ל-`dev` ו-`production` נמצאות ב-`מצבי הרצה (Dev / Production)` בהמשך.

## מצבי הרצה (Dev / Production)

המערכת תומכת בשתי סביבות, וה-CORS מוגדר ב-`next.config.ts` בהתאם לסביבה.

### Dev (פיתוח מקומי)
מפעילים את ה-API במצב פיתוח:
```bash
cd cleaning-app-backend
npm run dev
```

לאחר מכן ה-API זמין ב-`http://localhost:3001/api`.

במצב זה ה-CORS משתמש בסט "dev" כדי שפעולות מה-frontend המקומי יעבדו חלק.

### Production (פרודקשן)
מפעילים את ה-API במצב פרודקשן:
```bash
cd cleaning-app-backend
npm run build
npm start
```

ה-API עדיין זמין ב-`http://localhost:3001/api` מקומית.

במצב זה ה-CORS מכוון לאוריג׳ין של הפרודקשן:
`https://apartment-app-kohl.vercel.app`

חשוב: אם תריץ את ה-frontend על `localhost` מול ה-API ב-production, ייתכן שהדפדפן יחסום בגלל Origin שלא תואם. בפרודקשן אמיתי (Vercel) האוריג׳ין תואם ואז זה עובד.

ב-Vercel:
- ב-`production` יופעל הסט של ה-CORS לפרודקשן.
- ב-`preview` יופעל הסט של ה-CORS ל-dev כדי למנוע בעיות CORS בפריוויו.

## 📁 Project Structure

```
cleaning-app-backend/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication
│   │   │   └── login/
│   │   ├── apartments/        # Apartment data
│   │   ├── work-sessions/     # Work session management
│   │   ├── tasks/             # Task tracking
│   │   ├── inventory/         # Inventory logging
│   │   ├── issues/            # Issue reporting
│   │   └── reports/           # Work summaries
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── storage.ts             # JSON file storage layer
│   └── auth.ts                # JWT authentication utilities
├── data/                      # JSON data files (auto-created)
│   ├── workers.json
│   ├── work-sessions.json
│   ├── inventory-logs.json
│   └── issues.json
└── next.config.ts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Worker login with access code

### Apartments
- `GET /api/apartments` - Get all apartments

### Work Sessions
- `POST /api/work-sessions` - Start new work session (requires auth)
- `GET /api/work-sessions` - Get worker's work sessions (requires auth)
- `PUT /api/work-sessions` - End work session (requires auth)
- `GET /api/work-sessions/[id]` - Get specific work session (requires auth)

### Tasks
- `GET /api/tasks` - Get all task categories
- `POST /api/tasks` - Mark task as completed (requires auth)

### Inventory
- `POST /api/inventory` - Log inventory usage (requires auth)
- `GET /api/inventory?workSessionId=xxx` - Get inventory logs (requires auth)

### Issues
- `POST /api/issues` - Report an issue (requires auth)
- `GET /api/issues?workSessionId=xxx` - Get issues (requires auth)

### Reports
- `GET /api/reports?workSessionId=xxx` - Get work summary (requires auth)

## 🔐 Authentication

API uses JWT tokens. Include in requests:

```
Authorization: Bearer <token>
```

### Valid Access Codes (Demo)
- `עובדת1234`
- `ניקיון2024`
- `test`
- `1234`

## 💾 Data Storage

Currently uses JSON file storage in `data/` directory for simplicity.

- Local development: reads/writes `cleaning-app-backend/data/`
- Vercel: reads seed data from bundled files, writes runtime changes to `/tmp/cleaning-app-data`
- You can override the storage path with `DATA_DIR=/your/path`

> Note: `/tmp` on serverless is ephemeral and not shared across instances. For durable production data, move storage to a database.

### Migrate to Database

To upgrade to PostgreSQL/MongoDB:
1. Install database client
2. Update `lib/storage.ts` to use database queries
3. Keep the same interface for minimal code changes

## 🔧 Configuration

### CORS
Configured in `next.config.ts` with environment-specific headers:
- Dev (local `next dev`): allows local origins via `Access-Control-Allow-Origin: *` (plus dev headers).
- Production (Vercel `production`): allows only `https://apartment-app-kohl.vercel.app`.

### JWT Secret
Default: `cleaning-app-secret-key-change-in-production`

**⚠️ Important:** Set environment variable for production:

```bash
JWT_SECRET=your-secure-secret-key
```

## 📝 Environment Variables

Create `.env.local`:

```env
JWT_SECRET=your-secure-secret-key
NODE_ENV=development
```

## 🧪 Testing

```bash
# Test auth endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Worker","code":"test"}'

# Test apartments (no auth)
curl http://localhost:3001/api/apartments

# Test work session (with auth)
curl http://localhost:3001/api/work-sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 API Response Format

All endpoints return consistent JSON:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
```

## 🛠️ Development

### Adding New Endpoints
1. Create route file in `app/api/[route-name]/route.ts`
2. Export async functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use types from `lib/types.ts`
4. Use storage from `lib/storage.ts`
5. Add auth with `authenticateRequest()` for protected routes

## 📦 Dependencies

- **next** - Web framework
- **react** & **react-dom** - Required by Next.js
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing (for future use)
- **uuid** - Generate unique IDs
- **multer** - File uploads (for future use)

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Traditional Server
```bash
npm run build
PORT=3001 npm start
```

## 📄 License

ISC

## 👥 Support

For issues or questions, contact the development team.
