# Next.js Security Vulnerabilities (2026)

> **Last Updated:** February 28, 2026
> **Priority:** Critical - Immediate action required for all production deployments

This document provides a comprehensive overview of Next.js security vulnerabilities identified in late 2025 and 2026, along with mitigation strategies and remediation steps for the Solom finance platform.

---

## Executive Summary

Multiple critical and high-severity vulnerabilities have been disclosed affecting Next.js and React Server Components. The most severe (CVE-2025-66478/CVE-2025-55182) allows unauthenticated remote code execution, while newer vulnerabilities (CVE-2026-23864) enable denial-of-service attacks. Additionally, a coordinated developer-targeting campaign has been identified distributing malicious Next.js repositories.

**Immediate Actions Required:**
1. Upgrade all Next.js applications to patched versions
2. Rotate all environment secrets if applications were exposed
3. Review development workflows for malicious repository exposure
4. Implement VS Code Workspace Trust policies

---

## Critical Vulnerabilities

### CVE-2025-66478 / CVE-2025-55182 (CVSS 10.0)

**Status:** Critical - Remote Code Execution

**Published:** December 3, 2025

**Severity:** CVSS 10.0 (Critical)

#### Description

A critical vulnerability in React Server Components allows **unauthenticated remote code execution** by exploiting a flaw in how React decodes payloads sent to React Server Function endpoints.

The vulnerability exists in the RSC protocol deserialization layer. An attacker can craft malicious HTTP requests to any Server Function endpoint that, when deserialized by React, achieves remote code execution on the server.

**Important:** Even if your app does not implement any React Server Function endpoints, it may still be vulnerable if it supports React Server Components.

#### Affected Versions

**Next.js:**
- Next.js 15.x (all versions prior to patches)
- Next.js 16.x (all versions prior to patches)
- Next.js 14.3.0-canary.77 and later canary releases

**Not Affected:**
- Next.js 13.x
- Next.js 14.x stable releases
- Pages Router applications
- Edge Runtime

**React Packages (upstream):**
- `react-server-dom-webpack` versions 19.0, 19.1.0, 19.1.1, 19.2.0
- `react-server-dom-parcel` versions 19.0, 19.1.0, 19.1.1, 19.2.0
- `react-server-dom-turbopack` versions 19.0, 19.1.0, 19.1.1, 19.2.0

#### Fixed Versions

| Release Line | Fixed Version |
|--------------|---------------|
| Next.js 15.0.x | 15.0.5 |
| Next.js 15.1.x | 15.1.9 |
| Next.js 15.2.x | 15.2.6 |
| Next.js 15.3.x | 15.3.6 |
| Next.js 15.4.x | 15.4.8 |
| Next.js 15.5.x | 15.5.7 |
| Next.js 16.0.x | 16.0.7 |
| Next.js 15.x canary | 15.6.0-canary.58 |
| Next.js 16.x canary | 16.1.0-canary.12 |

**Latest patched versions (January 2026 update):**
- 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.11, 15.5.10, 16.0.11, 16.1.5

#### Remediation Commands

```bash
# Upgrade to patched version based on your release line
npm install next@15.5.7   # for 15.5.x
npm install next@16.0.7   # for 16.0.x

# Or use the automated fix tool
npx fix-react2shell-next
```

#### Post-Patch Actions

**Critical:** Rotate all secrets if your application was exposed.

If your application was online and unpatched as of **December 4th, 2025 at 1:00 PM PT**, rotate all secrets immediately, starting with the most critical ones:

1. Database credentials
2. API keys (payment processors, external services)
3. Authentication secrets (JWT secrets, session keys)
4. Cloud provider credentials
5. Third-party service tokens

---

### CVE-2026-23864 (CVSS 7.5)

**Status:** High - Denial of Service

**Published:** January 26, 2026

**Severity:** CVSS 7.5 (High)

#### Description

Multiple denial-of-service vulnerabilities in React Server Components can be triggered by sending specially crafted HTTP requests to Server Function endpoints. These can lead to:

- Server crashes
- Out-of-memory exceptions
- Excessive CPU usage

**Important:** This vulnerability does **not** allow Remote Code Execution, but the DoS impact can be severe for production services.

#### Affected Versions

