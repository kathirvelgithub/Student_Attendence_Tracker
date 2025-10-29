# Vercel Deployment Guide

## 🚀 Deploy Frontend to Vercel

### Prerequisites
- GitHub repository pushed with latest code
- Vercel account connected to GitHub
- Backend API running at: https://student-attendence-tracker.onrender.com

---

## 📋 Step 1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Student_Attendence_Tracker`
4. Select **Root Directory:** `Frontend`

---

## ⚙️ Step 2: Configure Build Settings

**Framework Preset:** Vite (should auto-detect)

**Build & Development Settings:**
```
Build Command:       npm run build
Output Directory:    dist
Install Command:     npm install
Development Command: npm run dev
```

**Root Directory:** `Frontend`

**Node.js Version:** 18.x

---

## 🔐 Step 3: Add Environment Variables

**CRITICAL:** You MUST add these environment variables in Vercel dashboard:

### Go to: Project Settings → Environment Variables

Add the following variables for **ALL environments** (Production, Preview, Development):

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://student-attendence-tracker.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | `https://student-attendence-tracker.onrender.com` |

**Important Notes:**
- ✅ Click "Add" for each variable
- ✅ Select all environments (Production, Preview, Development)
- ✅ Make sure variable names start with `VITE_` (required for Vite)
- ✅ No quotes needed in the values

---

## 🔄 Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"** (optional)
5. Click **"Redeploy"**

**OR** make a new commit and push to trigger auto-deployment.

---

## ✅ Step 5: Verify Deployment

### Check Build Logs
1. Go to your deployment
2. Check **"Building"** section
3. Look for: `✓ built in XXXms`
4. Should NOT see any environment variable errors

### Check Runtime
1. Open your deployed URL
2. Open Browser DevTools (F12)
3. Check Console for:
   ```
   🌐 API Base URL: https://student-attendence-tracker.onrender.com/api/v1
   🔧 Environment: production
   ```

### Test API Connection
1. Login to your app
2. Go to Dashboard
3. Click **"Show Endpoint Tester"** button
4. Click **"Test All Endpoints"**
5. Check results - should see ✅ or ⚠️ (401 is OK)

---

## 🐛 Troubleshooting

### Issue 1: Environment Variables Not Loading
**Symptom:** API calls fail, BASE_URL is undefined

**Solution:**
1. Verify variables are set in Vercel dashboard
2. Variable names MUST start with `VITE_`
3. Redeploy after adding variables
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue 2: 404 on Routes
**Symptom:** Refresh on `/students` gives 404

**Solution:**
- Already configured in `vercel.json` with rewrites
- Should work automatically

### Issue 3: CORS Errors
**Symptom:** Network errors, CORS policy blocks

**Solution:**
1. Backend must allow Vercel domain in CORS
2. Add to backend CORS config:
   ```javascript
   origin: [
     'https://your-app.vercel.app',
     'https://*.vercel.app'
   ]
   ```

### Issue 4: Build Fails
**Symptom:** `tsc: Permission denied`

**Solution:**
- Already fixed in package.json
- Build command is now just `vite build`

---

## 📊 Expected Results

### Successful Deployment Should Show:

✅ Build succeeded
✅ Deployment URL active
✅ Environment variables loaded
✅ API endpoints responding
✅ No CORS errors
✅ Routes working (no 404 on refresh)

### Test Checklist:

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard shows (even with demo data)
- [ ] Can navigate to Students, Attendance, Activities
- [ ] Browser console shows correct API URL
- [ ] No environment variable errors in console

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: Go to your project → Settings
- Environment Variables: Settings → Environment Variables
- Deployment Logs: Deployments → [Latest] → Building

---

## 📝 Quick Commands

### Local Testing Before Deploy:
```bash
# Build locally to test
npm run build

# Preview production build
npm run preview

# Check for TypeScript errors
npm run type-check
```

### After Vercel Deployment:
```bash
# Trigger new deployment
git add .
git commit -m "Update: trigger deployment"
git push origin main
```

---

## ⚡ Quick Fix Checklist

If deployment works but API doesn't connect:

1. ✅ Environment variables set in Vercel? → Settings → Environment Variables
2. ✅ Variables start with `VITE_`?
3. ✅ Redeployed after adding variables?
4. ✅ Backend CORS allows Vercel domain?
5. ✅ Backend is running on Render?
6. ✅ Check browser console for actual API URL being used

---

**Need Help?** Check the browser console (F12) for detailed error messages!
