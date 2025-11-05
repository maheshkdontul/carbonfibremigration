# Vercel Deployment Guide for CFMS

This guide will walk you through deploying the CFMS application to Vercel.

## Prerequisites

1. **GitHub Account** - Your code must be pushed to a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Supabase Project** - Your Supabase project should be set up and running

## Step 1: Push Latest Code to GitHub

Make sure all your latest changes are pushed to GitHub:

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Add Vercel deployment configuration"

# Push to GitHub
git push origin master
```

**Note:** Your repository is at: `https://github.com/maheshkdontul/Cursor-course.git`

## Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended - easier to connect repos)
4. Authorize Vercel to access your GitHub account

## Step 3: Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"Cursor-course"** (or your repo name)
4. Click **"Import"** next to it

## Step 4: Configure Project Settings

Vercel will auto-detect your project settings. Verify these:

### Framework Preset
- **Framework Preset:** Vite
- Vercel should auto-detect this

### Build and Output Settings
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (Vercel will auto-detect)
- **Output Directory:** `dist` (Vercel will auto-detect)
- **Install Command:** `npm install` (Vercel will auto-detect)

### Environment Variables

**IMPORTANT:** Add your Supabase credentials:

1. Click **"Environment Variables"** section
2. Add these two variables:

   **Variable 1:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase project URL
     - Example: `https://xxxxxxxxxxxxx.supabase.co`
     - Get this from your Supabase project settings → API

   **Variable 2:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anonymous key
     - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - Get this from your Supabase project settings → API

3. Make sure to add these for **all environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Advanced Settings (Optional)

You can leave these as default:
- **Node.js Version:** 18.x or higher (Vercel auto-detects)

## Step 5: Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies
   - Build your application
   - Deploy to production
3. This process takes 1-3 minutes

## Step 6: Verify Deployment

1. After deployment completes, you'll see a success message
2. Click on the deployment URL (e.g., `https://your-project.vercel.app`)
3. Your application should load!

### Test Your Application

1. **Dashboard** - Should load with KPIs from Supabase
2. **Assets & Locations** - Should display data from database
3. **Navigation** - All links should work
4. **Reports** - Should generate reports correctly

### Check Browser Console

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. If you see Supabase connection errors, verify environment variables

## Step 7: Update CORS Settings in Supabase

If you get CORS errors from Supabase:

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Under **"CORS Configuration"**, add your Vercel domain:
   - `https://your-project.vercel.app`
   - `https://*.vercel.app` (for preview deployments)

## Troubleshooting

### Issue: Build Fails

**Error:** `Cannot find module` or `TypeScript errors`

**Solution:**
1. Check that all dependencies are in `package.json`
2. Check Vercel build logs for specific errors
3. Verify `package.json` has all required dependencies

### Issue: Environment Variables Not Working

**Error:** Supabase connection fails in production

**Solution:**
1. Verify environment variables are set correctly in Vercel
2. Make sure variable names match exactly (case-sensitive):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy after adding/changing variables

### Issue: Blank Page or 404 Errors

**Error:** Page loads but shows blank or 404

**Solution:**
1. Check Vercel build logs
2. Verify `dist` folder is being created
3. Ensure `vercel.json` is in the root directory
4. Check that React Router is configured correctly

### Issue: Routing Not Working

**Error:** Direct URLs show 404

**Solution:**
- The `vercel.json` file has been created in your project root
- It contains the rewrite rule for SPA routing
- Make sure it's committed and pushed to GitHub

## Environment Variables Reference

### Required Variables

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Settings → API |

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Production:** Deploys from `master` or `main` branch
- **Preview:** Deploys from other branches (feature branches, PRs)

### How to Update After Deployment

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin master
   ```
3. **Vercel automatically:**
   - Detects the push
   - Starts a new build
   - Deploys the updated version

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain (e.g., `cfms.yourcompany.com`)
4. Follow DNS configuration instructions

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Dashboard displays data from Supabase
- [ ] All navigation links work
- [ ] Reports page loads and exports work
- [ ] CSV upload works (if tested)
- [ ] No console errors in browser
- [ ] Environment variables are set correctly
- [ ] CORS is configured in Supabase (if needed)

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use environment variables** - Always use Vercel's environment variable system
3. **Supabase RLS** - Ensure Row Level Security is enabled in Supabase
4. **HTTPS** - Vercel automatically provides HTTPS

## Getting Help

If you encounter issues:

1. **Check Vercel Build Logs** - Click on the deployment to see logs
2. **Check Browser Console** - Look for runtime errors
3. **Verify Supabase Connection** - Test locally first
4. **Vercel Documentation** - [vercel.com/docs](https://vercel.com/docs)

## Quick Reference

### Vercel Dashboard
- **URL:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Documentation:** [vercel.com/docs](https://vercel.com/docs)

### Your Project
- **GitHub Repo:** `https://github.com/maheshkdontul/Cursor-course.git`
- **Local Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Vercel Config:** `vercel.json` (already created)

## Summary

Deploying to Vercel is straightforward:

1. ✅ Push code to GitHub (with `vercel.json`)
2. ✅ Sign up for Vercel
3. ✅ Import your GitHub repository
4. ✅ Add environment variables (Supabase credentials)
5. ✅ Deploy!

Your application will be live at: `https://your-project-name.vercel.app`

---

**Next Steps:**
1. Commit and push the `vercel.json` file
2. Follow the steps above to deploy
3. Add your Supabase environment variables in Vercel
4. Test your deployed application

