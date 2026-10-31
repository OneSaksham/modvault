# Security Policy

## Supported Versions

Only the latest stable release of ModVault receives security updates and vulnerability patches.

| Version | Supported | Status |
| :--- | :--- | :--- |
| **1.0.x** | Yes | Active Production Release |
| < 1.0.0 | No | End of Life |

---

## Security Architecture & Threat Model

ModVault is engineered under the principle of minimal privilege and complete transparency:

1. **Context Isolation**: The Electron runtime strictly enables `contextIsolation: true` and disables `nodeIntegration: false` in all renderer processes. The frontend UI interacts with the operating system exclusively through strongly-typed IPC channels defined in `electron/preload.ts`.
2. **Network Whitelisting**: Outbound network requests are restricted strictly to:
   - Official Modrinth REST API: `https://api.modrinth.com/v2/`
   - Official Modrinth CDN: `https://cdn.modrinth.com/`
   - GitHub Releases API: `https://api.github.com/repos/OneSaksham/modvault/releases` (solely for version update checks)
3. **Zero Telemetry**: ModVault contains no tracking pixels, analytics SDKs, user profiling trackers, or background telemetry collectors.
4. **Local Data Persistence**: All instance configuration, preferred launcher paths, and downloaded files remain exclusively on the user's local filesystem (`%APPDATA%`).
5. **Non-Destructive File Operations**: Disabling mods is performed via `.jar.disabled` renames. World save directories (`saves/`) and server credentials are never modified or accessed.

---

## Independent Security Audit

ModVault is independently audited and scanned via **ScanRepo**:
- **Audit Report**: [https://www.scanrepo.dev/scan/github/OneSaksham/modvault](https://www.scanrepo.dev/scan/github/OneSaksham/modvault)
- **Verdict**: LOW RISK (Score: 14/100)
- **Verified Findings**: Zero malware, zero trojans, zero credential stealers, zero remote code execution flaws, 100% open-source transparency.

---

## Reporting a Vulnerability

If you discover a security vulnerability in ModVault, please report it responsibly:

1. **Do not disclose the vulnerability in public GitHub issues, pull requests, or Discord channels.**
2. Send a report via **GitHub Security Advisories**:
   - Navigate to [https://github.com/OneSaksham/modvault/security/advisories/new](https://github.com/OneSaksham/modvault/security/advisories/new)
   - Or contact the maintainer directly via GitHub profile: [https://github.com/OneSaksham](https://github.com/OneSaksham)
3. Please include:
   - Type of vulnerability and affected component (`electron/services/`, `renderer`, etc.)
   - Detailed, step-by-step instructions to reproduce the issue
   - Proof of Concept (PoC) if applicable
   - Potential impact on end users

### Response SLA
- **Initial Acknowledgment**: Within 48 hours
- **Severity Triage & Impact Assessment**: Within 72 hours
- **Patch Deployment**: As quickly as possible, coordinated with a public security release advisory and CVE if applicable.
