# Vercel Deployment Guide

## Deploying to Vercel (Both Projects)

### Prerequisites
1. Push code to GitHub (complete the git push first)
2. Create Vercel account: https://vercel.com/signup

---

## 🔧 Backend Deployment (Next.js)

### Step 1: Import Project to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository: `shimondadon/apartment-app-next`
4. Click "Import"

### Step 2: Configure Backend
- **Framework Preset**: Next.js
- **Root Directory**: `cleaning-app-backend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add these in Vercel dashboard:
```
JWT_SECRET=your-super-secret-key-here-change-this
NODE_ENV=production
```

### Step 4: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your backend will be at: `https://your-project-name.vercel.app`

**Important:** Copy your backend URL (e.g., `https://cleaning-api.vercel.app`)

---

## 🎨 Frontend Deployment (Angular)

### Step 1: Update API URL
Before deploying, update the frontend to use your production backend URL:

Edit `cleaning-app-frontend/src/app/services/api.service.ts`:
```typescript
// Change this line:
private baseUrl = 'http://localhost:3001/api';

// To your production URL:
private baseUrl = 'https://your-backend-url.vercel.app/api';
```

Commit and push this change:
```bash
cd C:\Users\sdadon\Desktop\appartment
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Step 2: Create vercel.json for Angular
Create `cleaning-app-frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/cleaning-app-frontend/browser",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 3: Import Frontend to Vercel
1. Go to https://vercel.com/new again
2. Click "Import Git Repository"
3. Select your repository: `shimondadon/apartment-app-next`
4. Click "Import"

### Step 4: Configure Frontend
- **Framework Preset**: Other
- **Root Directory**: `cleaning-app-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist/cleaning-app-frontend/browser`
- **Install Command**: `npm install`

### Step 5: Deploy
- Click "Deploy"
- Wait 3-5 minutes
- Your frontend will be at: `https://your-frontend-name.vercel.app`

---

## 🔗 Alternative: Deploy as Monorepo

If you want both projects under one Vercel account, you can:

1. **Deploy Backend First**
   - Set Root Directory: `cleaning-app-backend`
   - Get the backend URL

2. **Deploy Frontend Second**
   - Create a new project in Vercel
   - Set Root Directory: `cleaning-app-frontend`
   - Update API URL to point to backend

---

## ⚡ Quick Deploy (CLI Method)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Backend
```bash
cd C:\Users\sdadon\Desktop\appartment\cleaning-app-backend
vercel
# Follow prompts
```

### Deploy Frontend
```bash
cd C:\Users\sdadon\Desktop\appartment\cleaning-app-frontend
vercel
# Follow prompts
```

---

## 🔧 Post-Deployment Steps

### 1. Update Backend CORS
After deploying frontend, update `cleaning-app-backend/next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-frontend-url.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' }
        ],
      },
    ];
  },
};
```

### 2. Test the App
1. Visit your frontend URL
2. Try logging in with: name "Test" and code "test"
3. Test all features

---

## 📱 Custom Domains (Optional)

### Add Custom Domain
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your domain
5. Update DNS records as shown

---

## 🐛 Troubleshooting

### Backend 500 Errors
- Check Vercel logs in dashboard
- Ensure JWT_SECRET is set
- Check function logs for errors

### Frontend Can't Connect to Backend
- Verify API URL is correct in `api.service.ts`
- Check CORS settings in backend
- Ensure backend is deployed and running

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Review build logs in Vercel dashboard

---

## 🎯 Expected URLs After Deployment

**Backend API**: `https://cleaning-api-xxx.vercel.app`
- Test: `https://cleaning-api-xxx.vercel.app/api/apartments`

**Frontend App**: `https://cleaning-app-xxx.vercel.app`
- Login page should load
- Should be able to login and use all features

---

## 💡 Tips

1. **Free Tier**: Vercel free tier includes:
   - 100 GB bandwidth
   - Unlimited deployments
   - Automatic HTTPS
   - Perfect for this app!

2. **Auto Deploy**: Every git push to main will auto-deploy

3. **Preview Deployments**: Pull requests get preview URLs

4. **Environment Variables**: Different for preview/production

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check deployment logs in Vercel dashboard
