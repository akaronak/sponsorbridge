# 🚀 Eventra Backend - Render Deployment Guide

## ⚠️ Common Deployment Errors & Solutions

Your backend deployment on Render is likely failing due to one or more of these issues. Follow this guide to fix them.

---

## 🔴 Error 1: Missing Required Environment Variables

### Symptoms
- Build fails with: `JWT_SECRET is required`
- Application won't start
- Logs show: `IllegalArgumentException: JWT_SECRET cannot be empty`

### Solution
Render requires these **MANDATORY** environment variables:

1. Go to your Render service dashboard
2. Click **Environment** tab
3. Add these variables:

```
JWT_SECRET=your-256-bit-secret-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventra?retryWrites=true&w=majority
REDIS_HOST=your-redis-host.redis.cache.windows.net
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_SSL=true
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Generate JWT_SECRET
Run this command to generate a secure key:
```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔴 Error 2: MongoDB Connection Failure

### Symptoms
- Build succeeds but app crashes on startup
- Logs show: `Connection refused to MongoDB`
- Error: `MongoServerSelectionException`

### Solution

**Option A: Use MongoDB Atlas (Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/eventra?retryWrites=true&w=majority`
4. Set `MONGODB_URI` in Render environment variables
5. Whitelist Render IP:
   - In Atlas: Network Access → Add IP Address
   - Add `0.0.0.0/0` (or Render's IP if available)

**Option B: Use Render's PostgreSQL (Alternative)**

If you prefer PostgreSQL instead of MongoDB:
1. Create a PostgreSQL database on Render
2. Update `SPRING_PROFILES_ACTIVE=postgres` (requires code changes)
3. Set `DATABASE_URL` environment variable

---

## 🔴 Error 3: Redis Connection Failure

### Symptoms
- App starts but crashes when accessing cache
- Error: `Connection refused to Redis`
- Logs show: `Unable to connect to Redis`

### Solution

**Option A: Use Redis Cloud (Recommended)**

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Get connection details
4. Set in Render:
   ```
   REDIS_HOST=your-redis-host.redis.cache.windows.net
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   REDIS_SSL=true
   ```

**Option B: Disable Redis (Development Only)**

If you don't need caching yet:
```
SPRING_PROFILES_ACTIVE=dev
```

This uses in-memory caching instead.

---

## 🔴 Error 4: Build Fails - Java Version Mismatch

### Symptoms
- Build error: `Unsupported class version`
- Error: `Java 21 not found`
- Maven compilation fails

### Solution

1. In Render dashboard, go to **Settings**
2. Set **Build Command**:
   ```bash
   mvn clean package -DskipTests -B
   ```

3. Set **Start Command**:
   ```bash
   java -jar target/eventra-backend-1.0.0.jar
   ```

4. Ensure Render uses Java 21:
   - Render auto-detects from `pom.xml`
   - Verify `<java.version>21</java.version>` is set

---

## 🔴 Error 5: Port Configuration Issues

### Symptoms
- App starts but won't respond
- Error: `Port 8080 already in use`
- Render shows "Service is running" but no response

### Solution

Render automatically assigns a port via `PORT` environment variable.

Update your `application.properties`:
```properties
server.port=${PORT:8080}
```

This is already configured, but verify it's correct.

---

## 🔴 Error 6: CORS Issues (Frontend Can't Connect)

### Symptoms
- Frontend loads but API calls fail
- Browser console: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Error: `Access to XMLHttpRequest blocked`

### Solution

1. Set `CORS_ALLOWED_ORIGINS` in Render environment:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

2. If multiple origins:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com
   ```

3. Verify frontend URL matches exactly (including protocol)

---

## 🔴 Error 7: Cloudinary/Razorpay/Gemini API Keys Missing

### Symptoms
- File upload fails
- Payment processing fails
- AI features don't work

### Solution

These are optional but recommended. Add to Render environment:

```
# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Google Gemini (for AI)
GEMINI_API_KEY=your-gemini-api-key
```

If not set, these features will be disabled gracefully.

---

## ✅ Step-by-Step Render Deployment

### Step 1: Prepare Your Repository

Ensure your GitHub repository has:
- ✅ `eventra-backend/pom.xml` (Maven config)
- ✅ `eventra-backend/Dockerfile` (optional but recommended)
- ✅ `eventra-backend/src/` (source code)

### Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository
5. Configure:
   - **Name**: `eventra-backend`
   - **Environment**: `Docker` (recommended) or `Java`
   - **Build Command**: `mvn clean package -DskipTests -B`
   - **Start Command**: `java -jar target/eventra-backend-1.0.0.jar`
   - **Plan**: Free or Paid (based on needs)

### Step 3: Set Environment Variables

1. In Render dashboard, go to **Environment**
2. Add all required variables (see below)
3. Click **Save**

### Step 4: Deploy

1. Click **Deploy**
2. Monitor logs in **Logs** tab
3. Wait for "Service is live" message

### Step 5: Test

```bash
# Test health endpoint
curl https://your-service.onrender.com/actuator/health

# Test API
curl https://your-service.onrender.com/api/auth/validate
```

---

## 📋 Complete Environment Variables Checklist

Copy and paste into Render environment:

```
# ═══ REQUIRED ═══
JWT_SECRET=your-256-bit-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventra?retryWrites=true&w=majority
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_SSL=true
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# ═══ OPTIONAL ═══
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
GEMINI_API_KEY=

# ═══ OPTIONAL - ADVANCED ═══
SPRING_PROFILES_ACTIVE=prod
APP_NAME=eventra
SERVER_PORT=8080
JWT_EXPIRATION=86400000
ESCROW_HOLD_DAYS=7
DISPUTE_AUTO_RESOLVE_DAYS=14
COMMISSION_PERCENT=10.0
```

---

## 🔍 Debugging Deployment Issues

### View Logs
1. Go to Render dashboard
2. Click your service
3. Click **Logs** tab
4. Search for errors

### Common Log Patterns

**Error: `Connection refused`**
- MongoDB/Redis not accessible
- Check connection strings and IP whitelist

**Error: `Port already in use`**
- Render assigns port automatically
- Verify `server.port=${PORT:8080}` in properties

**Error: `OutOfMemoryError`**
- Increase Render plan
- Or optimize application

**Error: `ClassNotFoundException`**
- Maven build failed
- Check build logs

### Enable Debug Logging

Add to environment:
```
LOGGING_LEVEL_COM_EVENTRA=DEBUG
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK=DEBUG
```

---

## 🚀 Optimization Tips

### 1. Use Docker Build (Faster)
- Render auto-detects `Dockerfile`
- Builds are cached and faster
- Recommended for Java apps

### 2. Reduce Build Time
```bash
# Skip tests during build
mvn clean package -DskipTests -B
```

### 3. Optimize Memory
- Render free tier: 512MB RAM
- Set JVM options in start command:
```bash
java -Xmx256m -Xms128m -jar target/eventra-backend-1.0.0.jar
```

### 4. Use Managed Services
- MongoDB Atlas (free tier available)
- Redis Cloud (free tier available)
- Cloudinary (free tier available)

---

## 🔐 Security Checklist

- ✅ JWT_SECRET is strong (256+ bits)
- ✅ CORS_ALLOWED_ORIGINS is specific (not `*`)
- ✅ Database credentials are secure
- ✅ API keys are not in code (use environment variables)
- ✅ HTTPS is enabled (Render provides free SSL)
- ✅ MongoDB IP whitelist includes Render

---

## 📞 Troubleshooting Checklist

- [ ] All required environment variables are set
- [ ] MongoDB connection string is correct
- [ ] Redis connection is working
- [ ] CORS_ALLOWED_ORIGINS matches frontend URL
- [ ] JWT_SECRET is set and strong
- [ ] Build command completes successfully
- [ ] Logs show "Service is live"
- [ ] Health endpoint responds: `/actuator/health`
- [ ] Frontend can connect to backend API

---

## 🎯 Next Steps

1. **Set environment variables** in Render
2. **Deploy** the service
3. **Monitor logs** for errors
4. **Test health endpoint**: `https://your-service.onrender.com/actuator/health`
5. **Update frontend** with backend URL
6. **Test API calls** from frontend

---

## 📚 Useful Links

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Redis Cloud](https://redis.com/try-free/)
- [Cloudinary](https://cloudinary.com/)
- [Razorpay](https://razorpay.com/)

---

## 💡 Pro Tips

1. **Use Render's free tier** to test before upgrading
2. **Monitor logs regularly** for issues
3. **Set up alerts** for service failures
4. **Use environment-specific configs** (dev vs prod)
5. **Test locally first** before deploying
6. **Keep dependencies updated** for security

---

**Status**: Ready to deploy! 🚀

Follow this guide and your backend will be live on Render in minutes.

