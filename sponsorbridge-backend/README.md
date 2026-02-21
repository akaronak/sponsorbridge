# SponsorBridge Backend

Spring Boot REST API for the SponsorBridge platform.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 12+

## Setup

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE sponsorbridge;
```

### 2. Configuration

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sponsorbridge
spring.datasource.username=your_username
spring.datasource.password=your_password
```

For Cloudinary integration, set environment variables:

```bash
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Build and Run

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Project Structure

```
src/main/java/com/sponsorbridge/
├── controller/       # REST API endpoints
├── service/          # Business logic
├── repository/       # Data access layer
├── entity/           # JPA entities
├── dto/              # Data transfer objects
├── security/         # JWT and authentication
├── config/           # Spring configuration
├── exception/        # Custom exceptions
└── util/             # Utility classes

src/test/java/com/sponsorbridge/
├── unit/             # Unit tests
└── property/         # Property-based tests
```

## Testing

### Run all tests

```bash
mvn test
```

### Run specific test class

```bash
mvn test -Dtest=AuthenticationPropertiesTest
```

### Run with coverage

```bash
mvn test jacoco:report
```

## API Documentation

See the design document for complete API endpoint specifications.

## Dependencies

- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- JWT (jjwt)
- Cloudinary
- jqwik (Property-based testing)
- TestContainers
