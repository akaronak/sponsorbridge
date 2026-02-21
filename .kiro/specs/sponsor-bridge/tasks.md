# Implementation Plan: SponsorBridge

## Overview

This implementation plan breaks down the SponsorBridge platform into incremental, testable steps. The approach follows a bottom-up strategy: starting with database and core entities, then building authentication and security, followed by business logic services, API endpoints, and finally the frontend. Each major component includes property-based tests to validate correctness properties from the design document.

The implementation uses Java with Spring Boot for the backend and React with TypeScript for the frontend. Property-based testing uses jqwik for Java backend tests.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create Spring Boot project with dependencies: Spring Web, Spring Security, Spring Data JPA, PostgreSQL Driver, BCrypt, JWT library (jjwt), Hibernate, Validation API
  - Create React project with Vite, TypeScript, Tailwind CSS, Axios, React Router
  - Configure PostgreSQL database connection in application.properties
  - Add jqwik dependency for property-based testing
  - Set up project directory structure (controllers, services, repositories, entities, DTOs, security, config)
  - _Requirements: All_

- [x] 2. Implement database schema and JPA entities
  - [x] 2.1 Create User entity with JPA annotations
    - Define User entity with id, email, passwordHash, name, role, createdAt, updatedAt
    - Add unique constraint on email
    - Add cascade relationships to Company and Organizer
    - _Requirements: 1.1, 10.1_

  - [x] 2.2 Create Company entity with JPA annotations
    - Define Company entity with all fields from design
    - Use custom type for PostgreSQL arrays (sponsorshipTypes, preferredEventTypes, pastSponsorships)
    - Add OneToOne relationship to User
    - Add OneToMany relationship to SponsorshipRequest
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 2.3 Create Organizer entity with JPA annotations
    - Define Organizer entity with all fields from design
    - Use custom type for PostgreSQL arrays (socialMediaLinks)
    - Add OneToOne relationship to User
    - Add OneToMany relationship to SponsorshipRequest
    - _Requirements: 3.1, 3.2_

  - [x] 2.4 Create SponsorshipRequest entity with JPA annotations
    - Define SponsorshipRequest entity with all fields
    - Add ManyToOne relationships to Organizer and Company
    - Add OneToMany relationship to Message
    - Add status enum with CHECK constraint
    - _Requirements: 5.1, 5.2_

  - [x] 2.5 Create Message entity with JPA annotations
    - Define Message entity with id, requestId, senderId, content, createdAt
    - Add ManyToOne relationships to SponsorshipRequest and User
    - Add CHECK constraint for content length (max 5000 characters)
    - _Requirements: 7.3, 7.5_

  - [x] 2.6 Create JPA repositories for all entities
    - Create UserRepository extending JpaRepository
    - Create CompanyRepository with custom query methods for search
    - Create OrganizerRepository
    - Create SponsorshipRequestRepository with custom queries
    - Create MessageRepository
    - _Requirements: 10.2_

  - [x] 2.7 Create database indexes
    - Add indexes on companies(location, industry, verified)
    - Add GIN index on companies(sponsorship_types)
    - Add indexes on sponsorship_requests(organizer_id, company_id, status, created_at)
    - Add index on messages(request_id)
    - _Requirements: 10.4_


  - [ ]* 2.8 Write property tests for data integrity
    - **Property 50: Email addresses are unique**
    - **Validates: Requirements 10.1**
    - **Property 51: Foreign key relationships are enforced**
    - **Validates: Requirements 10.2**
    - **Property 47: User deletion cascades to related entities**
    - **Validates: Requirements 9.6, 10.3**

