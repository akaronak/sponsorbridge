# Design Document: SponsorBridge

## Overview

SponsorBridge is a three-tier web application following a RESTful architecture pattern. The system consists of a React frontend, Spring Boot backend API, and PostgreSQL database. The platform implements role-based access control (RBAC) with JWT authentication, enabling three distinct user experiences: Organizers who search for sponsors, Companies who manage sponsorship offerings, and Admins who moderate content.

The architecture prioritizes security, scalability, and maintainability through clear separation of concerns, stateless authentication, and database indexing strategies.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│                    (React + Vite + Tailwind)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Organizer  │  │   Company    │  │    Admin     │     │
│  │      UI      │  │      UI      │  │      UI      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS / REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│                   (Spring Boot + Spring Security)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Controllers                          │  │
│  │  AuthController │ CompanyController │ OrganizerController│
│  │  RequestController │ AdminController                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Layer                            │  │
│  │  AuthService │ CompanyService │ OrganizerService     │  │
│  │  RequestService │ MessageService │ AdminService      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Security Layer                           │  │
│  │  JwtAuthenticationFilter │ JwtTokenProvider          │  │
│  │  UserDetailsService │ SecurityConfig                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Repository Layer (JPA)                   │  │
│  │  UserRepository │ CompanyRepository                  │  │
│  │  OrganizerRepository │ RequestRepository            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                         JDBC
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│                      (PostgreSQL)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  users │ companies │ organizers │ sponsorship_requests│ │
│  │  messages │ indexes                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                      External Services
                            │
                    ┌───────────────┐
                    │   Cloudinary  │
                    │ (File Storage)│
                    └───────────────┘
```

### Key Architectural Decisions

1. **Stateless Authentication**: JWT tokens eliminate server-side session storage, enabling horizontal scaling
2. **Role-Based Access Control**: Spring Security annotations enforce endpoint-level authorization
3. **Repository Pattern**: JPA repositories abstract database operations and enable easy testing
4. **Service Layer**: Business logic separation from controllers enables reusability and testing
5. **DTO Pattern**: Data Transfer Objects decouple API contracts from database entities
6. **File Storage Externalization**: Cloudinary handles file uploads, reducing server load

## Components and Interfaces

### Frontend Components

#### Authentication Components
- **LoginForm**: Captures email/password, calls `/api/auth/login`, stores JWT in localStorage
- **RegisterForm**: Captures user details and role selection, calls `/api/auth/register`
- **ProtectedRoute**: HOC that checks JWT validity and redirects to login if expired

#### Organizer Components
- **OrganizerDashboard**: Displays profile summary and recent requests
- **CompanySearch**: Search interface with filters (location, industry, sponsorship type, budget)
- **CompanyCard**: Displays company summary in search results
- **RequestForm**: Form for creating sponsorship requests
- **RequestList**: Displays sent requests with status indicators

#### Company Components
- **CompanyDashboard**: Displays profile summary and request statistics
- **ProfileForm**: Form for creating/editing company profile
- **IncomingRequests**: List of received sponsorship requests
- **RequestDetail**: Detailed view of a single request with action buttons
- **MessageThread**: Conversation view for request-specific messaging

#### Admin Components
- **AdminDashboard**: Platform statistics and moderation queue
- **PendingProfiles**: List of profiles awaiting approval
- **UserManagement**: View and manage all users
- **PlatformStats**: Charts and metrics for sponsorship activity

### Backend API Endpoints

#### Authentication Endpoints
```
POST /api/auth/register
  Request: { email, password, name, role }
  Response: { message, userId }

POST /api/auth/login
  Request: { email, password }
  Response: { token, role, userId, expiresIn }

GET /api/auth/validate
  Headers: Authorization: Bearer <token>
  Response: { valid: boolean, userId, role }
```

#### Company Endpoints
```
POST /api/companies
  Headers: Authorization: Bearer <token>
  Request: { companyName, industry, location, website, contactPerson, 
             sponsorshipTypes[], budgetMin, budgetMax, preferredEventTypes[], 
             companySize }
  Response: { companyId, message }

GET /api/companies/{id}
  Response: { companyId, companyName, industry, location, website, 
              sponsorshipTypes, budgetRange, preferredEventTypes, 
              pastSponsorships, verified }

