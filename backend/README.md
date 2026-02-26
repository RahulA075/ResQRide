# Roadside Assistance Backend API

A Node.js/Express backend API with Supabase integration for the Roadside Assistance mobile application.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **User Management** - Drivers, Service Providers, and Fleet Owners
- 🚨 **Emergency Requests** - Real-time emergency assistance requests
- 📍 **Location Services** - GPS-based provider matching and tracking
- ⭐ **Reviews & Ratings** - Service provider rating system
- 🔔 **Notifications** - Real-time notifications for users
- 🚗 **Fleet Management** - Vehicle and driver management for fleet owners
- 📊 **Analytics** - Service metrics and reporting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of database/schema.sql
   ```
3. Enable Row Level Security (RLS) policies as defined in the schema

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/location` - Update user location
- `GET /api/users/notifications` - Get user notifications
- `PATCH /api/users/notifications/:id/read` - Mark notification as read
- `GET /api/users/emergency-requests` - Get user's emergency requests

### Service Providers
- `GET /api/providers/nearby` - Find nearby service providers
- `GET /api/providers/:id` - Get provider details
- `PATCH /api/providers/:id/availability` - Update provider availability
- `POST /api/providers/:id/reviews` - Add provider review

### Services
- `GET /api/services/categories` - Get service categories
- `GET /api/services/provider/:providerId` - Get services by provider
- `POST /api/services` - Create new service (providers only)
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/my-services` - Get my services (providers only)

### Emergency Requests
- `POST /api/emergency/request` - Create emergency request
- `GET /api/emergency/request/:id` - Get emergency request status
- `POST /api/emergency/request/:id/accept` - Accept emergency request (providers)
- `PATCH /api/emergency/request/:id/status` - Update emergency status

### Tracking
- `GET /api/tracking/:sessionId` - Get tracking session
- `PATCH /api/tracking/:sessionId/location` - Update provider location
- `POST /api/tracking/:sessionId/updates` - Add tracking update
- `GET /api/tracking/:sessionId/updates` - Get tracking updates

## Database Schema

### Core Tables

- **users** - All user types (drivers, providers, fleet owners)
- **services** - Services offered by providers
- **emergency_requests** - Emergency assistance requests
- **reviews** - Provider reviews and ratings
- **notifications** - User notifications
- **tracking_updates** - Real-time communication during service
- **fleet_vehicles** - Fleet management (for fleet owners)

### Key Features

- **Row Level Security (RLS)** - Data access control at database level
- **PostGIS Extension** - Advanced location-based queries
- **Automated Timestamps** - Created/updated timestamps with triggers
- **Materialized Views** - Optimized queries for provider data

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Different permissions for user types
- **Rate Limiting** - API request rate limiting
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Cross-origin request security

## Development

### Project Structure

```
backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── database/        # Database schema and migrations
├── tests/           # Test files
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

### Adding New Features

1. Create route handlers in `routes/`
2. Add validation schemas in `middleware/validation.js`
3. Update database schema if needed
4. Add tests for new endpoints
5. Update API documentation

### Testing

```bash
npm test
```

## Deployment

### Environment Variables

Ensure all production environment variables are set:

- `NODE_ENV=production`
- `SUPABASE_URL` - Your production Supabase URL
- `SUPABASE_ANON_KEY` - Production anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Production service role key
- `JWT_SECRET` - Strong production JWT secret

### Health Check

The API includes a health check endpoint:

```
GET /health
```

Returns server status and environment information.

## Support

For issues and questions:

1. Check the API documentation
2. Review the database schema
3. Check server logs for errors
4. Verify environment configuration

## License

MIT License - see LICENSE file for details.