- [x] 3. Implement authentication and security infrastructure
  - [x] 3.1 Create JWT token provider
    - Implement JwtTokenProvider with methods: generateToken, validateToken, getUserIdFromToken, getRoleFromToken
    - Configure token expiration to 24 hours
    - Use secret key from application.properties
    - _Requirements: 1.3, 1.8_

  - [x] 3.2 Create custom UserDetailsService
    - Implement loadUserByUsername to load users from database
    - Map User entity to Spring Security UserDetails
    - _Requirements: 1.3, 1.4_

  - [x] 3.3 Create JWT authentication filter
    - Implement OncePerRequestFilter to extract and validate JWT from Authorization header
    - Set authentication in SecurityContext for valid tokens
    - _Requirements: 1.5, 1.6_

  - [x] 3.4 Configure Spring Security
    - Create SecurityConfig with HttpSecurity configuration
    - Disable CSRF for stateless API
    - Configure endpoint authorization rules by role
    - Add JWT filter to security chain
    - Configure BCrypt password encoder
    - _Requirements: 1.7, 11.1, 11.2, 11.3_

  - [x] 3.5 Implement rate limiting interceptor
    - Create RateLimitInterceptor using token bucket or sliding window algorithm
    - Configure 100 requests per minute per user
    - Store rate limit state in memory (ConcurrentHashMap) or Redis
    - _Requirements: 11.5, 11.6_


  - [ ]* 3.6 Write property tests for authentication
    - **Property 1: User registration creates accounts with correct roles**
    - **Validates: Requirements 1.1, 1.7**
    - **Property 3: Valid login credentials generate valid JWT tokens**
    - **Validates: Requirements 1.3**
    - **Property 4: Invalid login credentials are rejected**
    - **Validates: Requirements 1.4**
    - **Property 5: Valid JWT tokens authorize protected endpoint access**
    - **Validates: Requirements 1.5**
    - **Property 6: Missing or invalid JWT tokens deny access**
    - **Validates: Requirements 1.6**

  - [ ]* 3.7 Write property tests for authorization and security
    - **Property 7: Role-based access control restricts endpoints**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
    - **Property 8: Rate limiting prevents excessive requests**
    - **Validates: Requirements 11.5, 11.6**
    - **Property 9: User input is sanitized to prevent injection attacks**
    - **Validates: Requirements 11.8**

- [x] 4. Implement DTOs and validation
  - [x] 4.1 Create request DTOs with validation annotations
    - RegisterRequest: email, password, name, role with @NotNull, @Email, @Size annotations
    - LoginRequest: email, password with validation
    - CompanyRequest: all company fields with validation
    - OrganizerRequest: all organizer fields with validation
    - RequestRequest: all sponsorship request fields with validation
    - MessageRequest: content with @NotEmpty and @Size(max=5000)
    - _Requirements: 1.2, 2.1, 3.1, 5.1, 7.5_

  - [x] 4.2 Create response DTOs
    - UserDTO, CompanyDTO, OrganizerDTO, RequestDTO, MessageDTO
    - LoginResponse with token, role, userId, expiresIn
    - PlatformStatsDTO for admin statistics
    - ErrorResponse for consistent error formatting
    - _Requirements: All_

  - [x] 4.3 Create DTO mappers
    - Implement mapper methods to convert entities to DTOs
    - Use ModelMapper or MapStruct for automatic mapping
    - _Requirements: All_


- [x] 5. Implement authentication service and controller
  - [x] 5.1 Create AuthService
    - Implement register method with password hashing and user creation
    - Implement login method with credential validation and JWT generation
    - Implement validateToken method
    - Add duplicate email check in registration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_

  - [x] 5.2 Create AuthController
    - POST /api/auth/register endpoint
    - POST /api/auth/login endpoint
    - GET /api/auth/validate endpoint
    - Add @Valid annotations for request validation
    - _Requirements: 1.1, 1.3_

  - [ ]* 5.3 Write property tests for validation
    - **Property 2: Invalid registration data is rejected with descriptive errors**
    - **Validates: Requirements 1.2**

