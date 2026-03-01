# 🔧 Render Deployment - Quick Fix Checklist

## 🚨 Your Backend Won't Deploy? Follow This!

---

## Step 1: Check Render Logs (CRITICAL)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click your **eventra-backend** service
3. Click **Logs** tab
4. **Copy the LAST ERROR MESSAGE** you see
5. Match it below to find the solution

---

## Step 2: Match Your Error

### ❌ Error: `JWT_SECRET is required` or `JWT_SECRET cannot be empty`

**Fix:**
1. Go to **Environment** tab in Render
2. Add: `JWT_SECRET=` followed by a strong key
3. Generate key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Paste the output as JWT_SECRET value
5. Click **Save**
6. Redeploy

---

### ❌ Error: `Connection refused` or `MongoServerSelectionException`

**Fix:**
1. Go to **Environment** tab
2. Check `MONGODB_URI` is set correctly
3. If using MongoDB Atlas:
   - Go to Atlas dashboard
   - Click **Network Access**
   - Add IP: `0.0.0.0/0` (allow all)
   - Or add Render's IP if available
4. Test connection string locally first
5. Redeploy

---

### ❌ Error: `Unable to connect to Redis` or `Redis connection refused`

**Fix:**
1. Go to **Environment** tab
2. Check `REDIS_HOST` and `REDIS_PASSWORD` are set
3. If using Redis Cloud:
   - Get connection details from Redis Cloud dashboard
   - Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
   - Set `REDIS_SSL=true`
4. Or disable Redis temporarily:
   - Set `SPRING_PROFILES_ACTIVE=dev`
5. Redeploy

---

### ❌ Error: `CORS policy: No 'Access-Control-Allow-Origin'`

**Fix:**
1. Go to **Environment** tab
2. Set `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
3. Make sure URL matches exactly (including https://)
4. Redeploy

---

### ❌ Error: `Unsupported class version` or `Java version mismatch`

**Fix:**
1. Go to **Settings** tab
2. Set **Build Command**:
   ```
   mvn clean package -DskipTests -B
   ```
3. Set **Start Command**:
   ```
   java -jar target/eventra-backend-1.0.0.jar
   ```
4. Verify `pom.xml` has `<java.version>21</java.version>`
5. Redeploy

---

### ❌ Error: `Port 8080 already in use` or `Address already in use`

**Fix:**
1. Verify `application.properties` has:
   ```
   server.port=${PORT:8080}
   ```
2. This is already set, so just redeploy
3. Render will assign a port automatically

---

### ❌ Error: `Build failed` or `Maven build error`

**Fix:**
1. Check **Build Logs** in Render
2. Look for specific error message
3. Common causes:
   - Missing Java 21
   - Dependency download failed
   - Compilation error
4. Try rebuilding:
   - Click **Redeploy** button
   - Or push a new commit to trigger rebuild

---

### ❌ Error: `Service is running but not responding`

**Fix:**
1. Test health endpoint:
   ```
   curl https://your-service.onrender.com/actuator/health
   ```
2. If no response:
   - Check logs for startup errors
   - Verify all environment variables are set
   - Check MongoDB/Redis connectivity
3. Restart service:
   - Go to **Settings**
   - Click **Restart**

---

## Step 3: Verify All Required Variables

Go to **Environment** tab and ensure these are set:

```
✅ JWT_SECRET = (strong key, not empty)
✅ MONGODB_URI = (valid connection string)
✅ REDIS_HOST = (your redis host)
✅ REDIS_PORT = 6379
✅ REDIS_PASSWORD = (your redis password)
✅ REDIS_SSL = true
✅ CORS_ALLOWED_ORIGINS = https://your-frontend.vercel.app
```

---

## Step 4: Redeploy

1. Click **Redeploy** button in Render
2. Wait for build to complete
3. Check logs for "Service is live"
4. Test: `curl https://your-service.onrender.com/actuator/health`

---

## Step 5: Test Connection from Frontend

Update your frontend `.env`:
```
VITE_API_URL=https://your-service.onrender.com
```

Test API call:
```javascript
fetch('https://your-service.onrender.com/api/auth/validate')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## 🆘 Still Not Working?

### Collect Debug Info

1. **Render Logs** - Copy full error message
2. **Environment Variables** - List what's set
3. **Frontend URL** - What's your Vercel URL?
4. **Backend URL** - What's your Render URL?

### Check These

- [ ] Is MongoDB accessible from Render?
- [ ] Is Redis accessible from Render?
- [ ] Is JWT_SECRET set and not empty?
- [ ] Does CORS_ALLOWED_ORIGINS match frontend URL exactly?
- [ ] Are all required variables set?

### Nuclear Option (Reset Everything)

1. Delete service from Render
2. Create new service
3. Set ALL environment variables BEFORE deploying
4. Deploy fresh

---

## 📋 Environment Variables Template

Copy this and fill in your values:

```
JWT_SECRET=your-256-bit-secret-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventra?retryWrites=true&w=majority
REDIS_HOST=your-redis-host.redis.cache.windows.net
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_SSL=true
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
SPRING_PROFILES_ACTIVE=prod
APP_NAME=eventra
```

---

## ✅ Success Indicators

- ✅ Render shows "Service is live"
- ✅ Health endpoint responds: `{"status":"UP"}`
- ✅ Frontend can call API without CORS errors
- ✅ No errors in Render logs

---

## 🎯 Common Mistakes to Avoid

1. ❌ JWT_SECRET is empty or missing
2. ❌ CORS_ALLOWED_ORIGINS has wrong URL
3. ❌ MongoDB/Redis not whitelisted for Render IP
4. ❌ Connection strings have typos
5. ❌ Environment variables not saved before deploy
6. ❌ Frontend URL doesn't match CORS setting

---

**Need more help?** Check `RENDER_DEPLOYMENT_GUIDE.md` for detailed explanations.