PUT /api/companies/{id}
  Headers: Authorization: Bearer <token>
  Request: { ...company fields }
  Response: { message }

GET /api/companies/search
  Query: location, industry, sponsorshipType, budgetMin, budgetMax, 
         eventType, page, size
  Response: { companies[], totalPages, currentPage, totalElements }
```

#### Organizer Endpoints
```
POST /api/organizers
  Headers: Authorization: Bearer <token>
  Request: { organizerName, institution, eventName, eventType, eventDate, 
             expectedFootfall, socialMediaLinks[], proposalFile }
  Response: { organizerId, proposalUrl, message }

GET /api/organizers/{id}
  Response: { organizerId, organizerName, institution, eventName, eventType, 
              eventDate, expectedFootfall, proposalUrl, socialMediaLinks, verified }

PUT /api/organizers/{id}
  Headers: Authorization: Bearer <token>
  Request: { ...organizer fields }
  Response: { message }
```

#### Sponsorship Request Endpoints
```
POST /api/requests
  Headers: Authorization: Bearer <token>
  Request: { companyId, eventSummary, expectedAudienceSize, offering, 
             sponsorshipAsk, proposalUrl, preferredCommunicationMode }
  Response: { requestId, status, message }

GET /api/requests/organizer/{organizerId}
  Headers: Authorization: Bearer <token>
  Query: page, size, status
  Response: { requests[], totalPages, currentPage }

GET /api/requests/company/{companyId}
  Headers: Authorization: Bearer <token>
  Query: page, size, status
  Response: { requests[], totalPages, currentPage }

PUT /api/requests/{id}/status
  Headers: Authorization: Bearer <token>
  Request: { status: "Accepted" | "Rejected" | "Interested" | "More_Info_Needed" }
  Response: { message }

GET /api/requests/{id}
  Headers: Authorization: Bearer <token>
  Response: { requestId, organizerId, companyId, eventSummary, 
              expectedAudienceSize, offering, sponsorshipAsk, status, 
              createdAt, proposalUrl }
```

#### Messaging Endpoints
```
POST /api/messages
  Headers: Authorization: Bearer <token>
  Request: { requestId, content }
  Response: { messageId, timestamp }

GET /api/messages/request/{requestId}
  Headers: Authorization: Bearer <token>
  Response: { messages: [{ messageId, senderId, senderName, content, timestamp }] }
```

#### Admin Endpoints
```
GET /api/admin/companies/pending
  Headers: Authorization: Bearer <token>
  Response: { companies[] }

PUT /api/admin/companies/{id}/approve
  Headers: Authorization: Bearer <token>
  Response: { message }

PUT /api/admin/companies/{id}/reject
  Headers: Authorization: Bearer <token>
  Response: { message }

GET /api/admin/organizers/pending
  Headers: Authorization: Bearer <token>
  Response: { organizers[] }

PUT /api/admin/organizers/{id}/approve
  Headers: Authorization: Bearer <token>
  Response: { message }

DELETE /api/admin/users/{id}
  Headers: Authorization: Bearer <token>
  Response: { message }

GET /api/admin/stats
  Headers: Authorization: Bearer <token>
  Response: { totalUsers, totalCompanies, totalOrganizers, 
              totalRequests, requestsByStatus }
```

#### Email Template Endpoint
```
POST /api/email-template
  Headers: Authorization: Bearer <token>
  Request: { companyId, organizerId }
  Response: { emailTemplate: string }
```

#### Export Endpoints
```
GET /api/export/company/{companyId}/requests
  Headers: Authorization: Bearer <token>
  Response: CSV file

GET /api/export/organizer/{organizerId}/requests
  Headers: Authorization: Bearer <token>
  Response: CSV file

GET /api/export/admin/stats
  Headers: Authorization: Bearer <token>
  Response: CSV file
