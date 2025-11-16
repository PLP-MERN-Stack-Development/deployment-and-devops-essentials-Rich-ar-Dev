# Backend Deployment Guide - Railway

## Prerequisites
- GitHub account
- Railway account connected to GitHub
- MongoDB Atlas database

## Deployment Steps

### 1. Connect Repository to Railway
1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your task manager repository
5. Select the `main` branch

### 2. Configure Backend Settings
1. In your Railway project, go to "Settings"
2. Set the **Root Directory** to `backend`
3. Set the **Build Command** to `npm install`
4. Set the **Start Command** to `npm start`

### 3. Configure Environment Variables
Add these environment variables in Railway Dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your JWT secret key |
| `CLIENT_URL` | Your frontend Vercel URL |

### 4. Deploy
1. Railway will automatically deploy when you push to main
2. Monitor deployment in the "Deployments" tab
3. Get your backend URL from the "Domains" section

### 5. Verify Deployment
```bash
# Test your deployed backend
curl https://your-backend-url.railway.app/health