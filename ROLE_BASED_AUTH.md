# Role-Based Authentication & Signup

The Hospital Management System now supports role-based signup and login for different user types.

## Supported Roles

1. **Patient** - Can view their own appointments, bills, and medical records
2. **Doctor** - Can manage patients, appointments, and medical records
3. **Lab Technician** - Can access and update medical records, lab test results
4. **Admin** - Full system access
5. **Nurse** - Can access patient care, appointments, and medical records
6. **Receptionist** - Can manage patient registration, appointments, and billing

## Signup Process

### How to Sign Up

1. Navigate to the Signup page:
   - Click "Sign Up" link on the login page, OR
   - Go directly to: http://localhost:3000/signup

2. Fill in the registration form:
   - **Required Fields:**
     - First Name
     - Last Name
     - Email
     - Password (minimum 6 characters)
     - Confirm Password
     - Account Type (Role)

   - **Optional Fields:**
     - Phone Number

3. **Role-Specific Fields:**
   
   **For Doctors:**
   - Specialization (e.g., Cardiology, Pediatrics)
   - License Number
   - Department (e.g., Emergency, Surgery)
   
   **For Lab Technicians:**
   - Department (e.g., Pathology, Radiology)

4. Click "Create Account"

5. After successful registration, you'll be automatically logged in and redirected to the dashboard.

## Login Process

1. Navigate to: http://localhost:3000/login
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard based on your role

## Role-Based Access

### Dashboard Access
- All roles can access the dashboard

### Patients Module
- **Accessible by:** Admin, Doctor, Nurse, Receptionist
- **Features:** View, create, edit, delete patients

### Appointments Module
- **Accessible by:** Admin, Doctor, Nurse, Receptionist, Patient
- **Features:** 
  - Patients can view their own appointments
  - Staff can manage all appointments

### Medical Records Module
- **Accessible by:** Admin, Doctor, Nurse, Lab Technician
- **Features:**
  - View medical records
  - Create/update records (Doctor, Admin, Lab)
  - Lab technicians can update lab test results

### Billing Module
- **Accessible by:** Admin, Receptionist, Patient
- **Features:**
  - Patients can view their bills
  - Staff can create and manage bills

### Inventory Module
- **Accessible by:** Admin, Receptionist
- **Features:** Manage hospital inventory

### Analytics Module
- **Accessible by:** Admin only
- **Features:** View system analytics and reports

## API Endpoints

### Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "1234567890"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Security Features

1. **Password Requirements:**
   - Minimum 6 characters
   - Passwords are hashed using bcrypt
   - Never stored in plain text

2. **JWT Authentication:**
   - Tokens expire after 7 days
   - Secure token-based authentication

3. **Role-Based Authorization:**
   - Each route checks user role
   - Unauthorized access is blocked

4. **Input Validation:**
   - Email format validation
   - Required field validation
   - Role validation

## Example User Creation

### Create a Patient
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "Patient123",
  "role": "patient",
  "phone": "9876543210"
}
```

### Create a Doctor
```json
{
  "firstName": "Dr. John",
  "lastName": "Williams",
  "email": "doctor@hospital.com",
  "password": "Doctor123",
  "role": "doctor",
  "phone": "5551234567",
  "specialization": "Cardiology",
  "licenseNumber": "MD12345",
  "department": "Cardiology"
}
```

### Create a Lab Technician
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "lab@hospital.com",
  "password": "Lab123",
  "role": "lab",
  "phone": "5559876543",
  "department": "Pathology"
}
```

## Notes

- All users can create accounts themselves through the signup page
- Email addresses must be unique
- After registration, users are automatically logged in
- Users can access features based on their assigned role
- Admin users have full system access

