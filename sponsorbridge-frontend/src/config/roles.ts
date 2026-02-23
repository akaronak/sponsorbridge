// ============================================================
// Eventra — Centralized Role Configuration
// Single source of truth for role → route mappings.
// Add new roles here; all routing logic references this file.
// ============================================================

import type { UserRole } from '../types';

/**
 * Maps each role to its default dashboard path.
 * When a new role is added (e.g. ADMIN, MODERATOR), add an entry here
 * and the entire auth/routing system picks it up automatically.
 */
export const ROLE_HOME: Record<UserRole, string> = {
  ORGANIZER: '/dashboard',
  COMPANY: '/company',
  ADMIN: '/dashboard', // admins share the organizer dashboard for now
} as const;

/** Roles that may be selected during self-registration. */
export const SELF_REGISTRATION_ROLES: UserRole[] = ['ORGANIZER', 'COMPANY'];

/** Default fallback path when role is unknown or missing. */
export const AUTH_FALLBACK = '/login';

/**
 * Resolve the correct dashboard path for a given role.
 * Falls back to `/dashboard` for unknown roles so we never 404.
 */
export function getDashboardPath(role?: UserRole | string): string {
  if (!role) return ROLE_HOME.ORGANIZER;
  return ROLE_HOME[role as UserRole] ?? ROLE_HOME.ORGANIZER;
}
