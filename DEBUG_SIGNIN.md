# Sign-in Server Error - Debugging Guide

## **Quick Fix Steps:**

### **Step 1: Verify MongoDB Connection**
The `.env` file shows MongoDB URI is configured. Test the connection:

```powershell
# Test MongoDB connection string
# Open MongoDB Atlas and verify:
# 1. Your IP is whitelisted (Network Access)
# 2. Database user has correct password
# 3. Connection string doesn't have authentication issues
```

### **Step 2: Start Server First (CRITICAL)**
```powershell
cd "c:\Users\saura\OneDrive\Desktop\Hospital Management System"
npm run server
```

Wait for these messages:
```
✅ MongoDB connected successfully
✅ Server running on port 5000
```

**If you see MongoDB error:**
- Check `.env` file - ensure `MONGODB_URI` is correct
- Verify MongoDB Atlas account - IP whitelist, user permissions

### **Step 3: Start Client in NEW Terminal**
```powershell
cd "c:\Users\saura\OneDrive\Desktop\Hospital Management System\client"
npm start
```

### **Step 4: Try Sign-in
- Open http://localhost:3000
- Sign up first with a new account OR try sign-in with test account
- Check browser console (F12) for detailed errors

## **Common Issues & Solutions:**

### Issue 1: "Network Error" 
**Cause:** Server not running or client can't reach it
**Fix:** 
1. Verify server is running: http://localhost:5000 should show error page (that's ok)
2. Check both terminals show no errors
3. Wait 5-10 seconds after starting server before trying to login

### Issue 2: MongoDB Connection Error
**Cause:** Invalid connection string, IP not whitelisted, or wrong credentials
**Fix:**
1. Go to MongoDB Atlas
2. Click "Network Access" → verify your IP is whitelisted
3. Click "Database Users" → verify username/password
4. Copy connection string from "Connect" → "Connect your application"
5. Update `.env` file with correct `MONGODB_URI`

### Issue 3: CORS Error
**Cause:** Frontend and backend not connecting properly
**Fix:**
- Ensure `CORS_ORIGIN=http://localhost:3000` in `.env`
- Restart server after any `.env` changes

## **Testing the API Directly:**

Open PowerShell and test the API:

```powershell
# Test server is running
$response = curl.exe -s http://localhost:5000/api/auth/login
$response  # Should show an error about missing fields (good sign!)

# Test signup
$body = @{
    email = "test@hospital.com"
    password = "Test123"
    firstName = "Test"
    lastName = "User"
    role = "patient"
} | ConvertTo-Json

$response = curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d $body
$response
```

If signup works, try login with those credentials via browser.

## **Check Logs:**

1. **Server terminal** - Look for any error messages
2. **Browser console** (F12) - Look for network errors
3. **Network tab** (F12) - Check the actual API response

---

**Need more help? Run both servers and check the terminal output for specific error messages.**
