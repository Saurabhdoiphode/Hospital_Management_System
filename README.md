# Hospital Management System

A comprehensive, modern Hospital Management System built with React and Node.js/Express. This system provides a complete solution for managing hospital operations including patient management, appointments, medical records, billing, inventory, and analytics.

## Features

### Core Modules
- **Patient Management**: Registration, profile tracking, medical history, emergency contacts, search & filter.
- **Appointment Scheduling**: Doctor booking, status updates (`Scheduled`, `Completed`, `Cancelled`), appointment types.
- **Medical Records**: Digital diagnosis, symptoms, prescriptions, lab results, vitals tracking.
- **Billing System**: Invoice generation, payment tracking, payment methods (Cash, Card, Insurance), payment history.
- **Inventory Management**: Medicine & equipment stock monitoring, low-stock alerts, supplier information.
- **Analytics Dashboard**: Interactive charts (Recharts) for revenue, appointment trends, and patient demographics.

### User Roles
- **Admin**: Full system access
- **Doctor**: Patient records, appointments, medical records & prescriptions
- **Nurse**: Patient care, appointment queue, vitals recording
- **Receptionist**: Patient registration, appointment booking, billing & invoicing
- **Patient**: View own appointments, medical records, and bills

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```
2. **Start Dev Servers**:
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:3000` (or `http://localhost:5173`)
   - Backend API runs on `http://localhost:5000`

## Demo Credentials
On the login screen, click any of the preset role buttons to log in instantly:
- **Admin**: `admin@hospital.com` / `Admin123`
- **Doctor**: `doctor@hospital.com` / `Doctor123`
- **Nurse**: `nurse@hospital.com` / `Nurse123`
- **Receptionist**: `receptionist@hospital.com` / `Recept123`
- **Patient**: `patient@hospital.com` / `Patient123`