- [x] 6. Implement Cloudinary file upload service
  - [x] 6.1 Configure Cloudinary SDK
    - Add Cloudinary dependency to pom.xml
    - Configure Cloudinary credentials in application.properties
    - _Requirements: 3.3, 3.6_

  - [x] 6.2 Create FileUploadService
    - Implement uploadProposal method accepting MultipartFile
    - Validate file type (PDF only) and size (max 10MB)
    - Upload to Cloudinary and return URL
    - Handle upload failures with descriptive errors
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [ ]* 6.3 Write property tests for file upload
    - **Property 18: File uploads validate type and size**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 8. Implement Company profile service and controller
  - [x] 8.1 Create CompanyService
    - Implement createCompany method with validation
    - Implement getCompanyById method
    - Implement updateCompany method with ownership check
    - Implement searchCompanies with filter criteria and pagination
    - Implement getPendingCompanies for admin
    - Implement approveCompany and rejectCompany for admin
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 8.2 Create CompanyController
    - POST /api/companies endpoint (requires COMPANY role)
    - GET /api/companies/{id} endpoint
    - PUT /api/companies/{id} endpoint (requires COMPANY role, ownership check)
    - GET /api/companies/search endpoint with query parameters
    - Add pagination support with @PageableDefault
    - _Requirements: 2.1, 2.4, 4.1, 4.7, 4.8_

  - [ ]* 8.3 Write property tests for company profile management
    - **Property 10: Company profiles require all mandatory fields**
    - **Validates: Requirements 2.1**
    - **Property 11: Sponsorship types are validated against allowed values**
    - **Validates: Requirements 2.2**
    - **Property 12: Profile data persists correctly through updates**
    - **Validates: Requirements 2.4, 3.8**
    - **Property 13: Budget ranges round-trip correctly**
    - **Validates: Requirements 2.3**
    - **Property 14: URL validation enforces proper format**
    - **Validates: Requirements 2.6, 3.7**
    - **Property 15: Location validation prevents empty values**
    - **Validates: Requirements 2.7**

  - [ ]* 8.4 Write property tests for company search
    - **Property 19: Unfiltered search returns only verified companies with pagination**
    - **Validates: Requirements 4.1, 4.7**
    - **Property 20: Location filter returns only matching companies**
    - **Validates: Requirements 4.2**
    - **Property 21: Industry filter returns only matching companies**
    - **Validates: Requirements 4.3**
    - **Property 22: Sponsorship type filter returns only matching companies**
    - **Validates: Requirements 4.4**
    - **Property 23: Budget range filter returns companies with overlapping ranges**
    - **Validates: Requirements 4.5**
    - **Property 24: Multiple filters combine with AND logic**
    - **Validates: Requirements 4.6**
    - **Property 25: Pagination returns correct page of results**
    - **Validates: Requirements 4.8**
    - **Property 26: Search results include all required fields**
    - **Validates: Requirements 4.9**


- [x] 9. Implement Organizer profile service and controller
  - [x] 9.1 Create OrganizerService
    - Implement createOrganizer method with validation and file upload
    - Implement getOrganizerById method
    - Implement updateOrganizer method with ownership check
    - Implement getPendingOrganizers for admin
    - Implement approveOrganizer for admin
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8_

  - [x] 9.2 Create OrganizerController
    - POST /api/organizers endpoint (requires ORGANIZER role, multipart/form-data)
    - GET /api/organizers/{id} endpoint
    - PUT /api/organizers/{id} endpoint (requires ORGANIZER role, ownership check)
    - _Requirements: 3.1, 3.8_

  - [ ]* 9.3 Write property tests for organizer profile management
    - **Property 17: Organizer profiles require all mandatory fields**
    - **Validates: Requirements 3.1, 3.2**

