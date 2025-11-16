# Unique ID System Implementation

## ID Format
All users now receive a unique ID automatically upon registration in the following format:

### Patient ID
**Format:** `DDMMYYP###`
- **DDMMYY**: Date of registration (e.g., 151224 for 15-12-2024)
- **P**: Patient identifier
- **###**: Sequential number (padded with zeros, e.g., 001, 002, 003)

**Example:** `151224p001` (First patient registered on 15-12-2024)

### Doctor ID
**Format:** `DDMMDYD###`
- **DDMMYY**: Date of registration
- **D**: Doctor identifier
- **###**: Sequential number (padded with zeros)

**Example:** `151224d001` (First doctor registered on 15-12-2024)

### Emergency Doctor ID
**Format:** `DDMMYYED##`
- **DDMMYY**: Date of registration
- **ED**: Emergency Doctor identifier
- **##**: Sequential number (padded with zeros, e.g., 01, 02, 03)

**Example:** `151224ed01` (First emergency doctor registered on 15-12-2024)

## How It Works

1. **Automatic Generation**: When a user registers, their role determines their ID type
   - Role: `patient` → ID type: `p`
   - Role: `doctor` → ID type: `d`
   - Role: `doctor` with `isEmergency: true` → ID type: `ed`

2. **Daily Sequential**: Each day starts fresh
   - 15-12-2024: `151224p001`, `151224p002`, etc.
   - 16-12-2024: `161224p001` (starts from 001 again)

3. **Unique Index**: Each ID is unique across the entire system
   - MongoDB enforces uniqueness with sparse index

## Database Fields

Added to User model:
```javascript
uniqueId: {
  type: String,
  unique: true,
  sparse: true
}
```

Also added for emergency doctors:
```javascript
isEmergency: {
  type: Boolean,
  default: false
}
```

## API Response

When a user registers or logs in, their response includes:
```json
{
  "token": "...",
  "user": {
    "_id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "patient",
    "uniqueId": "151224p001",
    "phone": "...",
    "isActive": true
  }
}
```

## Testing

### To Test Patient Registration:
1. Sign up as a patient
2. Check the response - you'll see `uniqueId` field like `151224p001`
3. Sign up another patient same day - you'll see `151224p002`

### To Test Doctor Registration:
1. Sign up as a doctor
2. You'll get `uniqueId` like `151224d001`

### To Test Emergency Doctor:
1. Register a doctor with `isEmergency: true`
2. You'll get `uniqueId` like `151224ed01`

## Frontend Display

The unique ID is automatically displayed in:
- User profile
- Appointments (patient and doctor info)
- Laboratory requests
- Medical records
- Any user listing

## Important Notes

- IDs are generated automatically - no manual entry needed
- Format resets daily for sequential numbering
- All existing users who registered before this update won't have a uniqueId (it's optional)
- New registrations from now on will all have unique IDs
