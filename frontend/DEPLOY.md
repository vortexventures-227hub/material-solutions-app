# Material Solutions - Frontend Deployment Guide

## Prerequisites

- GitHub account connected to the `material-solutions-app` repository
- Vercel account (free tier is sufficient)
- Railway backend deployed (see backend README for Railway deployment)

## Quick Deploy

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `your-github/material-solutions-app`
4. For "Framework Preset", select: **Create React App**
5. Click "Deploy"

### 2. Configure Environment Variables

In the Vercel project settings, add:

| Variable Name | Value |
|---------------|-------|
| `REACT_APP_API_URL` | `https://your-railway-backend-url.up.railway.app` |

**To find your Railway URL:**
1. Go to [railway.app](https://railway.app)
2. Select your project
3. Click on the backend service
4. Copy the URL from the "Networking" section (e.g., `https://material-solutions-backend.up.railway.app`)

### 3. Deploy

Vercel will automatically deploy on every push to `main`.

---

## Manual Deployment (CLI)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
cd frontend
vercel

# Deploy to production
vercel --prod
```

---

## Build Settings

These are automatically configured for Create React App:

| Setting | Value |
|---------|-------|
| Framework | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |

---

## Post-Deployment Checklist

- [ ] Test login flow
- [ ] Verify inventory list loads
- [ ] Test mobile view (toggle device toolbar in DevTools)
- [ ] Check browser console for errors
- [ ] Test adding new inventory item
- [ ] Verify toast notifications appear

---

## Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your domain (e.g., `app.materialsolutionsnj.com`)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to provision (usually ~5 minutes)

---

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
- `ALLOWED_ORIGINS` in Railway includes your Vercel URL (e.g., `https://app.materialsolutionsnj.com`)
- Backend is running on Railway (check Railway dashboard)

### 401 Unauthorized
If API calls return 401:
1. Clear browser cookies and localStorage
2. Log in again
3. If persists, check JWT_SECRET matches between Railway env and backend

### Build Fails
Check that `REACT_APP_API_URL` is set in Vercel environment variables.

---

## Bundle Size

Current production build (gzipped):
- **Main JS**: ~86 KB
- **Total JS**: ~142 KB
- **CSS**: ~12 KB

This is within acceptable limits for a full-featured React application.

---

## Performance Tips

1. **Images**: Use WebP format for any uploaded images
2. **Lazy Loading**: Routes are lazy-loaded by default with `React.lazy()`
3. **Code Splitting**: Heavy components (charts, etc.) can be further split