**React Packages:**
- `react-server-dom-parcel` versions 19.0.x, 19.1.x, 19.2.x
- `react-server-dom-webpack` versions 19.0.x, 19.1.x, 19.2.x
- `react-server-dom-turbopack` versions 19.0.x, 19.1.x, 19.2.x

**Next.js:**
- All versions 13.x, 14.x, 15.x, and 16.x that use RSC

#### Fixed Versions

| Release Line | Fixed Version |
|--------------|---------------|
| React 19.0.x | 19.0.4 |
| React 19.1.x | 19.1.5 |
| React 19.2.x | 19.2.4 |
| Next.js 15.0.x | 15.0.8 |
| Next.js 15.1.x | 15.1.12 |
| Next.js 15.2.x | 15.2.9 |
| Next.js 15.3.x | 15.3.9 |
| Next.js 15.4.x | 15.4.11 |
| Next.js 15.5.x | 15.5.10 |
| Next.js 16.0.x | 16.0.11 |
| Next.js 16.1.x | 16.1.5 |

#### Remediation Commands

```bash
# Upgrade to latest patched version
npm install next@latest

# Verify the version
npm list next
```

---

### Related Vulnerabilities

| CVE | Severity | Description | Status |
|-----|----------|-------------|--------|
| CVE-2025-55183 | Medium (5.3) | Source Code Exposure | Patch in updated releases |
| CVE-2025-55184 | High (7.5) | Denial of Service | Patch in updated releases |
| CVE-2025-67779 | High (7.5) | Denial of Service | Patch in updated releases |

---

## Developer-Targeting Attack Campaign (February 2026)

### Attack Overview

Microsoft Defender Experts identified a coordinated developer-targeting campaign using malicious repositories disguised as legitimate Next.js projects and technical assessment materials.

**Attack Vectors:**

1. **VS Code Workspace Execution** - Malicious `tasks.json` with `runOn: "folderOpen"` executes code when project is opened
2. **Build-Time Execution** - Trojanized assets (e.g., `jquery.min.js`) executed during `npm run dev`
3. **Server Startup Execution** - Backend modules exfiltrate environment variables on startup

### Attack Chain

```
1. Developer clones/fetches malicious "interview project" repo
2. VS Code opens project, trusted workspace triggers .vscode/tasks.json
3. Node.js fetches Stage 1 payload from Vercel staging domain
4. Stage 1 registers host, polls for Stage 2
5. Stage 2 establishes persistent C2, executes operator tasks
6. Exfiltration of .env files, credentials, session tokens
```

### Indicators of Compromise (IOCs)

**Malicious Vercel Domains:**
- `api-web3-auth[.]vercel[.]app`
- `oracle-v1-beta[.]vercel[.]app`
- `price-oracle-v2[.]vercel[.]app`
- `vscodesettingtask[.]vercel[.]app`
- `coredeal2[.]vercel[.]app`
- Multiple `ip-check-notification-*` variants

**C2 Infrastructure IPs:**
- `87[.]236[.]177[.]9`
- `147[.]124[.]202[.]208`
- `163[.]245[.]194[.]216`
- `66[.]235[.]168[.]136`

**Suspicious Files:**
- `.vscode/tasks.json` with `runOn: "folderOpen"`
- `next.config.js` with dynamic loaders
- `jquery.min.js` in unexpected locations
- `auth.js` or `collection.js` in server/routes/api/

### Mitigation Steps

1. **Enable VS Code Workspace Trust** - Never auto-trust untrusted repositories
2. **Review `.vscode/tasks.json`** - Look for `runOn: "folderOpen"` in unfamiliar projects
3. **Audit Dependencies** - Verify all npm packages are from trusted sources
4. **Monitor Node.js Processes** - Watch for unexpected outbound connections
5. **Restrict Environment Access** - Never store production secrets in development environments

### Detection Queries

**Node.js fetching from suspicious domains:**
```kusto
DeviceNetworkEvents
| where InitiatingProcessFileName in~ ("node","node.exe")
| where RemoteUrl has_any ("vercel.app", "api-web3-auth", "oracle-v1-beta")
| project Timestamp, DeviceName, InitiatingProcessCommandLine, RemoteUrl
```