- [x] 10. Implement sponsorship request service and controller
  - [x] 10.1 Create RequestService
    - Implement createRequest method with validation and duplicate check
    - Implement getRequestById method
    - Implement getRequestsByOrganizer with pagination and status filter
    - Implement getRequestsByCompany with pagination and status filter
    - Implement updateRequestStatus with authorization check
    - Implement isDuplicateRequest checking 30-day window
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 10.2 Create RequestController
    - POST /api/requests endpoint (requires ORGANIZER role)
    - GET /api/requests/organizer/{organizerId} endpoint with pagination
    - GET /api/requests/company/{companyId} endpoint with pagination
    - PUT /api/requests/{id}/status endpoint (requires COMPANY role)
    - GET /api/requests/{id} endpoint
    - _Requirements: 5.1, 6.1, 6.2_


  - [ ]* 10.3 Write property tests for sponsorship requests
    - **Property 27: Request creation requires all mandatory fields**
    - **Validates: Requirements 5.1**
    - **Property 28: New requests have Pending status**
    - **Validates: Requirements 5.2**
    - **Property 29: Optional fields persist correctly**
    - **Validates: Requirements 5.3, 5.4**
    - **Property 30: Expected audience size must be positive**
    - **Validates: Requirements 5.5**
    - **Property 31: Sponsorship ask must be non-empty**
    - **Validates: Requirements 5.6**
    - **Property 32: Entity creation records timestamps**
    - **Validates: Requirements 5.7, 7.6**
    - **Property 33: Duplicate requests within 30 days are prevented**
    - **Validates: Requirements 5.8**
    - **Property 34: Companies view only their own requests**
    - **Validates: Requirements 6.1**
    - **Property 35: Status transitions update correctly**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**
    - **Property 36: Requests are sorted by creation date descending**
    - **Validates: Requirements 6.6**
    - **Property 37: Status filter returns only matching requests**
    - **Validates: Requirements 6.7**
    - **Property 38: Request listings include required fields**
    - **Validates: Requirements 6.8**

- [-] 11. Implement messaging service and controller
  - [ ] 11.1 Create MessageService
    - Implement sendMessage method with validation
    - Implement getMessagesByRequest method with chronological sorting
    - Add authorization check to ensure user is part of the request
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 11.2 Create MessageController
    - POST /api/messages endpoint (requires authentication)
    - GET /api/messages/request/{requestId} endpoint (requires authentication)
    - _Requirements: 7.1, 7.4_

  - [ ]* 11.3 Write property tests for messaging
    - **Property 39: Messages are created and associated with requests**
    - **Validates: Requirements 7.1, 7.2, 7.3**
    - **Property 40: Conversation messages are sorted chronologically**
    - **Validates: Requirements 7.4**
    - **Property 41: Message content length is validated**
    - **Validates: Requirements 7.5**


- [ ] 12. Implement email template service and controller
  - [ ] 12.1 Create EmailTemplateService
    - Implement generateTemplate method
    - Fetch organizer and company data
    - Build email template string with greeting, body, and closing
    - Include all required fields: organizer name, event details, company name, contact person
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 12.2 Create EmailTemplateController
    - POST /api/email-template endpoint (requires ORGANIZER role)
    - _Requirements: 8.1_

  - [ ]* 12.3 Write property tests for email templates
    - **Property 42: Email templates include all required event details**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - **Property 43: Email templates have professional structure**
    - **Validates: Requirements 8.4**

- [ ] 13. Implement admin service and controller
  - [ ] 13.1 Create AdminService
    - Implement getPendingCompanies method
    - Implement approveCompany method
    - Implement rejectCompany method
    - Implement getPendingOrganizers method
    - Implement approveOrganizer method
    - Implement deleteUser method with cascade deletion
    - Implement getPlatformStats method with aggregate queries
    - Implement getAllUsers, getAllCompanies, getAllOrganizers methods
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ] 13.2 Create AdminController
    - GET /api/admin/companies/pending endpoint (requires ADMIN role)
    - PUT /api/admin/companies/{id}/approve endpoint (requires ADMIN role)
    - PUT /api/admin/companies/{id}/reject endpoint (requires ADMIN role)
    - GET /api/admin/organizers/pending endpoint (requires ADMIN role)
    - PUT /api/admin/organizers/{id}/approve endpoint (requires ADMIN role)
    - DELETE /api/admin/users/{id} endpoint (requires ADMIN role)
    - GET /api/admin/stats endpoint (requires ADMIN role)
    - GET /api/admin/users, /api/admin/companies, /api/admin/organizers endpoints
    - _Requirements: 9.1, 9.2, 9.6, 9.7, 9.8_


  - [ ]* 13.3 Write property tests for admin operations
    - **Property 16: Admin approval makes profiles searchable**
    - **Validates: Requirements 2.8, 9.2**
    - **Property 44: Pending profile queries return only unverified profiles**
    - **Validates: Requirements 9.1, 9.4**
    - **Property 45: Profile approval updates verification status**
    - **Validates: Requirements 9.5**
    - **Property 46: Profile rejection updates status**
    - **Validates: Requirements 9.3**
    - **Property 48: Admin statistics aggregate correctly**
    - **Validates: Requirements 9.7**
    - **Property 49: Admins can view all entities**
    - **Validates: Requirements 9.8**

