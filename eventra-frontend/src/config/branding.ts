/**
 * Eventra — Centralized Branding Configuration
 *
 * All brand-specific text is read from VITE_* environment variables,
 * making the platform fully white-label-ready.
 *
 * To rebrand: set VITE_APP_NAME, VITE_APP_TAGLINE, VITE_SUPPORT_EMAIL,
 * VITE_LEGAL_ENTITY, and VITE_DOMAIN in your .env file.
 */

export const BRAND = {
  /** Platform display name (header, footer, login, etc.) */
  name: (import.meta.env.VITE_APP_NAME as string) || 'Eventra',

  /** One-line tagline used in meta tags and hero sections */
  tagline:
    (import.meta.env.VITE_APP_TAGLINE as string) ||
    'Connect Events with Perfect Sponsors',

  /** Support contact email */
  supportEmail:
    (import.meta.env.VITE_SUPPORT_EMAIL as string) || 'support@example.com',

  /** Legal entity name for Terms / Privacy pages */
  legalEntity:
    (import.meta.env.VITE_LEGAL_ENTITY as string) || 'Your Company Inc.',

  /** Primary domain (without protocol) */
  domain: (import.meta.env.VITE_DOMAIN as string) || 'example.com',

  /** AI assistant greeting name */
  get aiName() {
    return `${this.name} AI`;
  },

  /** Copyright line */
  get copyright() {
    return `© ${new Date().getFullYear()} ${this.name}. All rights reserved.`;
  },

  /** Careers email */
  get careersEmail() {
    return `careers@${this.domain}`;
  },

  /** Privacy email */
  get privacyEmail() {
    return `privacy@${this.domain}`;
  },

  /** Legal email */
  get legalEmail() {
    return `legal@${this.domain}`;
  },
} as const;
