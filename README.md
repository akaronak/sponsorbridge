# Eventra - Sponsorship Management Platform

A comprehensive platform that connects event organizers with companies seeking sponsorship opportunities. Eventra streamlines the sponsorship process by enabling organizers to create and manage sponsorship requests while allowing companies to discover and engage with events.

![Status](https://img.shields.io/badge/status-active-success)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Event Organizers
- **Create Sponsorship Requests** - Post detailed event sponsorship needs
- **Manage Requests** - Track request status and updates in real-time
- **Direct Messaging** - Communicate with potential sponsors
- **Profile Management** - Showcase event details and past sponsorships
- **Proposal Sharing** - Attach and share event proposals

### For Companies
- **Discover Events** - Browse and filter sponsorship opportunities
- **Smart Matching** - Find events aligned with sponsorship goals
- **Budget Management** - Set budget ranges and preferences
- **Direct Communication** - Message organizers directly
- **Sponsorship History** - Track past and current sponsorships
- **Verification Badge** - Build trust with verified status

### Admin Features
- **User Management** - Manage organizers and companies
- **Platform Analytics** - View statistics and platform metrics
- **Moderation** - Review and approve user profiles
- **Support Tools** - File upload management and utilities

## 🛠 Tech Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 21
- **Database:** PostgreSQL with JPA/Hibernate
- **Authentication:** JWT (JSON Web Tokens)
- **API:** RESTful API with Spring Web
- **Build Tool:** Maven
- **Testing:** JUnit 5, Mockito, Spring Boot Test

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Context API
- **HTTP Client:** Axios
- **UI Components:** Custom React Components

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Version Control:** Git & GitHub
- **CI/CD:** GitHub Actions (configured)

## 📁 Project Structure

```
Eventra/
├── Eventra-backend/          # Spring Boot Backend
│   ├── src/
│   │   ├── main/java/com/Eventra/
│   │   │   ├── controller/         # REST Controllers
│   │   │   ├── service/            # Business Logic
│   │   │   ├── repository/         # Data Access Layer
│   │   │   ├── entity/             # JPA Entities
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── mapper/             # Entity Mappers
│   │   │   ├── config/             # Configuration Classes
│   │   │   ├── security/           # Security Components
│   │   │   ├── exception/          # Custom Exceptions
│   │   │   └── util/               # Utility Classes
│   │   ├── test/java/com/Eventra/
│   │   │   ├── service/            # Service Tests
│   │   │   └── controller/         # Controller Tests
│   │   └── resources/
│   │       ├── application.properties
│   │       └── schema.sql
│   ├── pom.xml                     # Maven Dependencies
│   └── Dockerfile
│
├── Eventra-frontend/         # React Frontend
│   ├── src/
│   │   ├── components/             # React Components
│   │   ├── pages/                  # Page Components
│   │   ├── services/               # API Services
│   │   ├── context/                # Context API
│   │   ├── hooks/                  # Custom Hooks
│   │   ├── types/                  # TypeScript Types
│   │   ├── utils/                  # Utilities
│   │   ├── assets/                 # Static Assets
│   │   └── App.tsx                 # Main App Component
│   ├── public/                     # Static Files
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml              # Docker Compose Configuration
├── .gitignore
├── README.md                       # This File
└── SETUP_GUIDE.md                  # Detailed Setup Instructions

```

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** and npm/yarn
- **PostgreSQL 13+** (or use Docker)
- **Maven 3.8+**
- **Git**

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akaronak/Eventra.git
   cd Eventra
   ```

2. **Build and start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

## 📦 Installation

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Eventra-backend
   ```

2. **Install dependencies:**
   ```bash
   mvn clean install
   ```

3. **Configure database:**
   - Create a PostgreSQL database named `Eventra`
   - Update `src/main/resources/application.properties`:
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/Eventra
     spring.datasource.username=postgres
     spring.datasource.password=your_password
     ```

4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Eventra-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (.env):**
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## ⚙️ Configuration

### Backend Configuration (application.properties)

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/Eventra
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# JWT Configuration
app.jwtSecret=your_secret_key_here
app.jwtExpirationMs=86400000

# File Upload
app.file.upload.dir=uploads/
app.file.max-size=10485760
```

### Frontend Configuration (.env)

```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Eventra
```

## 📚 API Documentation

### Authentication Endpoints

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout

### Organizer Endpoints

- **GET** `/api/organizers` - List all organizers
- **GET** `/api/organizers/{id}` - Get organizer details
- **POST** `/api/organizers` - Create new organizer
- **PUT** `/api/organizers/{id}` - Update organizer

### Company Endpoints

- **GET** `/api/companies` - List all companies
- **GET** `/api/companies/{id}` - Get company details
- **POST** `/api/companies` - Create new company
- **PUT** `/api/companies/{id}` - Update company

### Sponsorship Request Endpoints

- **GET** `/api/requests` - List all requests
- **GET** `/api/requests/{id}` - Get request details
- **POST** `/api/requests` - Create new request
- **PUT** `/api/requests/{id}` - Update request
- **DELETE** `/api/requests/{id}` - Delete request

### Message Endpoints

- **POST** `/api/messages` - Send message
- **GET** `/api/messages/request/{requestId}` - Get messages for a request

For detailed API documentation, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🧪 Testing

### Run Backend Tests

```bash
cd Eventra-backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Run with coverage
mvn test jacoco:report
```

### Run Frontend Tests

```bash
cd Eventra-frontend

# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## 🐳 Docker Deployment

### Build Images

```bash
# Backend
cd Eventra-backend
docker build -t Eventra-backend:latest .

# Frontend
cd Eventra-frontend
docker build -t Eventra-frontend:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f
```

## 📋 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Eventra
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_secret_key
JWT_EXPIRATION=86400000
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Eventra
VITE_APP_VERSION=1.0.0
```

## 📖 Additional Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment guide
- [Frontend Setup](./Eventra-frontend/README_SETUP.md) - Frontend-specific setup
- [Frontend Design](./FRONTEND_DESIGN_SUMMARY.md) - UI/UX design documentation

## 🐛 Known Issues

- Lombok compatibility issue with Java 21 (compiler requires updated Lombok version)
- Line ending differences between Windows and Unix systems (handled by .gitignore)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Code Style Guidelines
- Follow Google Java Style Guide for backend
- Use ESLint configuration for frontend
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Developer Team** - Initial work and ongoing development

## 📞 Support

For support, email support@Eventra.com or create an issue on GitHub.

## 🔗 Links

- **GitHub Repository:** https://github.com/akaronak/Eventra
- **Issue Tracker:** https://github.com/akaronak/Eventra/issues
- **Documentation:** See repository wiki

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Payment integration
- [ ] Email notifications
- [ ] Video conferencing integration
- [ ] AI-powered event recommendations
- [ ] Multi-language support

---

**Last Updated:** February 2026

Made with ❤️ by the Eventra Team