- [ ] 14. Implement export service and controller
  - [ ] 14.1 Create ExportService
    - Implement exportCompanyRequests method generating CSV
    - Implement exportOrganizerRequests method generating CSV
    - Implement exportPlatformStats method generating CSV
    - Include all required fields in each export type
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 14.2 Create ExportController
    - GET /api/export/company/{companyId}/requests endpoint (requires COMPANY role)
    - GET /api/export/organizer/{organizerId}/requests endpoint (requires ORGANIZER role)
    - GET /api/export/admin/stats endpoint (requires ADMIN role)
    - Set Content-Type to text/csv and Content-Disposition headers
    - _Requirements: 14.1, 14.3, 14.5_

  - [ ]* 14.3 Write property tests for exports
    - **Property 58: CSV exports contain all user's requests with required fields**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4**
    - **Property 59: Admin statistics export includes platform metrics**
    - **Validates: Requirements 14.5**

- [ ] 15. Implement global exception handler
  - [ ] 15.1 Create GlobalExceptionHandler
    - Handle ValidationException returning 400 with field errors
    - Handle AuthenticationException returning 401
    - Handle AccessDeniedException returning 403
    - Handle ResourceNotFoundException returning 404
    - Handle generic Exception returning 500 with sanitized message
    - Implement error logging with SLF4J
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_


  - [ ]* 15.2 Write property tests for error handling
    - **Property 52: Transaction failures roll back completely**
    - **Validates: Requirements 10.6**
    - **Property 53: Validation errors describe invalid fields**
    - **Validates: Requirements 13.1**
    - **Property 54: Server errors hide internal details**
    - **Validates: Requirements 13.2**
    - **Property 55: Not found errors specify resource type**
    - **Validates: Requirements 13.3**
    - **Property 56: Errors are logged with context**
    - **Validates: Requirements 13.4**
    - **Property 57: File upload errors are descriptive**
    - **Validates: Requirements 13.5**

- [ ] 16. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Set up React frontend project structure
  - [ ] 17.1 Create React app with Vite and TypeScript
    - Initialize project with npm create vite@latest
    - Install dependencies: react-router-dom, axios, tailwindcss
    - Configure Tailwind CSS
    - _Requirements: All frontend_

  - [ ] 17.2 Create project structure
    - Create directories: components, pages, services, hooks, types, utils, context
    - Set up routing with React Router
    - _Requirements: All frontend_

  - [ ] 17.3 Create TypeScript types
    - Define interfaces for User, Company, Organizer, Request, Message
    - Define API response types
    - Define form types for all request DTOs
    - _Requirements: All frontend_

  - [ ] 17.4 Create API service layer
    - Create axios instance with base URL and interceptors
    - Implement API methods for all endpoints
    - Add JWT token to Authorization header
    - Handle token expiration and redirect to login
    - _Requirements: 1.5, 1.6, 1.8_


- [ ] 18. Implement authentication components
  - [ ] 18.1 Create AuthContext for global auth state
    - Implement context with user, token, login, logout, register methods
    - Store JWT in localStorage
    - Provide auth state to entire app
    - _Requirements: 1.1, 1.3_

  - [ ] 18.2 Create LoginForm component
    - Build form with email and password fields
    - Call login API on submit
    - Store JWT token and redirect to dashboard
    - Display error messages
    - _Requirements: 1.3, 1.4_

  - [ ] 18.3 Create RegisterForm component
    - Build form with email, password, name, and role selection
    - Call register API on submit
    - Redirect to login after successful registration
    - Display validation errors
    - _Requirements: 1.1, 1.2_

  - [ ] 18.4 Create ProtectedRoute component
    - Check JWT validity before rendering protected routes
    - Redirect to login if token is missing or expired
    - _Requirements: 1.6, 1.8_

