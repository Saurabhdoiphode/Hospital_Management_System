# 🔧 Network Error Fix Guide

## Problem
When trying to login or signup, you see: **"Network Error"** or **"Network error: Please check if server is running on port 5000"**

## Solution

### Step 1: Check if Server is Running

**Open a terminal and run:**
```bash
npm run server
```

**You should see:**
```
MongoDB connected successfully
Server running on port 5000
```

**If you see errors:**
- Check MongoDB connection in `.env` file
- Make sure port 5000 is not already in use
- Check if all dependencies are installed: `npm install`

### Step 2: Check if Client is Running

**Open a NEW terminal window and run:**
```bash
npm run client
```

**You should see:**
```
Compiled successfully!
```

**The app will open at:** http://localhost:3000

### Step 3: Verify Both Are Running

1. **Server Terminal** should show:
   - ✅ MongoDB connected successfully
   - ✅ Server running on port 5000

2. **Client Terminal** should show:
   - ✅ Compiled successfully!
   - ✅ Local: http://localhost:3000

3. **Browser** should open automatically to http://localhost:3000

### Step 4: Test Login

1. Go to http://localhost:3000
2. You should see the login page
3. Try to login or signup
4. If still getting network error, check browser console (F12) for details

## Quick Fix Commands

### Run Everything Together:
```bash
npm run dev
```

This runs both server and client in one command.

### Check Ports:
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# If ports are busy, kill the process or change ports
```

### Common Issues:

1. **Port 5000 already in use:**
   - Change PORT in `.env` file
   - Or kill the process using port 5000

2. **MongoDB connection error:**
   - Check `.env` file has correct MONGODB_URI
   - Make sure MongoDB Atlas allows your IP

3. **Dependencies not installed:**
   ```bash
   npm install
   cd client
   npm install
   ```

4. **CORS Error:**
   - Server CORS is already configured
   - Make sure server is running on port 5000
   - Make sure client is running on port 3000

## Still Having Issues?

1. **Check browser console (F12)** for detailed error
2. **Check server terminal** for any error messages
3. **Verify .env file** has correct MongoDB URI
4. **Restart both server and client**

## Test Server Directly

Open browser and go to:
```
http://localhost:5000/api/auth/login
```

You should see an error (because it's POST, not GET), but it means server is running!

If you see "Cannot GET /api/auth/login", server is working ✅
If you see "Cannot connect", server is NOT running ❌