```

### Service Layer Interfaces

#### AuthService
```java
interface AuthService {
  UserDTO register(RegisterRequest request);
  LoginResponse login(LoginRequest request);
  boolean validateToken(String token);
  Long getUserIdFromToken(String token);
  String getRoleFromToken(String token);
}
```

#### CompanyService
```java
interface CompanyService {
  CompanyDTO createCompany(Long userId, CompanyRequest request);
  CompanyDTO getCompanyById(Long companyId);
  CompanyDTO updateCompany(Long companyId, Long userId, CompanyRequest request);
  Page<CompanyDTO> searchCompanies(CompanySearchCriteria criteria, Pageable pageable);
  List<CompanyDTO> getPendingCompanies();
  void approveCompany(Long companyId);
  void rejectCompany(Long companyId);
}
```

#### OrganizerService
```java
interface OrganizerService {
  OrganizerDTO createOrganizer(Long userId, OrganizerRequest request);
  OrganizerDTO getOrganizerById(Long organizerId);
  OrganizerDTO updateOrganizer(Long organizerId, Long userId, OrganizerRequest request);
  String uploadProposal(MultipartFile file);
  List<OrganizerDTO> getPendingOrganizers();
  void approveOrganizer(Long organizerId);
}
```

#### RequestService
```java
interface RequestService {
  RequestDTO createRequest(Long organizerId, RequestRequest request);
  RequestDTO getRequestById(Long requestId);
  Page<RequestDTO> getRequestsByOrganizer(Long organizerId, String status, Pageable pageable);
  Page<RequestDTO> getRequestsByCompany(Long companyId, String status, Pageable pageable);
  RequestDTO updateRequestStatus(Long requestId, Long userId, String status);
  boolean isDuplicateRequest(Long organizerId, Long companyId);
}
```

#### MessageService
```java
interface MessageService {
  MessageDTO sendMessage(Long senderId, Long requestId, String content);
  List<MessageDTO> getMessagesByRequest(Long requestId);
}
```

#### EmailTemplateService
```java
interface EmailTemplateService {
  String generateTemplate(Long companyId, Long organizerId);
}
```

#### ExportService
```java
interface ExportService {
  byte[] exportCompanyRequests(Long companyId);
  byte[] exportOrganizerRequests(Long organizerId);
  byte[] exportPlatformStats();
}
```

## Data Models

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ORGANIZER', 'COMPANY', 'ADMIN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  website VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  sponsorship_types TEXT[] NOT NULL,
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  preferred_event_types TEXT[],
  company_size VARCHAR(50),
  past_sponsorships TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizers table
CREATE TABLE organizers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizer_name VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  expected_footfall INTEGER NOT NULL,
  proposal_url VARCHAR(500),
  social_media_links TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship requests table
CREATE TABLE sponsorship_requests (
  id BIGSERIAL PRIMARY KEY,
  organizer_id BIGINT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_summary TEXT NOT NULL,
  expected_audience_size INTEGER NOT NULL,
  offering TEXT NOT NULL,
  sponsorship_ask TEXT NOT NULL,
  proposal_url VARCHAR(500),
  preferred_communication_mode VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' 
    CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Interested', 'More_Info_Needed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organizer_id, company_id, created_at)
);

-- Messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES sponsorship_requests(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 5000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_verified ON companies(verified);
CREATE INDEX idx_companies_sponsorship_types ON companies USING GIN(sponsorship_types);
CREATE INDEX idx_organizers_verified ON organizers(verified);
CREATE INDEX idx_requests_organizer ON sponsorship_requests(organizer_id);
CREATE INDEX idx_requests_company ON sponsorship_requests(company_id);
CREATE INDEX idx_requests_status ON sponsorship_requests(status);
CREATE INDEX idx_requests_created_at ON sponsorship_requests(created_at DESC);
CREATE INDEX idx_messages_request ON messages(request_id);
```

### Entity Relationships

```
users (1) ──── (1) companies
users (1) ──── (1) organizers
organizers (1) ──── (N) sponsorship_requests
companies (1) ──── (N) sponsorship_requests
sponsorship_requests (1) ──── (N) messages
users (1) ──── (N) messages
```

### JPA Entity Classes

#### User Entity
```java
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(unique = true, nullable = false)
  private String email;
  
  @Column(name = "password_hash", nullable = false)
  private String passwordHash;
  
  @Column(nullable = false)
  private String name;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;
  
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
  
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
  private Company company;
  
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
  private Organizer organizer;
}
```