- [ ] 19. Implement organizer components
  - [ ] 19.1 Create OrganizerDashboard component
    - Display organizer profile summary
    - Show recent sponsorship requests with status
    - Add navigation to search and create request
    - _Requirements: 3.1, 6.1_

  - [ ] 19.2 Create OrganizerProfileForm component
    - Build form for creating/editing organizer profile
    - Include file upload for proposal (PDF only, max 10MB)
    - Display validation errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

  - [ ] 19.3 Create CompanySearch component
    - Build search interface with filter inputs
    - Implement filters: location, industry, sponsorship type, budget range, event type
    - Display search results as cards with pagination
    - Add "View Details" and "Send Request" buttons
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ] 19.4 Create CompanyCard component
    - Display company name, industry, location, sponsorship types, budget range
    - Add action buttons for viewing details and sending requests
    - _Requirements: 4.9_


  - [ ] 19.5 Create RequestForm component
    - Build form for creating sponsorship requests
    - Include fields: event summary, expected audience size, offering, sponsorship ask, proposal attachment, preferred communication mode
    - Display validation errors
    - Show success message and redirect after submission
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 19.6 Create RequestList component
    - Display list of sent requests with status badges
    - Show company name, event name, status, created date
    - Add filtering by status
    - Implement pagination
    - Add "View Details" button for each request
    - _Requirements: 6.1, 6.6, 6.7, 6.8_

  - [ ] 19.7 Create EmailTemplateModal component
    - Display generated email template in a modal
    - Add "Copy to Clipboard" button
    - Show company contact information
    - _Requirements: 8.1, 8.5_

- [ ] 20. Implement company components
  - [ ] 20.1 Create CompanyDashboard component
    - Display company profile summary
    - Show request statistics (pending, accepted, rejected)
    - Add navigation to profile edit and incoming requests
    - _Requirements: 2.1, 6.1_

  - [ ] 20.2 Create CompanyProfileForm component
    - Build form for creating/editing company profile
    - Include all company fields with validation
    - Support multiple sponsorship types and event types selection
    - Display validation errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 20.3 Create IncomingRequests component
    - Display list of received sponsorship requests
    - Show organizer name, event name, event date, sponsorship ask, status
    - Add filtering by status
    - Implement pagination
    - Add "View Details" button for each request
    - _Requirements: 6.1, 6.6, 6.7, 6.8_

  - [ ] 20.4 Create RequestDetail component
    - Display full request details
    - Show action buttons: Accept, Reject, Mark Interested, Request More Details
    - Display message thread
    - Add message input for communication
    - Update status on action button click
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 7.1, 7.4_


  - [ ] 20.5 Create MessageThread component
    - Display messages in chronological order
    - Show sender name and timestamp for each message
    - Add message input field with character counter (max 5000)
    - Implement send message functionality
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 21. Implement admin components
  - [ ] 21.1 Create AdminDashboard component
    - Display platform statistics: total users, companies, organizers, requests
    - Show charts for request volume and status distribution
    - Add navigation to moderation queues
    - _Requirements: 9.7_

  - [ ] 21.2 Create PendingProfiles component
    - Display tabs for pending companies and pending organizers
    - Show profile details with Approve/Reject buttons
    - Update verification status on action
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 21.3 Create UserManagement component
    - Display list of all users with role badges
    - Show associated company or organizer name
    - Add "Delete User" button with confirmation modal
    - Implement search and filtering
    - _Requirements: 9.6, 9.8_

  - [ ] 21.4 Create PlatformStats component
    - Display detailed statistics with charts
    - Show request trends over time
    - Add export button for CSV download
    - _Requirements: 9.7, 14.5_

