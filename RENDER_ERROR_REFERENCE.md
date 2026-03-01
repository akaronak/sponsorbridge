# 🔴 Render Deployment - Error Reference Guide

## Complete List of Deployment Errors & Solutions

---

## Error Category 1: Configuration Errors

### Error: `JWT_SECRET is required` or `JWT_SECRET cannot be empty`

**Where you see it**: Render logs during startup  
**Why it happens**: JWT_SECRET environment variable not set  
**Solution**:
1. Go to Render dashboard → Your service → Environment
2. Add: `JWT_SECRET=` + strong key
3. Generate key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Click Save
5. Redeploy

---

### Error: `IllegalArgumentException: JWT_SECRET cannot be null`

**Where you see it**: Application startup logs  
**Why it happens**: JWT_SECRET is null (not set)  
**Solution**: Same as above - set JWT_SECRET in environment variables

---

### Error: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Where you see it**: Browser console when frontend calls API  
**Why it happens**: CORS_ALLOWED_ORIGINS not set or wrong URL  
**Solution**:
1. Go to Render → Environment
2. Set: `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
3. Make sure URL matches exactly (including https://)
4. Redeploy

---

### Error: `Access to XMLHttpRequest blocked by CORS policy`

**Where you see it**: Browser console  
**Why it happens**: Frontend URL not in CORS whitelist  
**Solution**:
1. Check your Vercel frontend URL
2. Add it to CORS_ALLOWED_ORIGINS in Render
3. Redeploy backend
4. Redeploy frontend

---

## Error Category 2: Database Connection Errors

### Error: `MongoServerSelectionException: No servers available`

**Where you see it**: Render logs during startup  
**Why it happens**: Can't connect to MongoDB  
**Solution**:
1. Verify MONGODB_URI is correct
2. Go to MongoDB Atlas → Network Access
3. Add IP: `0.0.0.0/0` (allow all)
4. Test connection string locally
5. Redeploy

---

### Error: `Connection refused to MongoDB`

**Where you see it**: Render logs  
**Why it happens**: MongoDB not accessible from Render  
**Solution**:
1. Use MongoDB Atlas (cloud) instead of local MongoDB
2. Get connection string from Atlas
3. Set MONGODB_URI in Render environment
4. Whitelist Render IP in Atlas
5. Redeploy

---

### Error: `MongoAuthenticationException: Authentication failed`

**Where you see it**: Render logs  
**Why it happens**: Wrong MongoDB username/password  
**Solution**:
1. Go to MongoDB Atlas
2. Check database user credentials
3. Verify password in connection string
4. Update MONGODB_URI in Render
5. Redeploy

---

### Error: `MongoNetworkException: Exception opening socket`

**Where you see it**: Render logs  
**Why it happens**: Network connectivity issue  
**Solution**:
1. Verify MongoDB Atlas is running
2. Check IP whitelist includes `0.0.0.0/0`
3. Test connection string locally
4. Try different region
5. Redeploy

---

## Error Category 3: Redis Connection Errors

### Error: `Unable to connect to Redis`

**Where you see it**: Render logs  
**Why it happens**: Redis not accessible  
**Solution**:
1. Verify REDIS_HOST and REDIS_PASSWORD are set
2. Use Redis Cloud instead of local Redis
3. Get connection details from Redis Cloud
4. Set REDIS_SSL=true
5. Redeploy

---

### Error: `Connection refused to Redis`

**Where you see it**: Render logs  
**Why it happens**: Can't reach Redis server  
**Solution**:
1. Check REDIS_HOST is correct
2. Check REDIS_PORT is 6379
3. Check REDIS_PASSWORD is correct
4. Verify Redis Cloud database is running
5. Redeploy

---

### Error: `Redis connection timeout`

**Where you see it**: Render logs  
**Why it happens**: Redis taking too long to respond  
**Solution**:
1. Check Redis Cloud dashboard for issues
2. Verify network connectivity
3. Try restarting Redis database
4. Increase timeout in application.properties
5. Redeploy

---

### Error: `WRONGPASS invalid username-password pair`

**Where you see it**: Render logs  
**Why it happens**: Wrong Redis password  
**Solution**:
1. Go to Redis Cloud dashboard
2. Check password
3. Update REDIS_PASSWORD in Render
4. Redeploy

---

## Error Category 4: Build Errors

### Error: `Build failed` or `Maven build error`

**Where you see it**: Render build logs  
**Why it happens**: Maven compilation failed  
**Solution**:
1. Check build logs for specific error
2. Common causes:
   - Java version mismatch
   - Dependency download failed
   - Compilation error in code
3. Try rebuilding: Click Redeploy
4. Or push new commit to trigger rebuild

---

### Error: `Unsupported class version`

**Where you see it**: Build logs  
**Why it happens**: Java version mismatch  
**Solution**:
1. Verify pom.xml has: `<java.version>21</java.version>`
2. Verify Render uses Java 21
3. Set build command: `mvn clean package -DskipTests -B`
4. Redeploy

---

### Error: `Could not find artifact`

**Where you see it**: Build logs  
**Why it happens**: Maven can't download dependency  
**Solution**:
1. Check internet connection
2. Try rebuilding: Click Redeploy
3. Or push new commit
4. Check pom.xml for typos

---

### Error: `Compilation failure`

**Where you see it**: Build logs  
**Why it happens**: Code has syntax errors  
**Solution**:
1. Check error message for file and line number
2. Fix the code
3. Push to GitHub
4. Redeploy

---

### Error: `OutOfMemoryError: Java heap space`

**Where you see it**: Build logs  
**Why it happens**: Not enough memory for build  
**Solution**:
1. Upgrade Render plan to get more memory
2. Or optimize build:
   - Skip tests: `-DskipTests`
   - Skip javadoc: `-Dskip.javadoc=true`
3. Redeploy

---

## Error Category 5: Runtime Errors

### Error: `Port 8080 already in use` or `Address already in use`

**Where you see it**: Render logs after build  
**Why it happens**: Port conflict  
**Solution**:
1. Verify application.properties has: `server.port=${PORT:8080}`
2. This is already set, so just redeploy
3. Render will assign port automatically

---

### Error: `Service is running but not responding`

**Where you see it**: Render dashboard shows "Service is live" but no response  
**Why it happens**: Application crashed after startup  
**Solution**:
1. Check Render logs for errors
2. Look for:
   - Database connection errors
   - Redis connection errors
   - Missing environment variables
3. Fix the issue
4. Redeploy

---

### Error: `502 Bad Gateway`

**Where you see it**: Browser when accessing backend URL  
**Why it happens**: Backend crashed or not responding  
**Solution**:
1. Check Render logs
2. Restart service: Go to Settings → Restart
3. Or redeploy
4. Check for errors in logs

---

### Error: `503 Service Unavailable`

**Where you see it**: Browser  
**Why it happens**: Service is down or restarting  
**Solution**:
1. Wait a few minutes for service to restart
2. Check Render dashboard status
3. If still down, check logs
4. Restart service manually

---

### Error: `504 Gateway Timeout`

**Where you see it**: Browser  
**Why it happens**: Request took too long  
**Solution**:
1. Check if backend is responding: `/actuator/health`
2. Check Render logs for slow queries
3. Optimize database queries
4. Increase timeout settings

---

## Error Category 6: Application Errors

### Error: `NullPointerException` in logs

**Where you see it**: Render logs  
**Why it happens**: Code trying to use null value  
**Solution**:
1. Check error stack trace
2. Look for missing environment variable
3. Add the variable to Render environment
4. Redeploy

---

### Error: `ClassNotFoundException`

**Where you see it**: Render logs  
**Why it happens**: Missing dependency or class  
**Solution**:
1. Check pom.xml for missing dependency
2. Add dependency if needed
3. Rebuild locally to test
4. Push to GitHub
5. Redeploy

---

### Error: `FileNotFoundException` for properties file

**Where you see it**: Render logs  
**Why it happens**: Configuration file not found  
**Solution**:
1. Verify application.properties exists in src/main/resources
2. Check file is included in build
3. Rebuild and redeploy

---

## Error Category 7: Network Errors

### Error: `Connection timed out`

**Where you see it**: Render logs  
**Why it happens**: Network connectivity issue  
**Solution**:
1. Check if external service is running
2. Verify network connectivity
3. Check firewall rules
4. Try again later

---

### Error: `Name or service not known`

**Where you see it**: Render logs  
**Why it happens**: DNS resolution failed  
**Solution**:
1. Check hostname is correct
2. Verify service is running
3. Check DNS settings
4. Try using IP address instead

---

### Error: `Connection reset by peer`

**Where you see it**: Render logs  
**Why it happens**: Connection dropped unexpectedly  
**Solution**:
1. Check if external service is stable
2. Increase connection timeout
3. Add retry logic
4. Check network stability

---

## Error Category 8: Permission Errors

### Error: `Permission denied`

**Where you see it**: Render logs  
**Why it happens**: Insufficient permissions  
**Solution**:
1. Check file permissions
2. Verify user has access
3. Check security settings
4. Restart service

---

### Error: `Access denied` for database

**Where you see it**: Render logs  
**Why it happens**: Database user doesn't have permissions  
**Solution**:
1. Go to MongoDB Atlas
2. Check database user permissions
3. Grant necessary permissions
4. Redeploy

---

## Debugging Checklist

When you see an error:

1. **Read the error message carefully**
   - Note the exact error text
   - Look for file names and line numbers

2. **Check Render logs**
   - Go to Render dashboard
   - Click your service
   - Click Logs tab
   - Look for the error

3. **Match error to this guide**
   - Find similar error above
   - Follow the solution

4. **Check environment variables**
   - Go to Environment tab
   - Verify all required variables are set
   - Check values are correct

5. **Check external services**
   - Is MongoDB Atlas running?
   - Is Redis Cloud running?
   - Are they accessible?

6. **Try rebuilding**
   - Click Redeploy in Render
   - Or push new commit to GitHub

7. **Check logs again**
   - Look for new error messages
   - Repeat steps 3-6 if needed

---

## Quick Reference: Error → Solution

| Error | Cause | Solution |
|-------|-------|----------|
| JWT_SECRET required | Missing env var | Add JWT_SECRET to Render |
| CORS policy error | Wrong origin | Update CORS_ALLOWED_ORIGINS |
| MongoDB connection refused | Can't reach DB | Use MongoDB Atlas |
| Redis connection refused | Can't reach cache | Use Redis Cloud |
| Build failed | Compilation error | Check build logs |
| Port already in use | Port conflict | Verify port config |
| Service not responding | App crashed | Check logs |
| 502 Bad Gateway | Backend down | Restart service |
| 503 Service Unavailable | Service down | Wait or restart |
| 504 Gateway Timeout | Request too slow | Check logs |

---

## 🆘 Still Stuck?

1. **Check all 3 guides**:
   - RENDER_QUICK_FIX.md
   - RENDER_DEPLOYMENT_GUIDE.md
   - RENDER_SETUP_STEPS.md

2. **Collect debug info**:
   - Full error message from logs
   - Environment variables set
   - External service status

3. **Try nuclear option**:
   - Delete service from Render
   - Create new service
   - Set ALL variables BEFORE deploying
   - Deploy fresh

---

**Remember**: Always check Render logs first! 🔍

