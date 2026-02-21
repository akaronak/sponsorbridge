-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ORGANIZER', 'COMPANY', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
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
CREATE TABLE IF NOT EXISTS organizers (
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
CREATE TABLE IF NOT EXISTS sponsorship_requests (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    event_summary TEXT NOT NULL,
    expected_audience_size INTEGER NOT NULL,
    offering TEXT NOT NULL,
    sponsorship_ask TEXT NOT NULL,
    proposal_url VARCHAR(500),
    preferred_communication_mode VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'INTERESTED', 'MORE_INFO_NEEDED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES sponsorship_requests(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 5000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified);
CREATE INDEX IF NOT EXISTS idx_companies_sponsorship_types ON companies USING GIN(sponsorship_types);
CREATE INDEX IF NOT EXISTS idx_organizers_verified ON organizers(verified);
CREATE INDEX IF NOT EXISTS idx_requests_organizer ON sponsorship_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_requests_company ON sponsorship_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON sponsorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON sponsorship_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_request ON messages(request_id);
