# Eventra Setup Guide

Complete setup instructions for the Eventra platform.

## Project Structure

```
Eventra/
├── Eventra-backend/    # Spring Boot API
├── Eventra-frontend/   # React frontend
├── docker-compose.yml        # PostgreSQL setup
└── SETUP_GUIDE.md           # This file
```

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Docker & Docker Compose (optional, for PostgreSQL)
- PostgreSQL 12+ (if not using Docker)

## Quick Start

### 1. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432` with:
- Database: `Eventra`
- Username: `postgres`
- Password: `postgres`

#### Option B: Manual PostgreSQL Setup

```sql
CREATE DATABASE Eventra;
```

### 2. Backend Setup

```bash
cd Eventra-backend

# Copy environment file
cp .env.example .env.local

# Update application.properties if needed
# src/main/resources/application.properties

# Build
mvn clean install

# Run
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd Eventra-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Configuration

### Backend Configuration

Edit `Eventra-backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/Eventra
spring.datasource.username=postgres
spring.datasource.password=postgres

# JWT (change in production)
jwt.secret=your-secret-key-change-this-in-production
jwt.expiration=86400000

# Cloudinary (optional)
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

### Frontend Configuration

Edit `Eventra-frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Directory Structure

### Backend

```
Eventra-backend/
├── src/main/java/com/Eventra/
│   ├── controller/       # REST endpoints
│   ├── service/          # Business logic
│   ├── repository/       # Data access
│   ├── entity/           # JPA entities
│   ├── dto/              # Data transfer objects
│   ├── security/         # JWT & auth
│   ├── config/           # Spring config
│   ├── exception/        # Custom exceptions
│   └── util/             # Utilities
├── src/test/java/com/Eventra/
│   ├── unit/             # Unit tests
│   └── property/         # Property-based tests
├── pom.xml               # Maven configuration
└── README.md
```

### Frontend

```
Eventra-frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── context/          # React context
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   ├── assets/           # Static files
│   ├── App.tsx           # Main component
│   └── main.tsx          # Entry point
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README_SETUP.md
```

## Testing

### Backend Tests

```bash
cd Eventra-backend

# Run all tests
mvn test

# Run specific test
mvn test -Dtest=AuthenticationPropertiesTest

# Run with coverage
mvn test jacoco:report
```

### Frontend Tests

```bash
cd Eventra-frontend

# Run tests (when configured)
npm run test

# Run linting
npm run lint
```

## Development Workflow

1. Start PostgreSQL: `docker-compose up -d`
2. Start backend: `cd Eventra-backend && mvn spring-boot:run`
3. Start frontend: `cd Eventra-frontend && npm run dev`
4. Access frontend at `http://localhost:5173`
5. API available at `http://localhost:8080`

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker-compose ps`
- Check credentials in `application.properties`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use

- Backend (8080): `lsof -i :8080` and kill the process
- Frontend (5173): `lsof -i :5173` and kill the process
- PostgreSQL (5432): `lsof -i :5432` and kill the process

### Maven Build Issues

```bash
# Clear Maven cache
mvn clean

# Rebuild
mvn install
```

### Node Modules Issues

```bash
# Clear node modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Production Deployment

### Backend

1. Update `application.properties` with production database
2. Set strong JWT secret
3. Configure Cloudinary credentials
4. Build: `mvn clean package`
5. Run: `java -jar target/Eventra-backend-1.0.0.jar`

### Frontend

1. Update `.env` with production API URL
2. Build: `npm run build`
3. Deploy `dist/` folder to static hosting

## Next Steps

- Task 2: Implement database schema and JPA entities
- Task 3: Implement authentication and security infrastructure
- Task 4: Implement DTOs and validation
- ... (see tasks.md for complete task list)

## Support

For issues or questions, refer to:
- Backend: `Eventra-backend/README.md`
- Frontend: `Eventra-frontend/README_SETUP.md`
- Design: `.kiro/specs/sponsor-bridge/design.md`
- Requirements: `.kiro/specs/sponsor-bridge/requirements.md`
