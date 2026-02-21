# Requirements Document: SponsorBridge

## Introduction

SponsorBridge is a centralized marketplace platform that connects event organizers with potential sponsors. The platform addresses the inefficiencies in current sponsorship discovery and outreach processes by providing structured search, filtering, request management, and communication tracking capabilities. The system serves three primary user roles: Organizers (who seek sponsorships), Companies (who provide sponsorships), and Admins (who moderate the platform).

## Glossary

- **System**: The SponsorBridge platform
- **Organizer**: A user who seeks sponsorship for events (college fest teams, hackathon organizers, communities, etc.)
- **Company**: A user representing a business entity that provides sponsorships
- **Admin**: A privileged user who moderates platform content and approves profiles
- **Sponsorship_Request**: A formal request from an Organizer to a Company for sponsorship
- **Profile**: A user's account information and associated metadata
- **Authentication_Service**: The component responsible for user identity verification
- **Database**: The PostgreSQL data persistence layer
- **API**: The REST API backend service built with Spring Boot
- **Frontend**: The React-based user interface
- **JWT_Token**: JSON Web Token used for authentication
- **Proposal**: A PDF document uploaded by Organizers describing their event
- **Sponsorship_Type**: Categories of sponsorship (Monetary, Goodies, Internship, Mentorship, Judges)
- **Request_Status**: The state of a Sponsorship_Request (Pending, Accepted, Rejected, Interested, More_Info_Needed)

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want to securely register and log in to the platform, so that I can access role-specific features.

#### Acceptance Criteria

1. WHEN a user submits valid registration credentials, THE System SHALL create a new user account with the specified role
2. WHEN a user submits invalid registration data, THE System SHALL reject the registration and return descriptive error messages
3. WHEN a user submits valid login credentials, THE Authentication_Service SHALL generate a JWT_Token valid for 24 hours
4. WHEN a user submits invalid login credentials, THE Authentication_Service SHALL reject the login attempt and return an authentication error
5. WHEN a user accesses a protected endpoint with a valid JWT_Token, THE System SHALL authorize the request
6. WHEN a user accesses a protected endpoint without a valid JWT_Token, THE System SHALL return an unauthorized error
7. THE System SHALL hash all passwords using BCrypt before storing them in the Database
8. WHEN a JWT_Token expires, THE System SHALL require the user to re-authenticate

### Requirement 2: Company Profile Management

**User Story:** As a company representative, I want to create and manage a detailed sponsorship profile, so that organizers can discover and understand our sponsorship offerings.

#### Acceptance Criteria

1. WHEN a Company user creates a profile, THE System SHALL require company name, industry, location, website, and contact person
2. WHEN a Company user specifies sponsorship types, THE System SHALL accept one or more of: Monetary, Goodies, Internship, Mentorship, Judges
3. WHEN a Company user sets a budget range, THE System SHALL store the minimum and maximum values
4. WHEN a Company user updates their profile, THE System SHALL persist the changes to the Database immediately
5. WHEN a Company user adds past sponsorships, THE System SHALL store them as a list associated with the profile
6. THE System SHALL validate that website URLs follow proper URL format
7. THE System SHALL validate that location data is non-empty
8. WHEN an Admin approves a Company profile, THE System SHALL mark the profile as verified and make it visible in search results

### Requirement 3: Organizer Profile Management

**User Story:** As an organizer, I want to create a profile with event details, so that companies can evaluate my sponsorship requests.

#### Acceptance Criteria

1. WHEN an Organizer creates a profile, THE System SHALL require organizer name, institution or community name, and event name
2. WHEN an Organizer specifies event details, THE System SHALL require event type, event date, and expected footfall
3. WHEN an Organizer uploads a proposal, THE System SHALL accept PDF files up to 10MB in size
4. WHEN an Organizer uploads a non-PDF file, THE System SHALL reject the upload and return an error
5. WHEN an Organizer uploads a file exceeding 10MB, THE System SHALL reject the upload and return a size limit error
6. THE System SHALL store proposal files using Cloudinary and save the URL in the Database
7. WHEN an Organizer adds social media links, THE System SHALL validate that they follow proper URL format
8. WHEN an Organizer updates their profile, THE System SHALL persist the changes to the Database immediately