- [ ] 22. Implement shared UI components
  - [ ] 22.1 Create Navbar component
    - Display logo and navigation links based on user role
    - Show user name and logout button
    - Implement responsive mobile menu
    - _Requirements: All_

  - [ ] 22.2 Create ErrorMessage component
    - Display error messages with appropriate styling
    - Support field-specific errors and general errors
    - _Requirements: 13.1, 13.2, 13.3, 13.5_

  - [ ] 22.3 Create LoadingSpinner component
    - Display loading indicator during API calls
    - _Requirements: All_

  - [ ] 22.4 Create Pagination component
    - Display page numbers and navigation buttons
    - Handle page change events
    - _Requirements: 4.7, 4.8, 6.1_


  - [ ] 22.5 Create StatusBadge component
    - Display request status with color coding
    - Support all status types: Pending, Accepted, Rejected, Interested, More_Info_Needed
    - _Requirements: 5.2, 6.2, 6.3, 6.4, 6.5_

  - [ ] 22.6 Create ConfirmationModal component
    - Display confirmation dialog for destructive actions
    - Support custom messages and action buttons
    - _Requirements: 9.6_

- [ ] 23. Implement routing and navigation
  - [ ] 23.1 Set up React Router routes
    - Public routes: /login, /register
    - Organizer routes: /organizer/dashboard, /organizer/profile, /organizer/search, /organizer/requests, /organizer/request/new
    - Company routes: /company/dashboard, /company/profile, /company/requests, /company/request/:id
    - Admin routes: /admin/dashboard, /admin/pending, /admin/users, /admin/stats
    - Wrap protected routes with ProtectedRoute component
    - _Requirements: All_

  - [ ] 23.2 Implement role-based route guards
    - Redirect users to appropriate dashboard based on role
    - Prevent access to routes not matching user role
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 24. Implement export functionality in frontend
  - [ ] 24.1 Add export buttons to appropriate pages
    - Add "Export Requests" button to company and organizer request lists
    - Add "Export Statistics" button to admin dashboard
    - _Requirements: 14.1, 14.3, 14.5_

  - [ ] 24.2 Implement CSV download functionality
    - Call export API endpoints
    - Trigger browser download with proper filename
    - Show loading state during export
    - _Requirements: 14.1, 14.3, 14.5_

- [ ] 25. Styling and responsive design
  - [ ] 25.1 Apply Tailwind CSS styling to all components
    - Implement consistent color scheme and typography
    - Add hover and focus states for interactive elements
    - Ensure proper spacing and layout
    - _Requirements: All_

  - [ ] 25.2 Implement responsive design
    - Make all components mobile-friendly
    - Adjust layouts for tablet and desktop screens
    - Test on different screen sizes
    - _Requirements: All_


- [ ] 26. Integration and end-to-end testing
  - [ ]* 26.1 Write integration tests for API endpoints
    - Test complete user flows: registration → login → profile creation → request creation
    - Test authentication and authorization across endpoints
    - Use TestContainers for isolated PostgreSQL database
    - _Requirements: All_

  - [ ]* 26.2 Write frontend component tests
    - Test form validation and submission
    - Test API integration with MSW for mocking
    - Test routing and navigation
    - _Requirements: All_

  - [ ]* 26.3 Write end-to-end tests with Playwright
    - Test complete organizer flow: register → create profile → search companies → send request
    - Test complete company flow: register → create profile → receive request → respond
    - Test admin flow: approve profiles → view statistics
    - _Requirements: All_

- [ ] 27. Deployment preparation
  - [ ] 27.1 Configure production environment variables
    - Set up environment-specific application.properties
    - Configure database connection for production
    - Set JWT secret and Cloudinary credentials
    - _Requirements: All_

  - [ ] 27.2 Create Docker configuration
    - Create Dockerfile for Spring Boot backend
    - Create Dockerfile for React frontend
    - Create docker-compose.yml for local development
    - _Requirements: All_

  - [ ] 27.3 Set up database migrations
    - Create SQL migration scripts for schema creation
    - Add seed data for testing (optional)
    - _Requirements: 10.1, 10.2, 10.4_

  - [ ] 27.4 Build and test production builds
    - Build backend JAR with Maven
    - Build frontend production bundle with Vite
    - Test production builds locally
    - _Requirements: All_

- [ ] 28. Final checkpoint - Ensure all tests pass and application runs
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The implementation follows a bottom-up approach: database → services → controllers → frontend
- Checkpoints ensure incremental validation at key milestones
- All property tests use jqwik with minimum 100 iterations
- Frontend uses React with TypeScript for type safety
- Backend uses Spring Boot with Spring Security for robust authentication and authorization

