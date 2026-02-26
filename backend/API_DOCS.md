# Roadside Assistance API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **driver** - End users who need roadside assistance
- **service_provider** - Mechanics, towing services, etc.
- **fleet_owner** - Manages multiple vehicles and drivers

## API Endpoints

### 🔐 Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+91-9876543210",
  "role": "driver",
  "businessName": "Quick Fix Auto", // Required for service_provider
  "businessAddress": "123 Main St", // Required for service_provider
  "services": ["mechanical", "electrical"] // Optional for service_provider
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 👤 User Management

#### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phone": "+91-9876543211"
}
```

#### Update Location
```http
PATCH /users/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 9.9252,
  "longitude": 78.1198
}
```

### 🔍 Service Providers

#### Find Nearby Providers
```http
GET /providers/nearby?latitude=9.9252&longitude=78.1198&radius=25&serviceType=mechanical
Authorization: Bearer <token>
```

Query Parameters:
- `latitude` (required) - User's latitude
- `longitude` (required) - User's longitude  
- `radius` (optional) - Search radius in km (default: 25)
- `serviceType` (optional) - Filter by service type
- `vehicleType` (optional) - Filter by vehicle type

#### Get Provider Details
```http
GET /providers/{providerId}
Authorization: Bearer <token>
```

### 🚨 Emergency Requests

#### Create Emergency Request
```http
POST /emergency/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": {
    "latitude": 9.9252,
    "longitude": 78.1198
  },
  "description": "Car won't start, need help",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "licensePlate": "TN-01-AB-1234"
  },
  "serviceType": "mechanical"
}
```

#### Accept Emergency Request (Service Provider)
```http
POST /emergency/request/{requestId}/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "estimatedArrival": 15
}
```

#### Update Emergency Status
```http
PATCH /emergency/request/{requestId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "location": {
    "latitude": 9.9252,
    "longitude": 78.1198
  }
}
```

### 🛠️ Services

#### Get Service Categories
```http
GET /services/categories
```

#### Create Service (Service Provider)
```http
POST /services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engine Repair",
  "category": "mechanical",
  "description": "Complete engine diagnosis and repair",
  "basePrice": 2500.00
}
```

### 📍 Tracking

#### Get Tracking Session
```http
GET /tracking/{sessionId}
Authorization: Bearer <token>
```

#### Update Provider Location
```http
PATCH /tracking/{sessionId}/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 9.9252,
  "longitude": 78.1198
}
```

#### Add Tracking Update
```http
POST /tracking/{sessionId}/updates
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "On my way, ETA 10 minutes",
  "updateType": "eta"
}
```

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- **100 requests per 15 minutes** per IP address
- Rate limit headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phone": "+91-9876543210",
    "role": "driver"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:3001/api`
   - `token`: Your JWT token after login
3. Use `{{base_url}}` and `{{token}}` in your requests

## Database Schema

The API uses Supabase (PostgreSQL) with the following main tables:

- `users` - All user types and profiles
- `services` - Services offered by providers
- `emergency_requests` - Emergency assistance requests
- `reviews` - Provider reviews and ratings
- `notifications` - User notifications
- `tracking_updates` - Real-time communication
- `fleet_vehicles` - Fleet management

## Security Features

- JWT authentication with configurable expiration
- Role-based access control (RBAC)
- Row Level Security (RLS) in database
- Input validation with Joi schemas
- Rate limiting to prevent abuse
- CORS configuration for frontend integration
- Helmet.js for security headers