#### Company Entity
```java
@Entity
@Table(name = "companies")
public class Company {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @OneToOne
  @JoinColumn(name = "user_id", unique = true, nullable = false)
  private User user;
  
  @Column(name = "company_name", nullable = false)
  private String companyName;
  
  @Column(nullable = false)
  private String industry;
  
  @Column(nullable = false)
  private String location;
  
  @Column(nullable = false)
  private String website;
  
  @Column(name = "contact_person", nullable = false)
  private String contactPerson;
  
  @Column(name = "sponsorship_types", nullable = false)
  @Type(type = "string-array")
  private String[] sponsorshipTypes;
  
  @Column(name = "budget_min")
  private BigDecimal budgetMin;
  
  @Column(name = "budget_max")
  private BigDecimal budgetMax;
  
  @Column(name = "preferred_event_types")
  @Type(type = "string-array")
  private String[] preferredEventTypes;
  
  @Column(name = "company_size")
  private String companySize;
  
  @Column(name = "past_sponsorships")
  @Type(type = "string-array")
  private String[] pastSponsorships;
  
  @Column(nullable = false)
  private Boolean verified = false;
  
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
  
  @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
  private List<SponsorshipRequest> requests;
}
```

#### Organizer Entity
```java
@Entity
@Table(name = "organizers")
public class Organizer {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @OneToOne
  @JoinColumn(name = "user_id", unique = true, nullable = false)
  private User user;
  
  @Column(name = "organizer_name", nullable = false)
  private String organizerName;
  
  @Column(nullable = false)
  private String institution;
  
  @Column(name = "event_name", nullable = false)
  private String eventName;
  
  @Column(name = "event_type", nullable = false)
  private String eventType;
  
  @Column(name = "event_date", nullable = false)
  private LocalDate eventDate;
  
  @Column(name = "expected_footfall", nullable = false)
  private Integer expectedFootfall;
  
  @Column(name = "proposal_url")
  private String proposalUrl;
  
  @Column(name = "social_media_links")
  @Type(type = "string-array")
  private String[] socialMediaLinks;
  
  @Column(nullable = false)
  private Boolean verified = false;
  
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
  
  @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL)
  private List<SponsorshipRequest> requests;
}
```

#### SponsorshipRequest Entity
```java
@Entity
@Table(name = "sponsorship_requests")
public class SponsorshipRequest {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne
  @JoinColumn(name = "organizer_id", nullable = false)
  private Organizer organizer;
  
  @ManyToOne
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;
  
  @Column(name = "event_summary", nullable = false, columnDefinition = "TEXT")
  private String eventSummary;
  
  @Column(name = "expected_audience_size", nullable = false)
  private Integer expectedAudienceSize;
  
  @Column(nullable = false, columnDefinition = "TEXT")
  private String offering;
  
  @Column(name = "sponsorship_ask", nullable = false, columnDefinition = "TEXT")
  private String sponsorshipAsk;
  
  @Column(name = "proposal_url")
  private String proposalUrl;
  
  @Column(name = "preferred_communication_mode")
  private String preferredCommunicationMode;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RequestStatus status = RequestStatus.PENDING;
  
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
  
  @OneToMany(mappedBy = "request", cascade = CascadeType.ALL)
  private List<Message> messages;
}
```

#### Message Entity
```java
@Entity
@Table(name = "messages")
public class Message {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @ManyToOne
  @JoinColumn(name = "request_id", nullable = false)
  private SponsorshipRequest request;
  
  @ManyToOne
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;
  
  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;
  
  @Column(name = "created_at")
  private LocalDateTime createdAt;
}
```

### DTOs (Data Transfer Objects)

DTOs decouple API responses from database entities and prevent over-fetching:

- **UserDTO**: id, email, name, role
- **CompanyDTO**: id, companyName, industry, location, website, contactPerson, sponsorshipTypes, budgetRange, preferredEventTypes, companySize, pastSponsorships, verified
- **OrganizerDTO**: id, organizerName, institution, eventName, eventType, eventDate, expectedFootfall, proposalUrl, socialMediaLinks, verified
- **RequestDTO**: id, organizerId, organizerName, companyId, companyName, eventSummary, expectedAudienceSize, offering, sponsorshipAsk, status, createdAt, proposalUrl
- **MessageDTO**: id, senderId, senderName, content, timestamp
- **LoginResponse**: token, role, userId, expiresIn
- **PlatformStatsDTO**: totalUsers, totalCompanies, totalOrganizers, totalRequests, requestsByStatus

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Authorization Properties

