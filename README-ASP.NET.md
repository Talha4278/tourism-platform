# Tourism Platform - ASP.NET Core Backend

This is the ASP.NET Core Web API backend that replaces the Node.js Express server.

## Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022 or VS Code (optional)

## Quick Start

1. **Install .NET 8.0 SDK** (if not already installed)
   - Download from: https://dotnet.microsoft.com/download/dotnet/8.0

2. **Run the application**
   ```bash
   # Option 1: Use the PowerShell script
   .\run-aspnet.ps1
   
   # Option 2: Manual commands
   cd TourismPlatform.API
   dotnet restore
   dotnet run
   ```

3. **Access the application**
   - API: https://localhost:5001 or http://localhost:5000
   - Swagger UI: https://localhost:5001/swagger
   - Frontend: http://localhost:3000 (your existing frontend)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tours
- `GET /api/tours` - Get all tours (with filters)
- `GET /api/tours/{id}` - Get tour by ID
- `GET /api/tours/popular` - Get popular tours
- `GET /api/tours/destinations` - Get all destinations
- `GET /api/tours/agency` - Get agency's tours (requires auth)
- `POST /api/tours` - Create tour (requires agency auth)
- `PUT /api/tours/{id}` - Update tour (requires agency auth)
- `DELETE /api/tours/{id}` - Delete tour (requires agency auth)

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings` - Get user's bookings (requires auth)
- `GET /api/bookings/{id}` - Get booking by ID (requires auth)
- `PUT /api/bookings/{id}/status` - Update booking status (requires agency auth)
- `PUT /api/bookings/{id}/cancel` - Cancel booking (requires tourist auth)
- `GET /api/bookings/stats` - Get booking statistics (requires agency auth)
- `GET /api/bookings/recent` - Get recent bookings (requires agency auth)

### Reviews
- `POST /api/reviews` - Create review (requires tourist auth)
- `GET /api/reviews/tour/{tourId}` - Get reviews for tour
- `GET /api/reviews/tour/{tourId}/rating` - Get tour rating statistics
- `GET /api/reviews/agency/{agencyUserId}/rating` - Get agency rating
- `GET /api/reviews/my-reviews` - Get user's reviews (requires tourist auth)
- `GET /api/reviews/tour/{tourId}/my-review` - Get user's review for tour (requires tourist auth)
- `PUT /api/reviews/{id}` - Update review (requires tourist auth)
- `DELETE /api/reviews/{id}` - Delete review (requires tourist auth)
- `GET /api/reviews/agency/recent` - Get recent reviews for agency (requires agency auth)

## Database

The application uses SQLite database located at `../server/database.sqlite`. The database will be automatically created when you first run the application.

## Configuration

Update `appsettings.json` to configure:
- Database connection string
- JWT settings (secret key, issuer, audience)
- CORS settings

## Frontend Integration

Your existing frontend should work with minimal changes. The API endpoints are designed to be compatible with your existing JavaScript code. You may need to update the base URL from `http://localhost:3000/api` to `https://localhost:5001/api` or `http://localhost:5000/api`.

## Migration from Node.js

The ASP.NET Core API provides the same functionality as your Node.js backend:
- Same API endpoints and request/response formats
- Same authentication mechanism (JWT)
- Same database structure
- Same business logic

## Development

- Use `dotnet watch run` for hot reload during development
- Use Swagger UI for API testing
- Entity Framework migrations are handled automatically
- Logs are written to console and can be configured in `appsettings.json`
