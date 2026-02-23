// ============================================================
// Eventra â€" Core Type Definitions
// Production-grade type system for the entire platform
// ============================================================

// â"€â"€â"€ Auth & Users â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type UserRole = 'ORGANIZER' | 'COMPANY' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// â"€â"€â"€ Events â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EventCategory = 'TECH' | 'SPORTS' | 'CULTURAL' | 'ACADEMIC' | 'SOCIAL' | 'OTHER';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  date: string;
  endDate?: string;
  location: string;
  expectedAttendees: number;
  budget: number;
  sponsorshipGoal: number;
  sponsorshipRaised: number;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  location: string;
  expectedAttendees: number;
  budget: number;
  sponsorshipGoal: number;
  tags: string[];
}

// â"€â"€â"€ Sponsors / Companies â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type SponsorTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

export interface Sponsor {
  id: string;
  companyName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  description: string;
  budget: number;
  interests: string[];
  tier: SponsorTier;
  totalSponsored: number;
  activeDeals: number;
  createdAt: string;
}

export interface SponsorMatch {
  sponsor: Sponsor;
  matchScore: number;
  matchReasons: string[];
  estimatedDealValue: number;
}

// â"€â"€â"€ Sponsorship Requests â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NEGOTIATING' | 'COMPLETED';

export interface SponsorshipRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  sponsorId: string;
  sponsorName: string;
  organizerId: string;
  organizerName: string;
  amount: number;
  message: string;
  status: RequestStatus;
  tier: SponsorTier;
  createdAt: string;
  updatedAt: string;
}

// ——— Messages & Real-Time Messaging ————————————————————————

export type MessageType = 'TEXT' | 'PROPOSAL' | 'COUNTER_OFFER' | 'SYSTEM_EVENT' | 'DEAL_ACCEPTED' | 'DEAL_REJECTED' | 'FILE_ATTACHMENT';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';
export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'CLOSED';

export interface Message {
  id: string | number;
  conversationId: string | number;
  senderId: string | number;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  messageType: MessageType;
  content: string;
  status: MessageStatus;
  // Proposal fields
  proposalAmount?: number;
  sponsorshipType?: string;
  proposalTerms?: string;
  goodiesDescription?: string;
  proposalDeadline?: string;
  parentMessageId?: string | number | null;
  // Attachment
  attachmentUrl?: string;
  attachmentName?: string;
  // Metadata
  metadata?: string;
  edited?: boolean;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string | number;
  companyId?: string | number;
  companyName?: string;
  organizerId?: string | number;
  organizerName?: string;
  eventName: string;
  subject?: string;
  status: ConversationStatus;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  participantId: string | number;
  participantName: string;
  participantRole: UserRole;
  participantAvatar?: string;
  createdAt: string;
}

export interface SendMessagePayload {
  content: string;
  messageType?: MessageType;
  proposalAmount?: number;
  sponsorshipType?: string;
  proposalTerms?: string;
  goodiesDescription?: string;
  proposalDeadline?: string;
  parentMessageId?: string | number;
}

export interface CreateConversationPayload {
  participantId: string | number;
  eventName: string;
  subject?: string;
  initialMessage?: string;
}

export interface TypingIndicator {
  conversationId: string | number;
  userId: string | number;
  userName?: string;
  typing: boolean;
}

export interface ReadReceipt {
  conversationId: string | number;
  userId: string | number;
  readAt: string;
}

export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'TYPING' | 'READ_RECEIPT' | 'CONNECTED' | 'AUTH_ERROR' | 'PONG';
  data: unknown;
}

// â"€â"€â"€ Analytics â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalSponsors: number;
  totalRevenue: number;
  revenueGrowth: number;
  pendingRequests: number;
  acceptedRequests: number;
  matchRate: number;
  unreadMessages: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  deals: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

// â"€â"€â"€ AI Module â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  actions?: AIAction[];
}

