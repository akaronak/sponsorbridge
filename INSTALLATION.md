# Eventra — Installation Guide

> Enterprise-grade sponsorship management platform.  
> This guide walks through local development setup. For production deployment, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## Prerequisites

| Tool          | Version   | Purpose                          |
|---------------|-----------|----------------------------------|
| **Java JDK**  | 17+       | Backend runtime                  |
| **Maven**     | 3.9+      | Backend build tool               |
| **Node.js**   | 18+       | Frontend toolchain               |
| **npm**       | 9+        | Frontend package manager         |
| **Docker**    | 24+       | MongoDB, Redis & RabbitMQ containers |
| **Git**       | 2.40+     | Version control                  |

---

## 1. Clone & Configure

```bash
git clone <repository-url> eventra
cd eventra
```

### Generate a JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Create Environment Files

```bash
# Root (used by docker-compose + mock server)
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET

# Backend
cp eventra-backend/.env.example eventra-backend/.env
# Edit — set JWT_SECRET (match root) + any API keys

# Frontend
cp eventra-frontend/.env.example eventra-frontend/.env.local
# Edit if needed (defaults work for local dev)
```

---

## 2. Start Infrastructure

```bash
# Start MongoDB (replica set) + Redis + RabbitMQ
docker compose up -d mongodb redis rabbitmq

# Wait for MongoDB to be healthy, then initialize the replica set
docker compose up mongodb-init
```

Verify:
```bash
docker compose ps          # All services should show "healthy"
mongosh --eval "rs.status()"  # Replica set initialized
```

> **RabbitMQ Management UI**: http://localhost:15672 (login: `eventra` / `eventra_dev`)
> STOMP port: 61613 | AMQP port: 5672

---

## 3. Backend Setup

```bash
cd eventra-backend

# Install dependencies & build
mvn clean install -DskipTests

# Run (dev profile)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend starts on **http://localhost:8080**.

Health check:
```bash
curl http://localhost:8080/actuator/health
```

---

## 4. Frontend Setup

```bash
cd eventra-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts on **http://localhost:3000** with API proxy to `:8080`.

---

## 5. Mock Server (Alternative to Spring Boot)

For rapid frontend development without the full Java backend:

```bash
# From project root
npm install  # Install root dependencies (express, ws, etc.)
node server-mock.js
```

Mock server starts on **http://localhost:8080** with all API endpoints + WebSocket messaging.

---

## 6. Docker Compose (Full Stack)

```bash
# Build and start everything
docker compose up --build -d

# Check logs
docker compose logs -f eventra-backend
```

> **Note:** `docker-compose.yml` requires `JWT_SECRET` to be set in `.env`.  
> The compose will fail fast with an error if it's missing.

---

## Environment Variables Reference

### Backend (Spring Boot)

| Variable                 | Required | Default                 | Description                    |
|--------------------------|----------|-------------------------|--------------------------------|
| `JWT_SECRET`             | **Yes**  | —                       | 256-bit+ signing key           |
| `MONGODB_URI`            | No       | `mongodb://localhost:27017/eventra` | MongoDB connection string |
| `REDIS_HOST`             | No       | `localhost`             | Redis hostname                 |
| `REDIS_PORT`             | No       | `6379`                  | Redis port                     |
| `REDIS_PASSWORD`         | No       | *(empty)*               | Redis auth password            |
| `CORS_ALLOWED_ORIGINS`   | No       | `http://localhost:3000,http://localhost:5173` | Comma-separated CORS origins |
| `GEMINI_API_KEY`         | No       | *(empty)*               | Google Gemini API key          |
| `RAZORPAY_KEY_ID`        | No       | *(empty)*               | Razorpay key ID                |
| `RAZORPAY_KEY_SECRET`    | No       | *(empty)*               | Razorpay key secret            |
| `CLOUDINARY_CLOUD_NAME`  | No       | *(empty)*               | Cloudinary cloud name          |
| `CLOUDINARY_API_KEY`     | No       | *(empty)*               | Cloudinary API key             |
| `CLOUDINARY_API_SECRET`  | No       | *(empty)*               | Cloudinary API secret          |
| `APP_NAME`               | No       | `eventra`         | White-label app name           |
| `STOMP_BROKER_RELAY_ENABLED` | No   | `false`                 | Enable RabbitMQ STOMP relay    |
| `RABBITMQ_HOST`          | No       | `localhost`             | RabbitMQ hostname              |
| `RABBITMQ_STOMP_PORT`    | No       | `61613`                 | RabbitMQ STOMP port            |
| `RABBITMQ_USER`          | No       | `guest`                 | RabbitMQ login                 |
| `RABBITMQ_PASS`          | No       | `guest`                 | RabbitMQ passcode              |
| `RABBITMQ_VHOST`         | No       | `/`                     | RabbitMQ virtual host          |

### Frontend (Vite)

| Variable                 | Required | Default                          | Description                |
|--------------------------|----------|----------------------------------|----------------------------|
| `VITE_API_URL`           | No       | `http://localhost:8080`          | Backend API base URL       |
| `VITE_WS_URL`            | No       | `ws://localhost:8080/ws`         | WebSocket endpoint         |
| `VITE_APP_NAME`          | No       | `Eventra`                  | White-label brand name     |
| `VITE_APP_TAGLINE`       | No       | `Connect Events with Perfect Sponsors` | Brand tagline       |
| `VITE_SUPPORT_EMAIL`     | No       | `support@example.com`            | Support contact email      |
| `VITE_LEGAL_ENTITY`      | No       | `Your Company Inc.`              | Legal entity name          |
| `VITE_DOMAIN`            | No       | `example.com`                    | Primary domain             |
| `VITE_RAZORPAY_KEY_ID`   | No       | *(empty)*                        | Razorpay public key        |

---

## Troubleshooting

| Issue                         | Solution                                                 |
|-------------------------------|----------------------------------------------------------|
| MongoDB connection refused    | Run `docker compose up -d mongodb` and wait for healthy  |
| JWT_SECRET error on startup   | Set `JWT_SECRET` in your `.env` file                     |
| CORS errors in browser        | Check `CORS_ALLOWED_ORIGINS` matches your frontend URL   |
| WebSocket won't connect       | Verify `VITE_WS_URL` matches backend address             |
| Redis connection refused      | Run `docker compose up -d redis`                         |
| RabbitMQ connection refused   | Run `docker compose up -d rabbitmq` and wait for healthy |
| STOMP relay won't connect     | Check `RABBITMQ_HOST`, `RABBITMQ_STOMP_PORT`, and credentials |
| Maven build fails             | Ensure JDK 17+ is installed: `java -version`             |
| Vite build fails              | Ensure Node 18+ is installed: `node -v`                  |

---

## White-Label Customization

To rebrand the platform for a different customer:

1. Set `VITE_APP_NAME`, `VITE_APP_TAGLINE`, `VITE_SUPPORT_EMAIL`, `VITE_LEGAL_ENTITY`, `VITE_DOMAIN` in frontend `.env`
2. Set `APP_NAME` in backend `.env` (affects MongoDB database name, cache prefix, metrics tags)
3. Replace `/public/vite.svg` with your logo
4. Rebuild: `npm run build` (frontend) + `mvn clean package` (backend)

No source code changes required.
