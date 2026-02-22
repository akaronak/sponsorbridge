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

-- ═══════════════════════════════════════════════════════════════
-- Real-time Messaging System Tables
-- ═══════════════════════════════════════════════════════════════

-- Conversations table (negotiation threads between Company ↔ Organizer)
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organizer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    request_id BIGINT REFERENCES sponsorship_requests(id) ON DELETE SET NULL,
    subject VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'ARCHIVED', 'CLOSED')),
    last_message_preview VARCHAR(255),
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unread_company INT NOT NULL DEFAULT 0,
    unread_organizer INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation messages
CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL DEFAULT 'TEXT'
        CHECK (message_type IN ('TEXT', 'PROPOSAL', 'COUNTER_OFFER', 'SYSTEM_EVENT', 'DEAL_ACCEPTED', 'DEAL_REJECTED', 'FILE_ATTACHMENT')),
    content TEXT NOT NULL CHECK (LENGTH(content) <= 10000),
    status VARCHAR(50) NOT NULL DEFAULT 'SENT'
        CHECK (status IN ('SENT', 'DELIVERED', 'READ')),
    proposal_amount DECIMAL(12, 2),
    sponsorship_type VARCHAR(50),
    proposal_terms TEXT,
    goodies_description TEXT,
    proposal_deadline TIMESTAMP,
    parent_message_id BIGINT,
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    metadata TEXT,
    edited BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL
        CHECK (notification_type IN ('NEW_MESSAGE', 'PROPOSAL_RECEIVED', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'COUNTER_OFFER', 'DEAL_CREATED', 'DEAL_COMPLETED', 'SYSTEM_ALERT')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE SET NULL,
    action_url VARCHAR(500),
    actor_id BIGINT,
    actor_name VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messaging system
CREATE INDEX IF NOT EXISTS idx_conv_company ON conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_conv_organizer ON conversations(organizer_id);
CREATE INDEX IF NOT EXISTS idx_conv_event ON conversations(event_name);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_cmsg_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_cmsg_sender ON conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_cmsg_created ON conversation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_cmsg_status ON conversation_messages(status);
CREATE INDEX IF NOT EXISTS idx_cmsg_type ON conversation_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(notification_type);
