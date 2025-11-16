


```markdown
# Frontend Deployment Guide - Vercel

## Prerequisites
- GitHub account
- Vercel account connected to GitHub

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select your task manager repository

### 2. Configure Frontend Settings
1. Set the **Framework Preset** to `Create React App`
2. Set the **Root Directory** to `frontend`
3. Set the **Build Command** to `npm run build`
4. Set the **Output Directory** to `build`

### 3. Configure Environment Variables
Add these environment variables in Vercel:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | Your Railway backend URL |
| `GENERATE_SOURCEMAP` | `false` (for production) |

### 4. Deploy
1. Vercel will automatically deploy when you push to main
2. Monitor deployment in the Vercel dashboard
3. Get your frontend URL from the project overview

### 5. Verify Deployment
1. Visit your Vercel URL
2. Test user registration and login
3. Verify tasks are saved to the database

## Custom Domain (Optional)
1. Go to "Domains" in your Vercel project
2. Add your custom domain
3. Configure DNS settings as instructed