# Sign-In Server Error - Complete Fix Guide

## 🔴 **THE MOST COMMON ISSUE: SERVER NOT RUNNING**

### ⚠️ **CRITICAL - Do This First:**

#### **Step 1: Start Backend Server**
```powershell
cd "c:\Users\saura\OneDrive\Desktop\Hospital Management System"
npm run server
```

**WAIT and look for these messages:**
```
MongoDB connected successfully
Server running on port 5000
```

**If you DON'T see these messages, STOP and check error below.**

#### **Step 2: Open NEW PowerShell/Terminal Window**
**IMPORTANT: Use a DIFFERENT terminal, don't close the first one!**

```powershell
cd "c:\Users\saura\OneDrive\Desktop\Hospital Management System\client"
npm start
```

**WAIT for:**
```
Compiled successfully!
On Your Network: http://192.168.x.x:3000
```

#### **Step 3: Open Browser**
```
http://localhost:3000
```

---

## 🔧 **TROUBLESHOOTING ERRORS**

### **Error 1: MongoDB Connection Error**

**Error Message:**
```
MongoDB connection error: MongoNetworkError
MongoAuthenticationError
```

**Fix:**
1. Check your `.env` file - look at `MONGODB_URI`
2. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
3. Click "Network Access" on left sidebar
4. Make sure your current IP is whitelisted (or add `0.0.0.0/0` for testing)
5. Click "Database Users" 
6. Verify username and password match what's in `.env`
7. Your `.env` currently has:
   ```
   MONGODB_URI=mongodb+srv://saurabhdoiphode1711_db_user:Self%40123@cluster0.a5geez6.mongodb.net/hospital-management?retryWrites=true&w=majority&appName=Cluster0
   ```
   - Username: `saurabhdoiphode1711_db_user`
   - Password: `Self@123` (shown as `Self%40123` in URL - %40 is @)

**Solution:**
- If password is wrong, reset it in MongoDB Atlas
- If IP not whitelisted, add your IP or use `0.0.0.0/0` (less secure, only for dev)

---

### **Error 2: Port 5000 Already in Use**

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
```powershell
# Find and kill process using port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "Killed process on port 5000"
}

# Then start server again
npm run server
```

**Or change port in `.env`:**
```env
PORT=5001
```

---

### **Error 3: Network Error When Signing In**

**Error Shows in Browser:**
```
Network error: Please check if server is running on port 5000
```

**Cause:** Server is not running or client can't reach it

**Fix:**
1. Check server terminal - is it still running?
2. If server closed, restart it:
   ```powershell
   npm run server
   ```
3. Wait 5-10 seconds
4. Try login again
5. Open browser console (F12) and check for detailed errors

---

### **Error 4: Invalid Credentials Error**

**Error Shows:**
```
Invalid credentials
```

**Cause:** Email/password is wrong OR no user exists yet

**Fix:**
1. **If first time:** You need to SIGN UP first
   - Click "Sign Up" link on login page
   - Fill form with:
     - Email: any email
     - Password: at least 6 characters
     - First Name & Last Name
     - Role: Select one (admin, doctor, patient, etc.)
   - Click Sign Up
   - You'll be logged in automatically

2. **If you registered before:** Double-check email/password spelling

3. **If you forgot password:** Use "Forgot Password" link

---

### **Error 5: CORS Error**

**Error in Browser Console (F12):**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause:** Frontend and backend not trusting each other

**Fix:**
Check `.env` file:
```env
CORS_ORIGIN=http://localhost:3000
```

Should match your frontend URL. Restart server after changing.

---

## ✅ **VERIFICATION STEPS**

### **Test 1: Server is Running**
Open browser and go to:
```
http://localhost:5000
```
You should see an error page (that's OK - it means server is running)

### **Test 2: API Connection**
Open PowerShell:
```powershell
# Should get error about missing email/password (that's good!)
curl.exe http://localhost:5000/api/auth/login

# Should work and return user data
$headers = @{"Authorization" = "Bearer YOUR_TOKEN"}
curl.exe -Headers $headers http://localhost:5000/api/auth/me
```

### **Test 3: Check Browser Console**
1. Open http://localhost:3000
2. Press F12 (Developer Console)
3. Try to sign in
4. Look at the Network tab for API calls
5. Look at Console tab for error messages

---

## 📱 **COMPLETE STARTUP SEQUENCE**

### **Terminal 1 - Backend**
```powershell
cd "c:\Users\saura\OneDrive\Desktop\Hospital Management System"
npm run server
```
✅ Wait for: `Server running on port 5000`

### **Terminal 2 - Frontend**  
```powershell
cd "c:\Users\saura\OneDrive\Desktop\Hospital Management System\client"
npm start
```
✅ Wait for: `Compiled successfully!`

### **Browser**
```
http://localhost:3000
```

### **First Time Setup**
1. Click "Sign Up"
2. Enter email, password, name, role
3. Click Sign Up
4. You're now logged in!

---

## 🆘 **IF STILL NOT WORKING**

1. **Restart everything:**
   - Close both terminal windows
   - Close browser
   - Start fresh with above sequence

2. **Clear cache:**
   ```powershell
   # In client folder:
   rm node_modules/.cache -Recurse -Force
   npm start
   ```

3. **Check logs carefully:**
   - Look at server terminal - what error appears?
   - Copy the exact error and share it
   - Check browser console (F12) - any red errors?

4. **Verify environment:**
   - MongoDB connection working?
   - Ports 3000 and 5000 available?
   - All dependencies installed? Run: `npm install` in both root and client folders

---

## 📋 **QUICK CHECKLIST**

- [ ] MongoDB URI in `.env` is correct
- [ ] Server started with `npm run server`
- [ ] Server shows "MongoDB connected" message
- [ ] Server shows "Server running on port 5000"
- [ ] Client started in NEW terminal with `npm start`
- [ ] Client shows "Compiled successfully!"
- [ ] Browser at http://localhost:3000
- [ ] Can see login page
- [ ] Signed up a new user first time
- [ ] Now trying to sign in with those credentials

---

## 🔗 **USEFUL LINKS**

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Check My IP: https://www.whatismyip.com
- Firebase Console: https://console.firebase.google.com

---

**📞 Common Contact Issues - When asking for help, provide:**
- Exact error message from server terminal
- Exact error message from browser console (F12)
- Screenshot of the error
- Output of `npm --version` and `node --version`
