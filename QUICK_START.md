# 🚀 Quick Start Guide - Hospital Management System

## Prerequisites

✅ **Node.js** installed (v14 or higher)  
✅ **MongoDB Atlas** connection configured in `.env`  
✅ **npm** or **yarn** package manager

## 📦 Installation

### Step 1: Install All Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

**OR use the automated script:**
```bash
npm run install-all
```

### Step 2: Configure Environment Variables

The `.env` file is already created with your MongoDB Atlas connection. Verify it contains:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Optional Service Configuration

For full functionality, configure these services in `.env`:

```env
# Email Service (for appointment reminders)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@hospital.com

# SMS Service (Twilio - for notifications)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateways (for online payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
```

> **Note:** The system works without these, but some features (reminders, SMS, payments) will be limited.

## 🚀 Running the Application

### ⚠️ IMPORTANT: Network Error Fix

**If you see "Network Error" when trying to login/signup, follow these steps:**

#### Quick Fix (Windows):
Double-click `START_SERVER.bat` file in the project root. This will start both server and client automatically.

#### Manual Fix:

**Step 1: Start Backend Server (MUST DO FIRST)**
```bash
npm run server
```

**Wait until you see these messages:**
```
✅ MongoDB connected successfully
✅ Server running on port 5000
```

**If you see errors:**
- MongoDB connection error → Check `.env` file has correct MONGODB_URI
- Port 5000 already in use → Kill the process or change PORT in `.env`

**Step 2: Start Frontend Client (NEW TERMINAL)**
Open a **NEW terminal window** and run:
```bash
npm run client
```

**Wait until you see:**
```
✅ Compiled successfully!
```

**Step 3: Open Browser**
- Go to: http://localhost:3000
- You should see the login page
- Try to login/signup

**If still getting network error:**
1. Check server terminal - should show "Server running on port 5000"
2. Check browser console (F12) for detailed error
3. Verify both are running:
   - Server: http://localhost:5000 (should show error if you visit directly)
   - Client: http://localhost:3000 (should show login page)

### Option 1: Run Both Server and Client Together (Recommended)

```bash
npm run dev
```

This will start:
- ✅ Backend server on **http://localhost:5000**
- ✅ Frontend React app on **http://localhost:3000**

**Make sure both are running before trying to login!**

### Option 2: Run Separately

**Terminal 1 - Backend Server (MUST RUN FIRST):**
```bash
npm run server
```
Wait for: `Server running on port 5000` ✅

**Terminal 2 - Frontend Client:**
```bash
npm run client
```
Wait for: `Compiled successfully!` ✅

## 🎯 First Time Setup

### 1. Start the Application

```bash
npm run dev
```

### 2. Access the Application

- Open your browser and go to: **http://localhost:3000**
- You'll see the login page

### 3. Create Your First User

Since there are no users yet, you need to register:

**Option A: Use Signup Page (Recommended)**
1. Click "Sign Up" on the login page
2. Fill in the registration form
3. Select your role (Admin, Doctor, Patient, etc.)
4. Submit the form

**Option B: Use API directly**
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "Admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

**Option C: Use Postman or similar tool**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "Admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

### 4. Login

After creating a user, login with:
- **Email**: admin@hospital.com
- **Password**: Admin123

## 🎨 Available Features

### Core Modules
- ✅ **Dashboard** - Role-based dashboards
- ✅ **Patients** - Patient management
- ✅ **Appointments** - Appointment scheduling
- ✅ **Medical Records** - EHR system
- ✅ **Billing** - Billing and payments
- ✅ **Pharmacy** - Medicine inventory and sales
- ✅ **Laboratory** - Lab test management
- ✅ **Wards & Beds** - Ward and bed management
- ✅ **Staff Management** - Staff and leave management
- ✅ **Inventory** - Medical equipment tracking
- ✅ **Analytics** - Reports and statistics

### User Roles
- **Admin** - Full system access
- **Doctor** - Patient care, appointments, records
- **Nurse** - Patient care, records viewing
- **Receptionist** - Appointments, billing, pharmacy
- **Patient** - View own records, appointments, bills
- **Lab** - Laboratory test management

## 🔐 Authentication Features

- ✅ Multi-role login system
- ✅ Password reset functionality
- ✅ Change password
- ✅ Secure JWT authentication
- ✅ Role-based access control

## 📱 Progressive Web App (PWA)

The system is PWA-enabled:
- Installable on mobile devices
- Works offline (basic features)
- Mobile-responsive design

## 🛠️ Troubleshooting

### MongoDB Connection Error
```bash
# Check your MongoDB Atlas connection string in .env
# Ensure your IP is whitelisted in MongoDB Atlas Network Access
# Verify database user has proper permissions
```

**Fix:**
1. Go to MongoDB Atlas → Network Access
2. Add your IP address or use `0.0.0.0/0` for development
3. Verify connection string in `.env`

### Port Already in Use

**Backend (Port 5000):**
```bash
# Change PORT in .env file
PORT=5001
```

**Frontend (Port 3000):**
```bash
# Create .env file in client directory
cd client
echo "PORT=3001" > .env
cd ..
```

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm run install-all
```

### Compilation Errors

```bash
# Clear cache and reinstall
cd client
rm -rf node_modules .cache
npm install
npm start
```

### Icon Import Errors

If you see errors like "export 'FiBed' was not found":
- The icon has been fixed to use available icons
- Run `npm install` in client directory if issues persist

## 📁 Project Structure

```
Hospital Management System/
├── client/                    # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context
│   │   └── firebase/         # Firebase config
│   └── package.json
├── server/                    # Express backend
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── middleware/           # Middleware functions
│   └── utils/                # Utility functions
├── .env                      # Environment variables
├── package.json              # Root package.json
└── README.md                 # Project documentation
```

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install-all

# Run development (server + client)
npm run dev

# Run server only
npm run server

# Run client only
npm run client

# Build for production
npm run build
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Main Modules
- `/api/patients` - Patient management
- `/api/appointments` - Appointment management
- `/api/medical-records` - Medical records
- `/api/billing` - Billing and payments
- `/api/pharmacy` - Pharmacy management
- `/api/laboratory` - Laboratory management
- `/api/wards` - Ward and bed management
- `/api/staff` - Staff management
- `/api/inventory` - Inventory management
- `/api/analytics` - Analytics and reports

## 🎯 Next Steps

1. ✅ Start the application: `npm run dev`
2. ✅ Create your first admin user via signup
3. ✅ Explore the dashboard
4. ✅ Create patients, appointments, etc.
5. ✅ Configure email/SMS services (optional)
6. ✅ Set up payment gateways (optional)

## 📝 Important Notes

- **Default Ports**: Backend (5000), Frontend (3000)
- **Database**: MongoDB Atlas (configured in `.env`)
- **Authentication**: JWT tokens (7-day expiry)
- **Password Reset**: Token expires in 1 hour
- **PWA**: Service worker enabled for offline support

## 🆘 Need Help?

- Check `FEATURES_IMPLEMENTATION.md` for feature details
- Check `COMPLETE_FEATURES_LIST.md` for complete feature list
- Check `ROLE_BASED_FEATURES.md` for role-based permissions

## 🎉 You're All Set!

Your comprehensive Hospital Management System is ready to use! 🏥

**Happy Coding!** 🚀