**Property 1: User registration creates accounts with correct roles**
*For any* valid registration data (email, password, name, role), creating a user account should result in a stored user with the specified role and a BCrypt-hashed password.
**Validates: Requirements 1.1, 1.7**

**Property 2: Invalid registration data is rejected with descriptive errors**
*For any* invalid registration data (missing fields, malformed email, weak password), the registration attempt should be rejected and return error messages identifying the invalid fields.
**Validates: Requirements 1.2**

**Property 3: Valid login credentials generate valid JWT tokens**
*For any* valid user credentials, successful login should generate a JWT token that is valid for 24 hours and contains the user's ID and role.
**Validates: Requirements 1.3**

**Property 4: Invalid login credentials are rejected**
*For any* invalid credentials (wrong password, non-existent email), the login attempt should be rejected with an authentication error.
**Validates: Requirements 1.4**

**Property 5: Valid JWT tokens authorize protected endpoint access**
*For any* protected endpoint and valid JWT token, the request should be authorized and processed successfully.
**Validates: Requirements 1.5**

**Property 6: Missing or invalid JWT tokens deny access**
*For any* protected endpoint and missing or invalid JWT token, the request should be rejected with an unauthorized error.
**Validates: Requirements 1.6**

**Property 7: Role-based access control restricts endpoints**
*For any* endpoint with role restrictions, users without the required role should receive a forbidden error, while users with the correct role should be granted access.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

**Property 8: Rate limiting prevents excessive requests**
*For any* user making more than 100 requests per minute, subsequent requests should be rejected with a rate limit error until the time window resets.
**Validates: Requirements 11.5, 11.6**

**Property 9: User input is sanitized to prevent injection attacks**
*For any* user input containing SQL injection or XSS attack patterns, the input should be sanitized before processing, preventing malicious code execution.
**Validates: Requirements 11.8**

### Profile Management Properties

**Property 10: Company profiles require all mandatory fields**
*For any* company profile creation attempt, profiles missing company name, industry, location, website, or contact person should be rejected with validation errors.
**Validates: Requirements 2.1**

**Property 11: Sponsorship types are validated against allowed values**
*For any* company profile with sponsorship types, only values from {Monetary, Goodies, Internship, Mentorship, Judges} should be accepted, and invalid types should be rejected.
**Validates: Requirements 2.2**

**Property 12: Profile data persists correctly through updates**
*For any* profile (Company or Organizer) and any valid update, the updated data should be immediately retrievable from the database with all changes reflected.
**Validates: Requirements 2.4, 3.8**

**Property 13: Budget ranges round-trip correctly**
*For any* company profile with budget minimum and maximum values, storing and retrieving the profile should preserve the exact budget values.
**Validates: Requirements 2.3**

**Property 14: URL validation enforces proper format**
*For any* URL field (website, social media links), valid URLs should be accepted and malformed URLs should be rejected with validation errors.
**Validates: Requirements 2.6, 3.7**

**Property 15: Location validation prevents empty values**
*For any* company profile, empty or whitespace-only location values should be rejected with validation errors.
**Validates: Requirements 2.7**

**Property 16: Admin approval makes profiles searchable**
*For any* company profile, after admin approval the profile should be marked as verified and appear in search results, while unapproved profiles should not appear in searches.
**Validates: Requirements 2.8, 9.2**

**Property 17: Organizer profiles require all mandatory fields**
*For any* organizer profile creation attempt, profiles missing organizer name, institution, event name, event type, event date, or expected footfall should be rejected with validation errors.
**Validates: Requirements 3.1, 3.2**

**Property 18: File uploads validate type and size**
*For any* file upload, PDF files under 10MB should be accepted and stored with a Cloudinary URL, while non-PDF files or files exceeding 10MB should be rejected with descriptive errors.
**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Search and Discovery Properties

