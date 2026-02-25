# Eventra — Architecture Guide

> A white-label-ready Sponsorship Management Platform connecting event organizers with corporate sponsors.

---

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Backend Architecture](#backend-architecture)
  - [Package Structure](#package-structure)
  - [REST API Endpoints](#rest-api-endpoints)
  - [WebSocket / STOMP Messaging](#websocket--stomp-messaging)
  - [Security Architecture](#security-architecture)
  - [Payment & Escrow Flow](#payment--escrow-flow)
- [Frontend Architecture](#frontend-architecture)
  - [Directory Structure](#frontend-directory-structure)
  - [Routing](#routing)
  - [State Management](#state-management)
- [Data Model](#data-model)
- [Infrastructure](#infrastructure)
- [Configuration Reference](#configuration-reference)
- [White-Label Customization](#white-label-customization)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  React 18 + TypeScript + Vite 5 + Tailwind CSS                 │
│  STOMP over WebSocket (@stomp/stompjs)                          │
└─────────┬───────────────────────────────────┬───────────────────┘
          │ HTTPS (REST API)                  │ WSS (STOMP)
          ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Spring Boot 3 (Java 17+)                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Auth /   │  │ Business │  │ WebSocket │  │   Payments    │  │
│  │ Security  │  │  Logic   │  │  Broker   │  │   (Razorpay)  │  │
│  └──────────┘  └──────────┘  └─────┬─────┘  └───────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ Rate     │  │ Escrow / │  │   AI Chat  │  │  File Upload  │  │
│  │ Limiting │  │ Disputes │  │  (Gemini)  │  │ (Cloudinary)  │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
└─────────┬───────────────────────┬───────────────┬───────────────┘
          │                       │               │
          ▼                       ▼               ▼
┌───────────────────────┐ ┌───────────────┐ ┌───────────────────────┐
│    MongoDB 7.0        │ │  Redis 7.4    │ │  RabbitMQ 3.13        │
│  (Replica Set rs0)    │ │ ┌───────────┐ │ │  ┌─────────────────┐  │
│  • Users              │ │ │ Cache     │ │ │  │ STOMP Relay     │  │
│  • Companies          │ │ │ Rate Limit│ │ │  │ (port 61613)    │  │
│  • Organizers         │ │ │ Idempotent│ │ │  │ Horizontal      │  │
│  • Requests           │ │ │ Sessions  │ │ │  │ Scaling         │  │
│  • Conversations      │ │ └───────────┘ │ │  └─────────────────┘  │
│  • Payments           │ └───────────────┘ │  Management UI :15672 │
│  • Notifications      │                   └───────────────────────┘
└───────────────────────┘
```

External services:

| Service     | Purpose                              |
| ----------- | ------------------------------------ |
| Razorpay    | Payment gateway (checkout, refunds, webhooks) |
| Cloudinary  | File/image upload and CDN            |
| Google Gemini 2.0 Flash | AI-powered sponsor recommendations |

---

## Technology Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Frontend    | React 18, TypeScript, Vite 5, Tailwind CSS, Framer Motion |
| API Client  | Axios with interceptors              |
| Real-time   | STOMP over WebSocket (`@stomp/stompjs`) |
| Backend     | Spring Boot 3, Java 17+, Spring Security, Spring WebSocket |
| Database    | MongoDB 7.0 (replica set for transactions) |
| Cache       | Redis 7.4 (Lettuce client)           |
| Messaging   | RabbitMQ 3.13 (STOMP broker relay for horizontal scaling) |
| Payments    | Razorpay Java SDK                    |
| AI          | Google Gemini 2.0 Flash (REST)       |
| File Upload | Cloudinary SDK                       |
| Container   | Docker + Docker Compose              |

---

## Backend Architecture

### Package Structure

```
com.eventra/
├── EventraApplication.java          # Spring Boot entry point
├── config/                          # Framework configuration
│   ├── CacheConfig.java             # Redis cache manager
│   ├── CloudinaryConfig.java        # Cloudinary SDK bean
│   ├── MongoConfig.java             # MongoDB transaction manager
│   ├── MongoIndexConfig.java        # Database index definitions
│   ├── PaymentProperties.java       # Payment config properties
│   ├── RateLimitProperties.java     # Rate limit config properties
│   ├── RedisConfig.java             # Redis connection + template
│   ├── SecurityConfig.java          # Spring Security filter chain
│   ├── WebConfig.java               # CORS configuration
│   ├── WebSocketAuthConfig.java     # WebSocket STOMP auth interceptor
│   └── WebSocketConfig.java         # STOMP broker configuration
├── controller/                      # REST + WebSocket controllers
├── dto/                             # Request/response data transfer objects
├── entity/                          # MongoDB document entities
├── exception/                       # Custom exceptions + global handler
├── filter/                          # Servlet filters (rate limiting)
├── infrastructure/                  # Cross-cutting infrastructure
│   ├── DistributedRateLimiter.java  # Redis-backed sliding window rate limiter
│   └── IdempotencyService.java      # Redis-backed idempotency (webhooks)
├── mapper/                          # Entity ↔ DTO mappers
├── repository/                      # Spring Data MongoDB repositories
├── scheduler/                       # Scheduled tasks (escrow release)
├── security/                        # JWT + auth components
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── RateLimitInterceptor.java
└── service/                         # Business logic layer
    ├── AuthService.java
    ├── CompanyService.java
    ├── ConversationService.java
    ├── DisputeService.java
    ├── EscrowService.java
    ├── FileUploadService.java
    ├── GeminiService.java
    ├── NotificationService.java
    ├── OrganizerService.java
    ├── PaymentService.java
    ├── RazorpayGatewayService.java
    ├── RefundService.java
    ├── RequestService.java
    └── TransactionAuditService.java
```

### REST API Endpoints

#### Authentication — `/api/auth`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/auth/register` | Public | Register user (returns JWT) |
| POST | `/api/auth/login` | Public | Login (returns JWT) |
| GET | `/api/auth/validate` | Public | Validate JWT token |

#### Organizer Profiles — `/api/organizers`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/organizers` | ORGANIZER | Create profile (multipart) |
| GET | `/api/organizers/{id}` | Public | Get profile |
| PUT | `/api/organizers/{id}` | ORGANIZER | Update profile |
| GET | `/api/organizers/pending` | ADMIN | List pending profiles |
| POST | `/api/organizers/{id}/approve` | ADMIN | Approve profile |
| POST | `/api/organizers/{id}/reject` | ADMIN | Reject profile |

#### Company Profiles — `/api/companies`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/companies` | COMPANY | Create profile |
| GET | `/api/companies/{id}` | Public | Get profile |
| PUT | `/api/companies/{id}` | COMPANY | Update profile |
| GET | `/api/companies` | Public | List all verified (paginated) |
| GET | `/api/companies/search` | Public | Search (location, industry, eventType) |
| GET | `/api/companies/search/filters` | Public | Advanced search (budget, type) |

#### Sponsorship Requests — `/api/requests`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/requests` | ORGANIZER | Create request |
| GET | `/api/requests/{id}` | Authenticated | Get request |
| GET | `/api/requests/organizer/{id}` | ORGANIZER | List by organizer |
| GET | `/api/requests/company/{id}` | COMPANY | List by company |
| PUT | `/api/requests/{id}/status` | COMPANY | Update status |
| GET | `/api/requests/check-duplicate` | ORGANIZER | Check duplicate |

#### Payments — `/api/payments`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/payments/order` | Authenticated | Create Razorpay order |
| POST | `/api/payments/verify` | Authenticated | Verify payment |
| POST | `/api/payments/refund` | Authenticated | Initiate refund |
| GET | `/api/payments/{id}` | Authenticated | Get payment details |
| GET | `/api/payments/company/{id}` | Authenticated | Company payment history |
| GET | `/api/payments/organizer/{id}` | Authenticated | Organizer payment history |

#### Admin Payments — `/api/admin/payments`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/admin/payments/stats` | ADMIN | Revenue stats |
| GET | `/api/admin/payments/{id}/transactions` | ADMIN | Transaction audit trail |
| POST | `/api/admin/payments/{id}/release` | ADMIN | Release from escrow |
| POST | `/api/admin/payments/{id}/settle` | ADMIN | Settle payment |
| POST | `/api/admin/payments/disputes` | ADMIN | Raise dispute |
| GET | `/api/admin/payments/disputes` | ADMIN | List disputes |
| GET | `/api/admin/payments/disputes/{id}` | ADMIN | Get dispute |
| GET | `/api/admin/payments/{id}/dispute` | ADMIN | Dispute by payment |
| PUT | `/api/admin/payments/disputes/{id}/review` | ADMIN | Mark under review |
| POST | `/api/admin/payments/disputes/{id}/resolve/company` | ADMIN | Resolve for company (refund) |
| POST | `/api/admin/payments/disputes/{id}/resolve/organizer` | ADMIN | Resolve for organizer (release) |
| POST | `/api/admin/payments/disputes/{id}/evidence` | ADMIN | Add evidence |

#### Conversations — `/api/conversations`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/conversations` | Authenticated | List conversations |
| POST | `/api/conversations` | Authenticated | Create / get existing |
| GET | `/api/conversations/{id}` | Authenticated | Get conversation |
| GET | `/api/conversations/{id}/messages` | Authenticated | Get messages |
| POST | `/api/conversations/{id}/messages` | Authenticated | Send message |
| POST | `/api/conversations/{id}/read` | Authenticated | Mark read |
| GET | `/api/conversations/unread` | Authenticated | Unread count |

#### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/notifications` | Authenticated | Paginated notifications |
| GET | `/api/notifications/unread` | Authenticated | Unread notifications |
| GET | `/api/notifications/count` | Authenticated | Unread count |
| POST | `/api/notifications/{id}/read` | Authenticated | Mark read |
| POST | `/api/notifications/read-all` | Authenticated | Mark all read |

#### AI Chat — `/api/ai`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/ai/chat` | Authenticated | AI chat (Gemini) |
| GET | `/api/ai/health` | Authenticated | Health check |

#### Webhooks — `/api/webhooks`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/webhooks/razorpay` | HMAC Signature | Razorpay events |

### WebSocket / STOMP Messaging

**Endpoint:** `ws://host:8080/ws` (with SockJS fallback)

**Protocol:** STOMP 1.2 over WebSocket

**Broker Modes:**

| Mode | Config | Use Case |
| ---- | ------ | -------- |
| **Simple Broker** | `stomp.broker.relay.enabled=false` | Standalone dev (no RabbitMQ needed) |
| **RabbitMQ Relay** | `stomp.broker.relay.enabled=true` | Docker / Production (horizontal scaling) |

**Broker Configuration:**
- Application prefix: `/app`
- Broker prefixes: `/topic` (broadcast), `/queue` (user-specific)
- User destination prefix: `/user`
- Heartbeat: 10s (server ↔ client)
- Max message size: 128 KB
- Send buffer: 512 KB

**RabbitMQ STOMP Relay (production):**
- **Host:** Configurable via `RABBITMQ_HOST` (default: `localhost`)
- **STOMP Port:** 61613 (TCP relay, not AMQP 5672)
- **Management UI:** http://host:15672
- **Plugins required:** `rabbitmq_stomp`, `rabbitmq_management`
- **Health check:** Custom actuator indicator at `/actuator/health` (`rabbitMQStomp`)
- **Horizontal scaling:** Multiple backend instances share one RabbitMQ broker; all clients receive messages regardless of which instance they connect to

**Client → Server destinations:**

| Destination | Purpose |
| ----------- | ------- |
| `/app/chat.send` | Send chat message |
| `/app/chat.typing` | Broadcast typing indicator |

**Server → Client subscriptions:**

| Topic | Purpose |
| ----- | ------- |
| `/topic/conversation/{id}` | New messages in conversation |
| `/topic/conversation/{id}/typing` | Typing indicators |
| `/topic/conversation/{id}/read` | Read receipts |
| `/user/{userId}/queue/messages` | Direct message delivery |
| `/user/{userId}/queue/notifications` | Real-time notifications |

**Three-layer WebSocket security (WebSocketAuthConfig):**

1. **CONNECT** — JWT validation and principal injection from `Authorization: Bearer` or STOMP `token` header
2. **SUBSCRIBE** — Conversation access control (only participants can subscribe to `/topic/conversation/{id}`)
3. **SEND** — Anti-spoofing: userId is always extracted from authenticated principal, never from client payload

### Security Architecture

```
Request → RateLimitFilter → JwtAuthenticationFilter → SecurityFilterChain → Controller
              │                      │                        │
              ▼                      ▼                        ▼
     Redis Rate Limiter      JWT Validation          Role-based access
     (sliding window)       (stateless, 24h)         (RBAC per endpoint)
```

**Authentication:** Stateless JWT (no server sessions). Tokens issued at login/register, validated on every request.

**Authorization:** Role-based access control with three roles:

| Role | Access |
| ---- | ------ |
| `ORGANIZER` | Create/manage events, submit sponsorship requests, messaging |
| `COMPANY` | Manage company profile, review/accept requests, payments |
| `ADMIN` | Profile approvals, payment administration, dispute resolution |

**Public endpoints (no authentication):**
- `/api/auth/register`, `/api/auth/login`, `/api/auth/validate`
- `/api/companies/search`, `/api/companies/{id}`, `/api/organizers/{id}`
- `/ws/**` (auth handled at STOMP level)
- `/api/webhooks/**` (verified via HMAC signature)

**Rate limiting (Redis-backed sliding window):**

| Tier | Limit |
| ---- | ----- |
| Authenticated | 100 requests / 60 seconds |
| Admin | 500 requests / 60 seconds |
| Anonymous | 30 requests / 60 seconds |

**Idempotency:** Redis-based deduplication for webhooks and payment operations to prevent double-processing.

### Payment & Escrow Flow

```
                    ┌──────────────┐
                    │   Frontend   │
                    │ (Razorpay    │
                    │  Checkout)   │
                    └──────┬───────┘
                           │ 1. POST /api/payments/order
                           ▼
                    ┌──────────────┐     2. Create Order
                    │   Backend    │────────────────────▶ Razorpay API
                    │ PaymentSvc   │◀────────────────────
                    └──────┬───────┘     Order ID
                           │
                           │ 3. Return orderId to frontend
                           ▼
                    ┌──────────────┐     4. User pays
                    │  Razorpay    │     in widget
                    │  Checkout    │
                    │  Widget      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │ 5a. Callback            │ 5b. Webhook
              ▼                         ▼
       POST /verify              POST /webhooks/razorpay
    (secondary check)          (primary source of truth)
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   IN_ESCROW  │  7-day hold period
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │ Auto (cron)             │ Manual (admin)
              ▼                         ▼
         RELEASED                  RELEASED
              │                         │
              ▼                         ▼
         SETTLED               DISPUTE → RESOLVE
```

**Payment state machine:** 15 states including CREATED → AUTHORIZED → CAPTURED → IN_ESCROW → RELEASED → SETTLED, with branches for DISPUTE_OPEN, REFUND_REQUESTED, PARTIALLY_REFUNDED, REFUNDED, FAILED, CANCELLED, EXPIRED.

**Escrow configuration:**
- Hold period: 7 days (configurable)
- Auto-release: Hourly cron job
- Dispute auto-resolve: Every 4 hours (14-day window)
- Platform commission: 10% (min ₹1.00, max ₹1,00,00,000)

---

## Frontend Architecture

### Frontend Directory Structure

```
eventra-frontend/src/
├── api/                    # Axios HTTP client layer
│   ├── client.ts           #   Base Axios instance (interceptors, baseURL)
│   ├── auth.ts             #   Auth endpoints
│   ├── ai.ts               #   AI chat endpoints
│   ├── events.ts           #   Event endpoints
│   ├── messages.ts         #   Messaging endpoints
│   ├── payments.ts         #   Payment + admin endpoints
│   └── sponsors.ts         #   Sponsor endpoints
│
├── components/             # Shared + marketing components
│   ├── payment/            #   CheckoutModal, PaymentCard, RefundModal, DisputeModal
│   ├── Hero.tsx, PremiumHero.tsx
│   ├── Features.tsx, FeaturesShowcase.tsx
│   ├── Footer.tsx, WorkflowTimeline.tsx
│   └── ...
│
├── company/                # Company (sponsor) dashboard module
│   ├── layout/             #   CompanyLayout, CompanySidebar, CompanyTopBar
│   └── pages/              #   Overview, Events, Applications, Deals,
│                           #   Payments, Messages, Analytics, Settings
│
├── config/                 # Application configuration
│   ├── branding.ts         #   White-label branding (env-driven)
│   └── roles.ts            #   Role constants
│
├── context/
│   └── AuthContext.tsx      # Auth context provider (JWT, user state)
│
├── dashboard/              # Organizer dashboard module
│   ├── layout/             #   DashboardLayout, Sidebar, TopBar
│   ├── modules/ai/         #   AIAssistant, ChatInterface, RecommendationCard
│   └── pages/              #   Overview, Events, Sponsors, Messages,
│                           #   Analytics, Payments, Settings
│
├── hooks/
│   ├── useAuth.ts          # Auth hook
│   ├── useRazorpayCheckout.ts  # Razorpay checkout orchestration
│   └── useWebSocket.ts    # STOMP WebSocket connection management
│
├── marketing/              # Landing page sections
│   ├── MarketingNav.tsx, CinematicHero.tsx
│   ├── Testimonials.tsx, WhatWeAre.tsx
│   └── ...
│
├── messaging/              # Real-time messaging module
│   ├── MessagingPage.tsx
│   └── components/         #   ChatWindow, ConversationList, MessageBubble,
│                           #   MessageInput, TypingIndicator
│
├── pages/                  # Top-level route pages
│   ├── Home.tsx, Login.tsx, Register.tsx
│   ├── About.tsx, Features.tsx, Pricing.tsx
│   └── Privacy.tsx, Terms.tsx, Contact.tsx
│
├── shared/                 # Shared UI components
│   ├── LoadingSpinner.tsx
│   ├── NotFound.tsx
│   └── ProtectedRoute.tsx  # Role-based route guard
│
├── types/
│   ├── index.ts            # Core TypeScript interfaces
│   └── payment.ts          # Payment/Dispute/Escrow types
│
├── App.tsx                 # Root component with routing
├── main.tsx                # Vite entry point
└── index.css               # Tailwind CSS imports
```

### Routing

**Public routes (marketing):**

| Path | Component | Loading |
| ---- | --------- | ------- |
| `/` | Home | Eager |
| `/login` | Login | Eager |
| `/register` | Register | Eager |
| `/features` | Features | Lazy |
| `/pricing` | Pricing | Lazy |
| `/security` | Security | Lazy |
| `/about` | About | Lazy |
| `/blog` | Blog | Lazy |
| `/privacy` | Privacy | Lazy |
| `/terms` | Terms | Lazy |
| `/contact` | Contact | Lazy |

**Organizer dashboard** (`/dashboard/*`) — requires `ORGANIZER` or `ADMIN`:

| Path | Component |
| ---- | --------- |
| `/dashboard` | Overview |
| `/dashboard/events` | Events |
| `/dashboard/sponsors` | Sponsors |
| `/dashboard/messages` | Messages |
| `/dashboard/analytics` | Analytics |
| `/dashboard/payments` | Payments |
| `/dashboard/ai` | AI Assistant |
| `/dashboard/settings` | Settings |

**Company dashboard** (`/company/*`) — requires `COMPANY` or `ADMIN`:

| Path | Component |
| ---- | --------- |
| `/company` | CompanyOverview |
| `/company/events` | CompanyEvents |
| `/company/applications` | CompanyApplications |
| `/company/deals` | CompanyDeals |
| `/company/payments` | CompanyPayments |
| `/company/messages` | CompanyMessages |
| `/company/analytics` | CompanyAnalytics |
| `/company/settings` | CompanySettings |

All dashboard routes use code-splitting via `React.lazy()` for optimal bundle size.

### State Management

- **Authentication:** React Context (`AuthContext`) with JWT storage in `localStorage`
- **API state:** Component-level state with Axios calls (no global store library)
- **Real-time:** `useWebSocket` hook manages STOMP connection lifecycle, auto-reconnect with exponential backoff
- **Payments:** `useRazorpayCheckout` hook manages the full checkout flow (script loading → order creation → widget → verification)

---

## Data Model

```
┌──────────┐       ┌───────────────────┐       ┌──────────┐
│   User   │       │ SponsorshipRequest│       │  Company │
│──────────│       │───────────────────│       │──────────│
│ email    │◀──┐   │ organizerId       │   ┌──▶│ industry │
│ password │   │   │ companyId         │   │   │ budget   │
│ role     │   │   │ status            │   │   │ location │
└──────────┘   │   │ amount            │   │   └──────────┘
               │   └───────┬───────────┘   │
               │           │               │
          ┌────┴───────┐   │          ┌────┴───────────┐
          │ Organizer  │   │          │   Payment      │
          │────────────│   │          │────────────────│
          │ events     │   │          │ razorpayOrderId│
          │ proposal   │   └─────────▶│ amount         │
          │ verified   │              │ status (FSM)   │
          └────────────┘              │ escrowReleaseAt│
                                      │ commission     │
               ┌──────────────────┐   └────────┬───────┘
               │  Conversation    │            │
               │──────────────────│   ┌────────┴───────┐
               │ participantIds[] │   │  Transaction   │
               │ lastMessage      │   │────────────────│
               └────────┬─────────┘   │ type (audit)   │
                        │             │ description    │
               ┌────────┴─────────┐   └────────────────┘
               │ ConversationMsg  │
               │──────────────────│   ┌────────────────┐
               │ senderId         │   │    Dispute      │
               │ content          │   │────────────────│
               │ status           │   │ paymentId       │
               │ messageType      │   │ status          │
               └──────────────────┘   │ evidence[]      │
                                      │ resolution      │
               ┌──────────────────┐   └────────────────┘
               │  Notification    │
               │──────────────────│
               │ userId           │
               │ type             │
               │ read             │
               └──────────────────┘
```

**Roles:** `ORGANIZER`, `COMPANY`, `ADMIN`

**Payment statuses (15-state FSM):** CREATED → AUTHORIZED → CAPTURED → IN_ESCROW → RELEASED → SETTLED, with branches: DISPUTE_OPEN → DISPUTE_WON / DISPUTE_LOST, REFUND_REQUESTED → PARTIALLY_REFUNDED / REFUNDED, FAILED, CANCELLED, EXPIRED

---

## Infrastructure

### Docker Compose Services

| Service | Image | Port | Purpose |
| ------- | ----- | ---- | ------- |
| `mongodb` | `mongo:7.0` | 27017 | Primary database (replica set `rs0`) |
| `mongodb-init` | `mongo:7.0` | — | One-shot replica set initialization |
| `redis` | `redis:7.4-alpine` | 6379 | Cache, rate limiting, idempotency |
| `eventra-backend` | Dockerfile | 8080 | Spring Boot API |

**Volumes:** `mongodb_data`, `redis_data` (persistent)

**MongoDB** runs as a single-node replica set (`rs0`) to enable multi-document transactions.

**Redis** configuration: 256 MB max memory, LRU eviction, AOF persistence, optional password.

**Health checks:**
- MongoDB: `mongosh --eval "db.adminCommand('ping')"`
- Redis: `redis-cli ping`
- Backend: `curl /actuator/health`

### Production Deployment

For production, the frontend is built as static files and served via a reverse proxy (Nginx, Caddy, etc.) or a CDN. The backend runs as a containerized Spring Boot application.

```
Internet → Load Balancer / CDN
              ├── Static assets (Vite build output)
              └── /api/*, /ws/* → Spring Boot container(s)
                                      ├── MongoDB (managed or self-hosted)
                                      └── Redis (managed or self-hosted)
```

---

## Configuration Reference

All configuration is driven by environment variables. See `INSTALLATION.md` for the complete variable reference.

### Backend (Spring Boot)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `JWT_SECRET` | **Yes** | JWT signing key (min 32 chars) |
| `MONGODB_URI` | Yes (prod) | MongoDB connection string |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | No | Redis connection (defaults: localhost:6379, no password) |
| `CORS_ALLOWED_ORIGINS` | Yes (prod) | Comma-separated allowed origins |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Yes | Razorpay API credentials |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay webhook HMAC secret |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Yes | Cloudinary file uploads |
| `GEMINI_API_KEY` | Yes | Google Gemini AI key |
| `APP_NAME` | No | Application name (default: `eventra`) |

### Frontend (Vite)

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `VITE_API_URL` | `http://localhost:8080` | Backend API base URL |
| `VITE_WS_URL` | `ws://localhost:8080/ws` | WebSocket endpoint |
| `VITE_APP_NAME` | `Eventra` | Application display name |
| `VITE_SUPPORT_EMAIL` | `support@eventra.com` | Support email |
| `VITE_RAZORPAY_KEY_ID` | — | Razorpay publishable key |

---

## White-Label Customization

The platform is designed for white-label deployment. All branding is centralized:

### Frontend Branding

All branding reads from `src/config/branding.ts`, which sources values from `VITE_*` environment variables:

```typescript
// Set these in .env to customize branding:
VITE_APP_NAME=YourBrand
VITE_APP_TAGLINE=Your tagline here
VITE_SUPPORT_EMAIL=support@yourdomain.com
VITE_LEGAL_ENTITY=Your Company Inc.
VITE_DOMAIN=yourdomain.com
```

### Backend Branding

```bash
APP_NAME=yourbrand   # Used in cache keys, metrics, database name
```

### Styling

- Tailwind CSS theme can be customized in `tailwind.config.js`
- Color palette, fonts, and spacing are configurable
- Replace logo assets in `eventra-frontend/public/`

### Steps to rebrand:

1. Copy `.env.example` → `.env` in both frontend and backend directories
2. Set all `VITE_*` branding variables
3. Set `APP_NAME` for the backend
4. Replace logo/favicon in `public/`
5. Optionally customize `tailwind.config.js` for color theme
6. Build and deploy

---

*This document is auto-maintained. For setup instructions, see `INSTALLATION.md`.*