### Requirement 4: Sponsor Search and Discovery

**User Story:** As an organizer, I want to search and filter companies by various criteria, so that I can find relevant sponsors for my event.

#### Acceptance Criteria

1. WHEN an Organizer searches without filters, THE System SHALL return all verified Company profiles with pagination
2. WHEN an Organizer applies a location filter, THE System SHALL return only companies matching that location
3. WHEN an Organizer applies an industry filter, THE System SHALL return only companies in that industry
4. WHEN an Organizer applies a sponsorship type filter, THE System SHALL return only companies offering that sponsorship type
5. WHEN an Organizer applies a budget range filter, THE System SHALL return only companies whose budget range overlaps with the specified range
6. WHEN an Organizer applies multiple filters, THE System SHALL return companies matching all specified criteria
7. THE System SHALL return search results in pages of 20 companies per page
8. WHEN an Organizer requests a specific page, THE System SHALL return the corresponding page of results
9. THE System SHALL include company name, industry, location, sponsorship types, and budget range in search results

### Requirement 5: Sponsorship Request Creation

**User Story:** As an organizer, I want to send structured sponsorship requests to companies, so that I can formally request sponsorship with all necessary details.

#### Acceptance Criteria

1. WHEN an Organizer creates a sponsorship request, THE System SHALL require event summary, expected audience size, offering description, and sponsorship ask
2. WHEN an Organizer submits a request, THE System SHALL create a Sponsorship_Request with status "Pending"
3. WHEN an Organizer attaches a proposal, THE System SHALL associate the proposal URL with the request
4. WHEN an Organizer specifies preferred communication mode, THE System SHALL store it with the request
5. THE System SHALL validate that expected audience size is a positive integer
6. THE System SHALL validate that sponsorship ask is non-empty
7. WHEN a request is created, THE System SHALL record the creation timestamp
8. THE System SHALL prevent Organizers from creating duplicate requests to the same Company within 30 days

### Requirement 6: Sponsorship Request Management

**User Story:** As a company representative, I want to view and manage incoming sponsorship requests, so that I can respond appropriately to organizers.

#### Acceptance Criteria

1. WHEN a Company user views their requests, THE System SHALL display all Sponsorship_Requests sent to that company
2. WHEN a Company user accepts a request, THE System SHALL update the Request_Status to "Accepted"
3. WHEN a Company user rejects a request, THE System SHALL update the Request_Status to "Rejected"
4. WHEN a Company user marks a request as interested, THE System SHALL update the Request_Status to "Interested"
5. WHEN a Company user requests more details, THE System SHALL update the Request_Status to "More_Info_Needed"
6. THE System SHALL display requests sorted by creation date with newest first
7. WHEN a Company user filters requests by status, THE System SHALL return only requests matching that status
8. THE System SHALL display organizer name, event name, event date, and sponsorship ask for each request

### Requirement 7: Communication and Messaging

**User Story:** As a user, I want to communicate with other users through the platform, so that I can discuss sponsorship details without external tools.

#### Acceptance Criteria

1. WHEN a Company user sends a message to an Organizer, THE System SHALL create a message record associated with the Sponsorship_Request
2. WHEN an Organizer sends a message to a Company, THE System SHALL create a message record associated with the Sponsorship_Request
3. THE System SHALL store message content, sender ID, recipient ID, and timestamp
4. WHEN a user views a conversation, THE System SHALL display all messages sorted chronologically
5. THE System SHALL validate that message content is non-empty and does not exceed 5000 characters
6. WHEN a message is sent, THE System SHALL record the timestamp immediately

### Requirement 8: Cold Outreach Email Generation

**User Story:** As an organizer, I want to generate structured email templates for cold outreach, so that I can contact companies outside the platform with professional formatting.

#### Acceptance Criteria

1. WHEN an Organizer requests an email template for a Company, THE System SHALL generate a template with auto-filled event details
2. THE System SHALL include organizer name, event name, event type, event date, and expected footfall in the template
3. THE System SHALL include the Company name and contact person in the template
4. THE System SHALL format the email with professional structure including greeting, body, and closing
5. WHEN an Organizer copies the template, THE System SHALL provide the text in a copyable format

### Requirement 9: Admin Moderation