**Property 19: Unfiltered search returns only verified companies with pagination**
*For any* search request without filters, the results should contain only verified company profiles, paginated with 20 companies per page.
**Validates: Requirements 4.1, 4.7**

**Property 20: Location filter returns only matching companies**
*For any* search with a location filter, all returned companies should have a location matching the filter value.
**Validates: Requirements 4.2**

**Property 21: Industry filter returns only matching companies**
*For any* search with an industry filter, all returned companies should have an industry matching the filter value.
**Validates: Requirements 4.3**

**Property 22: Sponsorship type filter returns only matching companies**
*For any* search with a sponsorship type filter, all returned companies should offer that sponsorship type in their sponsorshipTypes array.
**Validates: Requirements 4.4**

**Property 23: Budget range filter returns companies with overlapping ranges**
*For any* search with a budget range filter [min, max], all returned companies should have a budget range that overlaps with the specified range (company.budgetMax >= min AND company.budgetMin <= max).
**Validates: Requirements 4.5**

**Property 24: Multiple filters combine with AND logic**
*For any* search with multiple filters, all returned companies should satisfy every specified filter criterion.
**Validates: Requirements 4.6**

**Property 25: Pagination returns correct page of results**
*For any* search with page number N, the results should contain items (N-1)*20 through N*20 from the complete result set.
**Validates: Requirements 4.8**

**Property 26: Search results include all required fields**
*For any* company in search results, the response should include company name, industry, location, sponsorship types, and budget range.
**Validates: Requirements 4.9**

### Sponsorship Request Properties

**Property 27: Request creation requires all mandatory fields**
*For any* sponsorship request creation attempt, requests missing event summary, expected audience size, offering, or sponsorship ask should be rejected with validation errors.
**Validates: Requirements 5.1**

**Property 28: New requests have Pending status**
*For any* newly created sponsorship request, the initial status should be "Pending".
**Validates: Requirements 5.2**

**Property 29: Optional fields persist correctly**
*For any* sponsorship request with optional fields (proposal URL, preferred communication mode), the values should be stored and retrievable.
**Validates: Requirements 5.3, 5.4**

**Property 30: Expected audience size must be positive**
*For any* sponsorship request, expected audience size values that are zero or negative should be rejected with validation errors.
**Validates: Requirements 5.5**

**Property 31: Sponsorship ask must be non-empty**
*For any* sponsorship request, empty or whitespace-only sponsorship ask values should be rejected with validation errors.
**Validates: Requirements 5.6**

**Property 32: Entity creation records timestamps**
*For any* newly created entity (User, Company, Organizer, Request, Message), the creation timestamp should be set to the current time.
**Validates: Requirements 5.7, 7.6**

**Property 33: Duplicate requests within 30 days are prevented**
*For any* organizer and company pair, if a request already exists within the last 30 days, attempting to create another request should be rejected with a duplicate error.
**Validates: Requirements 5.8**

**Property 34: Companies view only their own requests**
*For any* company user querying their requests, the results should contain only requests where the company ID matches their company profile.
**Validates: Requirements 6.1**

**Property 35: Status transitions update correctly**
*For any* sponsorship request and valid status transition (Accepted, Rejected, Interested, More_Info_Needed), updating the status should persist the new status value.
**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

**Property 36: Requests are sorted by creation date descending**
*For any* list of sponsorship requests, the results should be ordered with the most recently created requests first.
**Validates: Requirements 6.6**

**Property 37: Status filter returns only matching requests**
*For any* request list query with a status filter, all returned requests should have the specified status.
**Validates: Requirements 6.7**

**Property 38: Request listings include required fields**
*For any* request in a listing, the response should include organizer name, event name, event date, and sponsorship ask.
**Validates: Requirements 6.8**

### Messaging Properties

**Property 39: Messages are created and associated with requests**
*For any* user sending a message on a sponsorship request, a message record should be created containing the sender ID, request ID, content, and timestamp.
**Validates: Requirements 7.1, 7.2, 7.3**

**Property 40: Conversation messages are sorted chronologically**
*For any* sponsorship request, retrieving the conversation should return all messages sorted by timestamp in ascending order.
**Validates: Requirements 7.4**

