# 🚀 Render Deployment - Step-by-Step Setup

## Complete Guide to Deploy Eventra Backend on Render

---

## 📋 Prerequisites

- ✅ GitHub account with your Eventra repository
- ✅ Render account (free at https://render.com)
- ✅ MongoDB Atlas account (free at https://www.mongodb.com/cloud/atlas)
- ✅ Redis Cloud account (free at https://redis.com/try-free/)
- ✅ Your Vercel frontend URL

---

## Phase 1: Prepare External Services (15 minutes)

### Step 1.1: Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new project
4. Create a free cluster:
   - Click **Create** → **Build a Cluster**
   - Choose **Free** tier
   - Select region closest to you
   - Click **Create Cluster**
5. Wait for cluster to be ready (5-10 minutes)
6. Create database user:
   - Go to **Database Access**
   - Click **Add New Database User**
   - Username: `eventra_user`
   - Password: Generate strong password
   - Click **Add User**
7. Whitelist IP:
   - Go to **Network Access**
   - Click **Add IP Address**
   - Add: `0.0.0.0/0` (allow all - for Render)
   - Click **Confirm**
8. Get connection string:
   - Go to **Databases**
   - Click **Connect** on your cluster
   - Choose **Drivers**
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `eventra`
   - Example: `mongodb+srv://eventra_user:password@cluster.mongodb.net/eventra?retryWrites=true&w=majority`

**Save this connection string** - you'll need it in Step 2.

---

### Step 1.2: Create Redis Cloud Database

1. Go to https://redis.com/try-free/
2. Sign up or log in
3. Create a new database:
   - Click **Create Database**
   - Choose **Free** tier
   - Select region
   - Click **Create**
4. Wait for database to be ready
5. Get connection details:
   - Click on your database
   - Go to **Configuration** tab
   - Copy:
     - **Host**: `redis-xxxxx.redis.cache.windows.net`
     - **Port**: `6379`
     - **Password**: Your password
   - Note: SSL is enabled by default

**Save these details** - you'll need them in Step 2.

---

### Step 1.3: Generate JWT Secret

Run this command to generate a strong JWT secret:

**On Mac/Linux:**
```bash
openssl rand -hex 32
```

**On Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Using Node.js (any OS):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save the output** - you'll need it in Step 2.

---

## Phase 2: Configure Render Service (10 minutes)

### Step 2.1: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **New +** button
3. Select **Web Service**
4. Connect your GitHub repository:
   - Click **Connect account** (if not already connected)
   - Authorize Render to access GitHub
   - Select your Eventra repository
5. Configure service:
   - **Name**: `eventra-backend`
   - **Environment**: `Docker` (recommended)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `mvn clean package -DskipTests -B`
   - **Start Command**: `java -jar target/eventra-backend-1.0.0.jar`
   - **Plan**: Free (for testing) or Paid (for production)

6. Click **Create Web Service**

---

### Step 2.2: Add Environment Variables

1. In Render dashboard, go to your **eventra-backend** service
2. Click **Environment** tab
3. Add these variables (copy from Phase 1):

```
JWT_SECRET=<your-generated-secret-from-step-1.3>
MONGODB_URI=<your-mongodb-connection-string-from-step-1.1>
REDIS_HOST=<your-redis-host-from-step-1.2>
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password-from-step-1.2>
REDIS_SSL=true
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
SPRING_PROFILES_ACTIVE=prod
APP_NAME=eventra
```

**Important:** Replace placeholders with actual values!

4. Click **Save**

---

### Step 2.3: Deploy

1. Render will automatically start building
2. Monitor the build in **Logs** tab
3. Wait for message: **"Service is live"**
4. Note your service URL: `https://eventra-backend-xxxxx.onrender.com`

---

## Phase 3: Verify Deployment (5 minutes)

### Step 3.1: Test Health Endpoint

Open this URL in your browser (replace with your Render URL):
```
https://eventra-backend-xxxxx.onrender.com/actuator/health
```

You should see:
```json
{
  "status": "UP"
}
```

If you see an error, check the logs in Render dashboard.

---

### Step 3.2: Test API Endpoint

Run this command (replace with your Render URL):
```bash
curl https://eventra-backend-xxxxx.onrender.com/api/auth/validate
```

You should get a response (might be 401 Unauthorized, which is OK).

---

## Phase 4: Connect Frontend (5 minutes)

### Step 4.1: Update Frontend Environment

1. Go to your Vercel project
2. Go to **Settings** → **Environment Variables**
3. Update or add:
   ```
   VITE_API_URL=https://eventra-backend-xxxxx.onrender.com
   ```
4. Redeploy your frontend

---

### Step 4.2: Test Frontend Connection

1. Open your frontend in browser
2. Try to register or login
3. Check browser console (F12) for errors
4. If CORS error, verify `CORS_ALLOWED_ORIGINS` in Render matches your Vercel URL

---

## 🎯 Troubleshooting

### Build Fails

**Check logs:**
1. Go to Render dashboard
2. Click your service
3. Click **Logs** tab
4. Look for error message

**Common causes:**
- Java version mismatch → Verify `pom.xml` has `<java.version>21</java.version>`
- Dependency download failed → Try rebuilding
- Compilation error → Check code for syntax errors

**Fix:**
- Click **Redeploy** to try again
- Or push a new commit to trigger rebuild

---

### Service Crashes After Build

**Check logs for error:**
- `JWT_SECRET is required` → Add JWT_SECRET to environment
- `Connection refused` → Check MongoDB/Redis connection strings
- `CORS policy` → Update CORS_ALLOWED_ORIGINS

**Fix:**
1. Add missing environment variable
2. Click **Redeploy**

---

### Frontend Can't Connect to Backend

**Check:**
1. Is backend URL correct in frontend `.env`?
2. Does CORS_ALLOWED_ORIGINS match frontend URL exactly?
3. Is backend service running? (Check Render logs)

**Fix:**
1. Update frontend `.env` with correct backend URL
2. Verify CORS_ALLOWED_ORIGINS in Render
3. Redeploy frontend

---

### MongoDB Connection Fails

**Check:**
1. Is connection string correct?
2. Is database user created?
3. Is IP whitelisted?

**Fix:**
1. Go to MongoDB Atlas
2. Verify connection string
3. Go to **Network Access**
4. Add IP: `0.0.0.0/0`
5. Redeploy backend

---

### Redis Connection Fails

**Check:**
1. Is Redis host correct?
2. Is password correct?
3. Is SSL enabled?

**Fix:**
1. Go to Redis Cloud dashboard
2. Verify connection details
3. Ensure `REDIS_SSL=true`
4. Redeploy backend

---

## ✅ Success Checklist

- ✅ MongoDB Atlas database created and accessible
- ✅ Redis Cloud database created and accessible
- ✅ JWT_SECRET generated and set in Render
- ✅ All environment variables set in Render
- ✅ Backend deployed and showing "Service is live"
- ✅ Health endpoint responds with `{"status":"UP"}`
- ✅ Frontend updated with backend URL
- ✅ Frontend can call API without CORS errors
- ✅ No errors in Render logs

---

## 📊 Your Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│         Frontend (Vercel)                           │
│    https://your-app.vercel.app                      │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS API calls
                     ▼
┌─────────────────────────────────────────────────────┐
│         Backend (Render)                            │
│    https://eventra-backend-xxxxx.onrender.com       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   MongoDB Atlas  Redis Cloud  Cloudinary
   (Database)     (Cache)      (Files)
```

---

## 🎉 You're Done!

Your Eventra backend is now deployed on Render and connected to your Vercel frontend!

### Next Steps

1. **Test the application** - Try registering and logging in
2. **Monitor logs** - Check Render logs regularly for issues
3. **Set up alerts** - Enable notifications for service failures
4. **Upgrade plan** - Move to paid plan if needed for production

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Redis Cloud Docs**: https://docs.redis.com/latest/
- **Check logs**: Always check Render logs first for error messages

---

## 🔐 Security Reminders

- ✅ JWT_SECRET is strong and unique
- ✅ Database passwords are secure
- ✅ CORS_ALLOWED_ORIGINS is specific (not `*`)
- ✅ API keys are in environment variables (not in code)
- ✅ HTTPS is enabled (Render provides free SSL)

---

**Status**: Ready to deploy! 🚀