export interface AIAction {
  id: string;
  type: 'MATCH_SPONSOR' | 'OPTIMIZE_EVENT' | 'SEND_PROPOSAL' | 'ANALYZE_MARKET';
  label: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface AIRecommendation {
  id: string;
  type: 'SPONSOR_MATCH' | 'PRICING_SUGGESTION' | 'EVENT_OPTIMIZATION' | 'MARKET_INSIGHT';
  title: string;
  description: string;
  confidence: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actionable: boolean;
  data?: Record<string, unknown>;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// â"€â"€â"€ Notifications â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// â"€â"€â"€ API â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ——— Company Dashboard ———————————————————————————————

export type SponsorshipType = 'MONETARY' | 'GOODIES' | 'HYBRID';
export type ProposalStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type CredibilityLevel = 'HIGH' | 'MODERATE' | 'NEW';
export type DealStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type IndustryType = 'TECHNOLOGY' | 'FINANCE' | 'HEALTHCARE' | 'EDUCATION' | 'ENTERTAINMENT' | 'RETAIL' | 'FOOD_BEVERAGE' | 'SPORTS' | 'AUTOMOTIVE' | 'OTHER';

export interface CredibilityScore {
  overall: number;            // 0-100
  level: CredibilityLevel;
  factors: {
    pastPerformance: number;  // 0-25
    dealCompletion: number;   // 0-25
    responseTime: number;     // 0-20
    audienceVerified: number; // 0-15
    ratings: number;          // 0-15
  };
  totalEvents: number;
  completedDeals: number;
  avgRating: number;
}

export interface DiscoverableEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  date: string;
  endDate?: string;
  location: string;
  expectedAttendees: number;
  budgetRequired: number;
  sponsorshipType: SponsorshipType;
  sponsorshipGoal: number;
  sponsorshipRaised: number;
  applicationDeadline: string;
  tags: string[];
  industry: IndustryType;
  imageUrl?: string;
  credibility: CredibilityScore;
  createdAt: string;
}

export interface CompanyStats {
  totalRequests: number;
  activePartnerships: number;
  upcomingSponsored: number;
  responseRate: number;
  avgDealValue: number;
  totalInvested: number;
  pendingProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  investmentGrowth: number;
}

export interface Proposal {
  id: string;
  eventId: string;
  eventTitle: string;
  companyId: string;
  companyName: string;
  organizerId: string;
  organizerName: string;
  monetaryOffer: number;
  goodiesDescription?: string;
  conditions?: string;
  brandingExpectations?: string;
  negotiationDeadline: string;
  status: ProposalStatus;
  counterOffer?: {
    amount: number;
    message: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NegotiationThread {
  id: string;
  proposalId: string;
  messages: NegotiationMessage[];
  status: ProposalStatus;
  createdAt: string;
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  attachments?: string[];
  createdAt: string;
}

export interface Deal {
  id: string;
  proposalId: string;
  eventId: string;
  eventTitle: string;
  companyId: string;
  companyName: string;
  organizerId: string;
  organizerName: string;
  agreedAmount: number;
  sponsorshipType: SponsorshipType;
  tier?: SponsorTier;
  status: DealStatus;
  agreedTerms?: string;
  startDate: string;
  endDate: string;
  deliverables: { id: string; label: string; completed: boolean }[];
  createdAt: string;
}

export interface EventFilter {
  search?: string;
  eventType?: EventCategory[];
  industry?: IndustryType[];
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  sponsorshipType?: SponsorshipType[];
  audienceMin?: number;
  audienceMax?: number;
  credibilityLevel?: CredibilityLevel[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'budget' | 'audience' | 'credibility' | 'deadline';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  industry: IndustryType;
  description: string;
  website?: string;
  logoUrl?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  budget: number;
  interests: EventCategory[];
  preferredSponsorshipTypes: SponsorshipType[];
  createdAt: string;
}