**User Story:** As an admin, I want to moderate platform content and approve profiles, so that I can maintain platform quality and prevent spam.

#### Acceptance Criteria

1. WHEN an Admin views pending Company profiles, THE System SHALL display all unverified Company profiles
2. WHEN an Admin approves a Company profile, THE System SHALL mark it as verified and make it searchable
3. WHEN an Admin rejects a Company profile, THE System SHALL mark it as rejected and notify the company user
4. WHEN an Admin views pending Organizer profiles, THE System SHALL display all unverified Organizer profiles
5. WHEN an Admin approves an Organizer profile, THE System SHALL mark it as verified
6. WHEN an Admin removes spam content, THE System SHALL delete the associated profile and user account
7. THE System SHALL display total sponsorship request volume to Admins
8. THE System SHALL allow Admins to view all users, companies, and organizers

### Requirement 10: Data Persistence and Integrity

**User Story:** As a system administrator, I want data to be reliably stored and maintained, so that the platform operates consistently and data is not lost.

#### Acceptance Criteria

1. THE Database SHALL store all user accounts with unique email addresses
2. THE Database SHALL enforce foreign key relationships between Users, Companies, Organizers, and Sponsorship_Requests
3. WHEN a user is deleted, THE System SHALL cascade delete associated profiles and requests
4. THE Database SHALL index location, industry, and sponsorship_type columns for search performance
5. THE System SHALL validate all data before persisting to the Database
6. WHEN a database transaction fails, THE System SHALL roll back all changes and return an error
7. THE System SHALL maintain referential integrity between all related entities

### Requirement 11: Security and Access Control

**User Story:** As a system administrator, I want robust security measures in place, so that user data is protected and unauthorized access is prevented.

#### Acceptance Criteria

1. THE System SHALL restrict Company profile endpoints to users with Company role
2. THE System SHALL restrict Organizer profile endpoints to users with Organizer role
3. THE System SHALL restrict Admin endpoints to users with Admin role
4. WHEN a user attempts to access an unauthorized endpoint, THE System SHALL return a forbidden error
5. THE System SHALL implement rate limiting of 100 requests per minute per user
6. WHEN rate limit is exceeded, THE System SHALL return a rate limit error
7. THE System SHALL validate all file uploads for malicious content
8. THE System SHALL sanitize all user input to prevent SQL injection and XSS attacks

### Requirement 12: Performance and Scalability

**User Story:** As a user, I want the platform to respond quickly to my actions, so that I can efficiently search for sponsors and manage requests.

#### Acceptance Criteria

1. WHEN an Organizer searches for companies, THE API SHALL return results within 500 milliseconds
2. WHEN a user loads their dashboard, THE Frontend SHALL display content within 2 seconds
3. THE System SHALL implement lazy loading for company listings
4. THE System SHALL paginate all list endpoints with a default page size of 20 items
5. WHEN the Database contains more than 10,000 companies, THE System SHALL maintain search performance under 500 milliseconds
6. THE System SHALL use database connection pooling to handle concurrent requests efficiently

### Requirement 13: Error Handling and Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can understand and correct issues.

#### Acceptance Criteria

1. WHEN validation fails, THE System SHALL return error messages describing which fields are invalid and why
2. WHEN a server error occurs, THE System SHALL return a generic error message without exposing internal details
3. WHEN a resource is not found, THE System SHALL return a not found error with the resource type
4. THE System SHALL log all errors with timestamp, user ID, and error details for debugging
5. WHEN a file upload fails, THE System SHALL return a descriptive error indicating the failure reason
6. THE Frontend SHALL display error messages to users in a user-friendly format

### Requirement 14: Data Export and Reporting

**User Story:** As a company representative, I want to export my sponsorship request history, so that I can analyze sponsorship patterns and maintain records.

#### Acceptance Criteria

1. WHEN a Company user requests an export, THE System SHALL generate a CSV file containing all their sponsorship requests
2. THE System SHALL include request date, organizer name, event name, status, and sponsorship amount in the export
3. WHEN an Organizer requests an export, THE System SHALL generate a CSV file containing all their sent requests
4. THE System SHALL include request date, company name, status, and sponsorship ask in the export
5. WHEN an Admin requests platform statistics, THE System SHALL generate a report with total users, companies, organizers, and requests