**Suspicious env exfiltration patterns:**
```kusto
DeviceFileEvents
| where FileName has_any (".env", ".env.local", "Cookies", "Login Data", "History")
| where InitiatingProcessFileName in~ ("node","node.exe","Code.exe","chrome.exe")
| project Timestamp, DeviceName, FileName, FolderPath, InitiatingProcessCommandLine
```

---

## Mitigation Strategies for Solom

### Immediate Actions

1. **Audit Current Versions**
   ```bash
   # Check Next.js version
   npm list next react react-dom

   # If using RSC packages
   npm list react-server-dom-webpack react-server-dom-parcel react-server-dom-turbopack
   ```

2. **Upgrade to Patched Versions**
   ```bash
   # For Solom (assuming Next.js 15.x+)
   npm install next@latest
   npm install react@latest react-dom@latest
   ```

3. **Rotate Secrets** (if exposed before patching)
   - Database credentials
   - API keys for financial data providers
   - JWT secrets and session keys
   - Payment processor credentials
   - Cloud provider access keys

### Ongoing Security Practices

1. **Dependency Scanning**
   - Enable Dependabot or similar automated dependency scanning
   - Subscribe to Next.js security advisories
   - Review npm audit output regularly

2. **Development Workflow Security**
   - Never trust external repositories without review
   - Use VS Code Workspace Trust feature
   - Isolate development environments from production credentials
   - Use `.env.local` for development, never commit secrets

3. **Runtime Monitoring**
   - Monitor Node.js processes for unexpected outbound connections
   - Alert on unusual server resource consumption (DoS indicators)
   - Log all Server Function endpoint requests

4. **Network Security**
   - Implement WAF rules to block malicious RSC payloads
   - Rate-limit Server Function endpoints
   - Use network segmentation for development environments

### WAF Protection

Vercel has deployed WAF rules to protect hosted projects. **However, this should not be your only defense** - always upgrade to patched versions:

```
# WAF provides temporary mitigation
# But immediate upgrades are REQUIRED
```

---

## Version Matrix

| Vulnerability | Min Safe Version | Recommended |
|---------------|------------------|-------------|
| CVE-2025-66478 | 15.0.5+ / 16.0.7+ | Latest |
| CVE-2026-23864 | 15.0.8+ / 16.0.11+ | Latest |
| CVE-2025-55183 | 15.1.12+ | Latest |
| CVE-2025-55184 | 15.1.12+ | Latest |
| CVE-2025-67779 | 15.1.12+ | Latest |

---

## References

### Official Advisories

- [Next.js CVE-2025-66478 Advisory](https://nextjs.org/blog/CVE-2025-66478)
- [React CVE-2025-55182 Blog Post](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [Vercel CVE-2026-23864 Summary](https://vercel.com/changelog/summary-of-cve-2026-23864)
- [GitHub Security Advisory (GHSA-9qr9-h5gf-34mp)](https://github.com/vercel/next.js/security/advisories/GHSA-9qr9-h5gf-34mp)
- [GitHub Security Advisory (GHSA-h25m-26qc-wcjf)](https://github.com/vercel/next.js/security/advisories/GHSA-h25m-26qc-wcjf)

### Additional Resources

- [Microsoft: Developer-targeting campaign using malicious Next.js repositories](https://www.microsoft.com/en-us/security/blog/2026/02/24/c2-developer-targeting-campaign/)
- [Berkeley Security: Critical Vulnerabilities in React and Next.js](https://security.berkeley.edu/news/critical-vulnerabilities-react-and-nextjs)
- [Singapore CSA Alert: AL-2025-112](https://www.csa.gov.sg/alerts-and-advisories/alerts/al-2025-112/)
- [Akamai Research: CVE-2025-55182 Analysis](https://www.akamai.com/blog/security-research/cve-2025-55182-react-nextjs-server-functions-deserialization-rce)

---

## Attribution

**CVE-2025-66478 / CVE-2025-55182:**
- Discovered by [Lachlan Davidson](https://github.com/lachlan2k) via Meta Bug Bounty

**CVE-2026-23864:**
- Disclosed by Mufeed VH (Winfunc Research), Joachim Viide, RyotaK (GMO Flatt Security), and Xiangwei Zhang (Tencent Security YUNDING LAB)

---

**Document Author:** Solom Developer Agent  
**Review Cycle:** Quarterly or upon new vulnerability disclosure  
**Applicability:** All Solom services using Next.js with React Server Components