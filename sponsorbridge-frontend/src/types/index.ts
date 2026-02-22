// ============================================================
// SponsorBridge â€" Core Type Definitions
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

// â"€â"€â"€ Messages â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: UserRole;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
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
