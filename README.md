<<<<<<< HEAD
# Hospital Management System

A comprehensive, modern Hospital Management System built with React and Node.js/Express. This system provides a complete solution for managing hospital operations including patient management, appointments, medical records, billing, inventory, and analytics.

## Features

### Core Modules

1. **Patient Management**
   - Patient registration and profile management
   - Patient search and filtering
   - Medical history tracking
   - Emergency contact information

2. **Appointment Scheduling**
   - Book appointments with doctors
   - Calendar view of appointments
   - Appointment status management
   - Multiple appointment types (consultation, follow-up, checkup, emergency, surgery)

3. **Medical Records**
   - Digital medical records
   - Diagnosis and symptoms tracking
   - Prescription management
   - Lab test results
   - Vital signs recording

4. **Billing System**
   - Invoice generation
   - Payment tracking
   - Multiple payment methods
   - Insurance claims
   - Payment history

5. **Inventory Management**
   - Medicine and equipment tracking
   - Stock level monitoring
   - Low stock alerts
   - Inventory transactions
   - Supplier information

6. **Analytics Dashboard**
   - Real-time statistics
   - Revenue analytics
   - Appointment statistics
   - Patient demographics
   - Visual charts and graphs

### User Roles

- **Admin**: Full system access
- **Doctor**: Patient records, appointments, medical records
- **Nurse**: Patient care, appointments, medical records
- **Receptionist**: Patient registration, appointments, billing
- **Patient**: View own appointments, bills, and records

## Technology Stack
## Pushing to GitHub

This project can be pushed to your GitHub repository. The repository field in `package.json` is already set to:

```
https://github.com/Saurabhdoiphode/Hospital_Management_System.git
```

If you haven't initialized Git in this folder yet, open PowerShell at the root and run:

```powershell
git init
git add .
git commit -m "Initial commit: Hospital Management System"
git remote add origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git
git branch -M main
git push -u origin main
```

If you already have a different remote configured, change it with:

```powershell
git remote set-url origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git
git push -u origin main
```

See `GIT_PUSH.md` for additional details and troubleshooting steps.

### Authentication & Common Push Problems

- If Git prompts for credentials and you have two-factor authentication (2FA), create a GitHub Personal Access Token (PAT) and use that as the password: https://github.com/settings/tokens
- To avoid entering PAT each time, install the Git Credential Manager (GCM): https://aka.ms/gcm
- To use SSH instead of HTTPS (recommended for CI and personal machines), generate an SSH key and add it to your GitHub account:
   - `ssh-keygen -t ed25519 -C "your_email@example.com"`
   - `cat ~/.ssh/id_ed25519.pub` then copy and add the key to https://github.com/settings/ssh/new
   - Update the remote to the SSH URL: `git remote set-url origin git@github.com:Saurabhdoiphode/Hospital_Management_System.git`

If pushing fails due to unrelated histories (remote already has commits), use:

```powershell
git pull origin main --allow-unrelated-histories
```

Or only if you want to overwrite remote completely:

```powershell
git push -f origin main
```

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Firebase (Authentication, Firestore, Storage)
- Recharts for data visualization
- React Icons
- React Toastify for notifications
- Date-fns for date formatting

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Express Validator for input validation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance) - Optional if using Firebase Firestore
- Firebase account with project setup
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Hospital Management System"
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/hospital-management
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

   **Firebase Configuration:**
   - Firebase is already configured in `client/src/firebase/config.js` with your project credentials
   - Make sure to enable Authentication and Firestore in your Firebase Console
   - Set up Firestore security rules (see `client/src/firebase/README.md`)

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend development server (port 3000).

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Credentials

For testing purposes, you can create accounts through the registration page or use these demo credentials (after creating them):

- **Admin**: admin@hospital.com / Admin123
- **Doctor**: doctor@hospital.com / Doctor123
- **Patient**: patient@hospital.com / Patient123

## Project Structure

```
Hospital Management System/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── index.js          # Server entry point
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Medical Records
- `GET /api/medical-records` - Get all records
- `POST /api/medical-records` - Create record
- `PUT /api/medical-records/:id` - Update record

### Billing
- `GET /api/billing` - Get all bills
- `POST /api/billing` - Create bill
- `POST /api/billing/:id/payment` - Record payment

### Inventory
- `GET /api/inventory` - Get all items
- `POST /api/inventory` - Add item
- `PUT /api/inventory/:id` - Update item

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/appointments` - Appointment stats
- `GET /api/analytics/revenue` - Revenue stats

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- Secure API endpoints

## Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## Firebase Integration

The system includes Firebase integration for:
- **Authentication**: User authentication with Firebase Auth
- **Firestore**: NoSQL database for storing application data
- **Storage**: File storage for medical documents and profile pictures

### Switching Between Firebase and Backend API

In `client/src/context/AuthContext.js`, you can toggle between Firebase and backend API:
- Set `USE_FIREBASE = true` to use Firebase Auth and Firestore
- Set `USE_FIREBASE = false` to use the Express backend with MongoDB

See `client/src/firebase/README.md` for detailed Firebase setup instructions.

## Future Enhancements

- Email notifications
- SMS alerts
- File upload for medical documents (Firebase Storage ready)
- Advanced reporting
- Multi-language support
- Integration with lab systems
- Telemedicine features
- Real-time updates with Firebase

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For support, email support@hospital.com or create an issue in the repository.

---

Built with ❤️ for efficient hospital management

=======
# Hospital_Management_System
>>>>>>> e3c0f89eddbe276c59a7fc070e30bee5190c9b39
