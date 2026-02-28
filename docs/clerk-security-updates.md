# Clerk Authentication Security Updates (2025-2026)

> **Research Date:** February 28, 2026  
> **Issue:** #22 - Research: Clerk auth security updates  
> **Author:** Solom Developer Agent

---

## Executive Summary

This document provides a comprehensive overview of Clerk's authentication security features and recent updates as of early 2026. Clerk has implemented several significant security enhancements, including mandatory MFA, advanced passkey support, improved restriction mechanisms, and enhanced system reliability following postmortem analyses of recent incidents.

---

## Table of Contents

1. [Mandatory Multi-Factor Authentication (MFA)](#1-mandatory-multi-factor-authentication-mfa)
2. [Passkey Authentication](#2-passkey-authentication)
3. [Access Restrictions & Sign-up Controls](#3-access-restrictions--sign-up-controls)
4. [Session Token Failover & Resilience](#4-session-token-failover--resilience)
5. [Authentication Strategy Options](#5-authentication-strategy-options)
6. [Security Best Practices](#6-security-best-practices)
7. [Recent Incidents & Learnings](#7-recent-incidents--learnings)
8. [Implementation Recommendations for Solom](#8-implementation-recommendations-for-solom)

---

## 1. Mandatory Multi-Factor Authentication (MFA)

### Overview

Clerk now supports **requiring MFA across your entire application with a single toggle**. This eliminates the "opt-in" gap where users previously had to manually choose to secure their accounts.

### Key Features

- **Enforced MFA for all users**: New users are prompted to set up MFA during sign-up
- **Existing user flow**: Users without MFA are prompted on their next sign-in
- **Supported methods**:
  - Authenticator application (TOTP)
  - SMS verification code
  - Backup codes

### How MFA Works

```
1. User signs up or signs in
2. System checks if MFA is required and if user has MFA configured
3. If not configured → User is guided through setup flow
4. User completes MFA verification
5. Session becomes "active" only after MFA setup/verification
```

### Configuration

Navigate to **Multi-factor** in Clerk Dashboard:
1. Enable one or more MFA strategies (Authenticator app or SMS)
2. Toggle on **Require multi-factor authentication**
3. Users will be prompted at next sign-in

### Technical Details

When MFA is required:
- Users have a pending `setup-mfa` session task
- Session is not considered `active` until MFA is fulfilled
- Prebuilt Clerk components handle the flow automatically

### Implementation Example

```typescript
// Using Clerk's prebuilt components
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
// MFA requirement is handled automatically
```

---

## 2. Passkey Authentication

### What are Passkeys?

Passkeys are a modern, **phishing-resistant** form of passwordless authentication that uses cryptographic credentials tied to a user's device, unlocked via biometrics (Face ID, Touch ID, Windows Hello) or a device PIN.

### Security Properties

| Property | Description |
|----------|-------------|
| **Phishing-resistant** | Private keys only sign challenges for the registering origin |
| **MFA by default** | Combines device possession + biometric/PIN |
| **No reusable secrets** | Servers store only public keys |
| **Origin-bound** | Keys work only on the domain they were created on |

### Registration Flow

```
1. User enters username → Browser requests registration options
2. Server generates challenge + configuration
3. Browser shows native prompt ("Create a passkey")
4. User approves with biometrics/security key
5. Authenticator creates key pair (private key stays on device)
6. Browser sends credential to server for verification
7. Server validates and stores public key + credential ID
```

### Authentication Flow

```
1. User enters username → Browser requests auth options
2. Server generates challenge and sends stored credential IDs
3. Browser shows native prompt ("Sign in with Face ID?")
4. User approves with biometrics
5. Authenticator signs challenge with private key
6. Browser sends signed response to server
7. Server verifies signature using stored public key
```

### Domain Restrictions

**Important:** Passkeys are domain-specific:
- Passkeys created on `your-domain.com` **cannot** be used on `your-domain-admin.com` (different domains)
- Passkeys created on `your-domain.com` **can** be used on `accounts.your-domain.com` (subdomain)
- Maximum 10 passkeys per account

### Implementation in Next.js

```typescript
'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <SignIn />
    </div>
  )
}
```

Passkeys can be enabled in the Clerk Dashboard with a single toggle, and the `<SignIn />` and `<SignUp />` components automatically present passkey options.

---

## 3. Access Restrictions & Sign-up Controls

Clerk provides multiple mechanisms to control who can access your application.

### Sign-up Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Public** | Open sign-up (default) | Consumer apps |
| **Restricted** | Admin-controlled access | Private beta, internal tools |
| **Waitlist** | Users register interest | Launch preparation |

### Allowlist

Only users with specific identifiers (email addresses, phone numbers, or domains) can sign up.

```typescript
// Example: Allow only company domain
// Add "company.com" to allowed email domains
// Only @company.com email addresses can sign up
```

### Blocklist

Prevent specific identifiers from signing up:
- Block individual email addresses
- Block entire domains
- Block subaddresses (`user+tag@domain.com`)
- Block disposable email addresses

**Subaddress blocking**: Adding `john.doe@clerk.dev` also blocks `john.doe+anything@clerk.dev`

**Disposable email blocking**: Toggle to block all known disposable email providers.

### Enabling Restrictions

1. Navigate to **Restrictions** in Clerk Dashboard
2. Configure Allowlist/Blocklist as needed
3. Case-insensitive matching (`JOHN@example.com` = `john@example.com`)

---

## 4. Session Token Failover & Resilience

### February 2026 Failover Mechanism

Following the February 19, 2026 incident, Clerk implemented a new session token failover mechanism:

- **Previous behavior**: Failover triggered only during complete Postgres outages
- **New behavior**: Failover triggers during **any type of failure at origin**
- **Result**: Users stay signed in during a wider variety of failures

### Incident Response Timeline (Feb 19, 2026)

| Time (UTC) | Event |
|------------|-------|
| 16:15 | Incident reported and escalated |
| 16:32-16:55 | Investigation, attempted mitigations |
| 17:08 | New failover mechanism enabled |
| 17:10 | Failover succeeded, users could access apps |
| 17:25 | Root cause identified |
| 17:27 | Manual ANALYZE executed, query plan restored |
| 17:43 | Systems stabilizing |
| 18:06 | Confirmed stable |

### Key Improvements After Incident

1. **Dedicated alerting for query plan flips** - Detect sudden degradation immediately
2. **Hardened session token failover** - Triggers on any origin failure
3. **Query plan stability** - Increased statistics target, refactored queries
4. **Improved incident communication** - Regular status updates, accurate severity labels

---

## 5. Authentication Strategy Options

Clerk supports multiple authentication strategies that can be combined:

### Primary Authentication

| Strategy | Description | Notes |
|----------|-------------|-------|
| **Email verification code** | OTP sent to email | 10-minute expiry |
| **Email verification link** | Magic link via email | Same-device option available |
| **Phone (SMS)** | OTP to phone number | Paid feature |
| **Password** | Traditional password auth | Can be disabled for new users |
| **Passkeys** | Biometric/device-based | Phishing-resistant |
| **Web3** | Crypto wallet auth | MetaMask, Coinbase, OKX Wallet |

### Secondary Authentication (MFA)

| Method | Description |
|--------|-------------|
| **SMS verification code** | OTP via SMS |
| **Authenticator app (TOTP)** | Time-based codes |
| **Backup codes** | Recovery codes |

### Social Connections (OAuth)

Google, GitHub, Apple, Microsoft, Facebook, X (Twitter), and more.

### Enterprise SSO

SAML and OIDC connections for enterprise identity providers.

---

## 6. Security Best Practices

### For Solom Implementation

#### Recommended Configuration

```typescript
// Recommended security settings for finance applications
const securityConfig = {
  authentication: {
    // Require MFA for all users (finance app)
    requireMFA: true,
    
    // Enable passkeys for phishing-resistant auth
    passkeys: true,
    
    // Block disposable emails
    blockDisposableEmails: true,
    
    // Consider email link same-device requirement
    emailLinkSameDevice: true,
  },
  
  mfa: {
    // Prefer TOTP over SMS (more secure)
    strategies: ['authenticator_app', 'backup_codes'],
  },
  
  restrictions: {
    // Consider allowlist for beta testing
    // Or restricted mode for internal tools
    mode: 'public',
  },
}
```

#### Security Checklist

- [ ] Enable **Require MFA** for all users
- [ ] Enable **passkeys** as an authentication option
- [ ] Block **disposable email addresses**
- [ ] Configure **session token validation**
- [ ] Review and test **failover mechanisms**
- [ ] Document **incident response procedures**

### Domain Security

```
Production: Set NEXT_PUBLIC_RP_ID to your production domain
Staging: Use separate Clerk instance or satellite domains
Development: localhost works automatically

Note: Passkeys don't work across satellite domains
```

### Session Security

- Sessions have automatic expiration
- Active sessions can be revoked from dashboard
- User actions can require re-authentication
- Session tokens handle failover gracefully

---

## 7. Recent Incidents & Learnings

### February 19, 2026 - System Outage

**Root Cause:** Postgres automatic ANALYZE triggered a query plan flip, causing severe database performance degradation.

**Impact:** Over 95% of traffic returned 429 errors for ~90 minutes.

**Key Lessons:**
1. Query plan flips can cause sudden, severe degradation
2. Need dedicated alerting for this class of issue
3. Session token failover must handle degraded (not just down) databases

### February 10, 2026 - DNS Provider Outage

Clerk experienced a DNS provider outage affecting availability.

**Lesson:** Multi-provider DNS redundancy is essential for high availability.

### Communication Improvements

Clerk has committed to:
- Regular cadence status page updates during incidents
- Accurate severity labels reflecting customer impact
- Cross-posting updates to social channels
- Dedicated communications lead during incidents

---

## 8. Implementation Recommendations for Solom

### Phase 1: Core Security Setup

1. **Enable Passkeys**
   - Navigate to User & Authentication → Passkeys
   - Enable passkey authentication
   - Update `<SignIn />` component (passes work automatically)

2. **Configure MFA Requirements**
   - Navigate to Multi-factor settings
   - Enable authenticator app (TOTP)
   - Enable backup codes
   - Toggle **Require MFA** (critical for finance app)

3. **Restriction Settings**
   - Enable block disposable email addresses
   - Consider email subaddress blocking

### Phase 2: Advanced Security

4. **Web3 Authentication** (if needed for crypto features)
   - Enable MetaMask, Coinbase Wallet, or OKX Wallet

5. **Enterprise SSO** (for B2B features)
   - Configure SAML/OIDC for enterprise customers

6. **Session Configuration**
   - Configure session timeout for sensitive operations
   - Implement step-up authentication for financial actions

### Phase 3: Monitoring & Incident Response

7. **Webhook Integration**
   - Set up webhooks for security events (user.created, session.ended, etc.)

8. **Audit Logging**
   - Enable audit logs in Clerk Dashboard
   - Export to monitoring system

9. **Status Page Monitoring**
   - Subscribe to Clerk status page
   - Set up incident response procedures

### Code Implementation

```typescript
// app/auth/sign-in/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-lg",
          }
        }}
       SignUpUrl="/auth/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </div>
  )
}
```

```typescript
// middleware.ts - Protect routes
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

```typescript
// app/layout.tsx - Require MFA
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sessionClaims } = await auth()
  
  // Check if MFA is required and fulfilled
  // Users with pending setup-mfa session task won't be considered active
  
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## References

- [Clerk Security Documentation](https://clerk.com/docs/security)
- [Clerk Passkeys Guide](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#passkeys)
- [Clerk Restrictions Documentation](https://clerk.com/docs/guides/secure/restricting-access)
- [Clerk Changelog](https://clerk.com/changelog)
- [Postmortem: February 19, 2026 System Outage](https://clerk.com/blog/2026-02-19-system-outage-postmortem)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [FIDO2 Overview](https://fidoalliance.org/passkeys/)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-28 | 1.0.0 | Initial research documentation |

---

*This document was created as part of Issue #22 for the Solom finance platform project.*