**Property 41: Message content length is validated**
*For any* message, empty content should be rejected, and content exceeding 5000 characters should be rejected with validation errors.
**Validates: Requirements 7.5**

### Email Template Properties

**Property 42: Email templates include all required event details**
*For any* organizer and company pair, generating an email template should include organizer name, event name, event type, event date, expected footfall, company name, and contact person.
**Validates: Requirements 8.1, 8.2, 8.3**

**Property 43: Email templates have professional structure**
*For any* generated email template, the text should contain identifiable greeting, body, and closing sections.
**Validates: Requirements 8.4**

### Admin Moderation Properties

**Property 44: Pending profile queries return only unverified profiles**
*For any* admin query for pending profiles, the results should contain only profiles where verified = false.
**Validates: Requirements 9.1, 9.4**

**Property 45: Profile approval updates verification status**
*For any* company or organizer profile, admin approval should set verified = true and make the profile visible in appropriate queries.
**Validates: Requirements 9.5**

**Property 46: Profile rejection updates status**
*For any* company profile, admin rejection should mark the profile as rejected.
**Validates: Requirements 9.3**

**Property 47: User deletion cascades to related entities**
*For any* user account, deleting the user should also delete their associated profile (Company or Organizer) and all related sponsorship requests.
**Validates: Requirements 9.6, 10.3**

**Property 48: Admin statistics aggregate correctly**
*For any* admin statistics query, the results should accurately count total users, companies, organizers, and sponsorship requests in the database.
**Validates: Requirements 9.7**

**Property 49: Admins can view all entities**
*For any* admin user, queries for users, companies, or organizers should return all records without filtering by ownership.
**Validates: Requirements 9.8**

### Data Integrity Properties

**Property 50: Email addresses are unique**
*For any* two user accounts, they should have different email addresses; attempting to create a user with an existing email should be rejected with a uniqueness error.
**Validates: Requirements 10.1**

**Property 51: Foreign key relationships are enforced**
*For any* entity with foreign key relationships (Company → User, Organizer → User, Request → Company, Request → Organizer, Message → Request), attempting to create a record with a non-existent foreign key should be rejected with a referential integrity error.
**Validates: Requirements 10.2**

**Property 52: Transaction failures roll back completely**
*For any* database transaction that fails partway through, all changes within that transaction should be rolled back, leaving the database in its pre-transaction state.
**Validates: Requirements 10.6**

### Error Handling Properties

**Property 53: Validation errors describe invalid fields**
*For any* validation failure, the error response should include the names of invalid fields and descriptions of why they are invalid.
**Validates: Requirements 13.1**

**Property 54: Server errors hide internal details**
*For any* internal server error, the error response should contain a generic message without exposing stack traces, database details, or internal implementation information.
**Validates: Requirements 13.2**

**Property 55: Not found errors specify resource type**
*For any* request for a non-existent resource, the error response should indicate the resource type (User, Company, Organizer, Request) that was not found.
**Validates: Requirements 13.3**

**Property 56: Errors are logged with context**
*For any* error occurrence, a log entry should be created containing the timestamp, user ID (if available), and error details.
**Validates: Requirements 13.4**

**Property 57: File upload errors are descriptive**
*For any* failed file upload, the error response should indicate the specific reason for failure (invalid type, size exceeded, upload service error).
**Validates: Requirements 13.5**

### Export Properties

**Property 58: CSV exports contain all user's requests with required fields**
*For any* user (Company or Organizer) requesting an export, the generated CSV should contain all their sponsorship requests with request date, counterparty name, event name, status, and sponsorship amount/ask.
**Validates: Requirements 14.1, 14.2, 14.3, 14.4**

**Property 59: Admin statistics export includes platform metrics**
*For any* admin statistics export, the generated report should include total counts of users, companies, organizers, and sponsorship requests.
**Validates: Requirements 14.5**

## Error Handling

### Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email format is invalid"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "path": "/api/auth/register"
}
```

### Error Categories

**Validation Errors (400 Bad Request)**
- Missing required fields
- Invalid data formats (email, URL, date)
- Out-of-range values (negative audience size, file too large)
- Business rule violations (duplicate requests within 30 days)

**Authentication Errors (401 Unauthorized)**
- Missing JWT token
- Expired JWT token
- Invalid JWT token signature
- Invalid login credentials

**Authorization Errors (403 Forbidden)**
- Insufficient role permissions
- Attempting to access another user's resources
- Rate limit exceeded

**Not Found Errors (404 Not Found)**
- Requested resource does not exist
- Include resource type in error message

**Server Errors (500 Internal Server Error)**
- Database connection failures
- External service failures (Cloudinary)
- Unexpected exceptions
- Generic message without internal details

### Exception Handling Strategy

**Global Exception Handler**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
    // Return 400 with field-specific errors
  }
  
  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
    // Return 401 with generic message
  }
  
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    // Return 403 with role requirement
  }
  
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    // Return 404 with resource type
  }
  
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
    // Log full details, return 500 with generic message
  }
}
```

**Logging Strategy**
- All errors logged with SLF4J
- Include user ID, request path, timestamp
- Full stack traces for server errors
- Sanitize sensitive data (passwords, tokens) from logs

**Transaction Management**
- Use `@Transactional` on service methods
- Automatic rollback on unchecked exceptions
- Manual rollback for business rule violations
- Connection pooling with HikariCP

## Testing Strategy

### Dual Testing Approach

SponsorBridge employs both unit testing and property-based testing to ensure comprehensive correctness coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Specific user registration scenarios
- Edge cases like file size limits
- Error handling for specific invalid inputs
- Integration between components

**Property Tests**: Verify universal properties across all inputs
- All 59 correctness properties defined above
- Each property test runs minimum 100 iterations
- Randomized input generation for comprehensive coverage
- Tests validate behavior across the entire input space

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across all possible inputs.

### Property-Based Testing Configuration

**Framework**: We will use **jqwik** for Java property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test (configured via `@Property(tries = 100)`)
- Each test references its design document property via comment tag
- Tag format: `// Feature: sponsor-bridge, Property N: [property text]`

**Example Property Test Structure**:
```java
class AuthenticationPropertiesTest {
  
  @Property(tries = 100)
  // Feature: sponsor-bridge, Property 1: User registration creates accounts with correct roles
  void userRegistrationCreatesAccountsWithCorrectRoles(
    @ForAll @Email String email,
    @ForAll @StringLength(min = 8, max = 50) String password,
    @ForAll @StringLength(min = 2, max = 100) String name,
    @ForAll("validRoles") Role role
  ) {
    RegisterRequest request = new RegisterRequest(email, password, name, role);
    UserDTO user = authService.register(request);
    
    assertThat(user.getRole()).isEqualTo(role);
    assertThat(passwordEncoder.matches(password, userRepository.findById(user.getId()).getPasswordHash())).isTrue();
  }
  
  @Provide
  Arbitrary<Role> validRoles() {
    return Arbitraries.of(Role.ORGANIZER, Role.COMPANY, Role.ADMIN);
  }
}
```

### Test Coverage Requirements

**Unit Test Coverage**:
- Controllers: Test request/response mapping, validation
- Services: Test business logic, error handling
- Repositories: Test custom queries, pagination
- Security: Test JWT generation, validation, role checks
- Integration: Test end-to-end API flows

**Property Test Coverage**:
- Each of the 59 correctness properties must have a corresponding property test
- Properties grouped by functional area (Authentication, Profiles, Search, Requests, etc.)
- Each property test must be tagged with its property number and text

**Test Data Generation**:
- Use jqwik's `@ForAll` for random input generation
- Custom `@Provide` methods for domain-specific data (roles, sponsorship types, statuses)
- Generators for valid and invalid data patterns
- Edge case generators (empty strings, boundary values, null handling)

### Testing Tools and Frameworks

**Backend Testing**:
- JUnit 5 for unit tests
- jqwik for property-based tests
- Mockito for mocking dependencies
- Spring Boot Test for integration tests
- TestContainers for PostgreSQL integration tests
- RestAssured for API testing

**Frontend Testing**:
- Vitest for unit tests
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking
- Playwright for end-to-end tests

### Continuous Integration

- All tests run on every commit
- Property tests run with 100 iterations in CI
- Code coverage reports generated
- Failed property tests report the failing input for reproduction
- Integration tests use TestContainers for isolated database

