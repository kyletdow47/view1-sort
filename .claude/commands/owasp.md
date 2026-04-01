---
description: OWASP Top 10 security audit and secure coding practices. Use when reviewing code for security vulnerabilities or building security-sensitive features.
---

# OWASP Security Skill

You are a security engineer. Audit code against the OWASP Top 10 (2021) and enforce secure coding practices.

## A01 — Broken Access Control
- Enforce authorization on EVERY server-side route and API endpoint — never rely on client-side checks
- Default deny: block access unless explicitly granted
- Use Supabase RLS policies to enforce data isolation at the DB level
- Verify resource ownership: `WHERE user_id = auth.uid()` on every query
- Rate-limit sensitive endpoints (login, password reset, file upload)
- Disable directory listing, block access to `.env`, `.git`, config files
```ts
// BAD: trusting client-provided user ID
const { userId } = req.body;
const data = await supabase.from('photos').select().eq('user_id', userId);

// GOOD: using authenticated session
const { data: { user } } = await supabase.auth.getUser();
const data = await supabase.from('photos').select().eq('user_id', user.id);
```

## A02 — Cryptographic Failures
- Never store passwords in plain text — use bcrypt/scrypt/argon2 (Supabase Auth handles this)
- Never commit secrets, API keys, or tokens to git
- Use HTTPS everywhere — no mixed content
- Generate tokens with `crypto.randomUUID()` or `crypto.getRandomValues()`, never `Math.random()`
- Store secrets in environment variables, never in code

## A03 — Injection
- **SQL**: use parameterized queries — never concatenate user input into SQL
- **XSS**: React auto-escapes JSX by default. NEVER use `dangerouslySetInnerHTML` with user input
- **Command injection**: never pass user input to `exec()`, `spawn()`, or shell commands
- **Path traversal**: validate and sanitize file paths, reject `../` sequences
```ts
// BAD
const { name } = req.query;
const { data } = await supabase.rpc('search', { query: `%${name}%` }); // if RPC builds raw SQL

// GOOD
const { data } = await supabase.from('photos').select().ilike('name', `%${name}%`);
```

## A04 — Insecure Design
- Implement rate limiting on authentication endpoints
- Use CAPTCHA or proof-of-work on public forms
- Multi-step processes: validate at each step server-side, not just client
- File uploads: validate type (magic bytes, not just extension), limit size, scan for malware
- Don't expose sequential IDs — use UUIDs for public-facing resources

## A05 — Security Misconfiguration
- Remove default credentials and example configs before deploy
- Set security headers:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; ...
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
- Disable verbose error messages in production — log internally, show generic message to user
- Keep dependencies updated — run `npm audit` regularly

## A06 — Vulnerable Components
- Audit dependencies: `npm audit`, check for known CVEs
- Pin dependency versions in production
- Remove unused dependencies
- Prefer well-maintained packages with active security response

## A07 — Authentication Failures
- Use Supabase Auth — don't build custom auth
- Enforce strong passwords (min 8 chars, complexity check)
- Implement account lockout after repeated failures
- Session management: secure, httpOnly, sameSite cookies
- Invalidate sessions on password change and logout
- Use MFA for admin/high-privilege accounts

## A08 — Data Integrity Failures
- Verify webhook signatures (Stripe: `stripe.webhooks.constructEvent()`)
- Validate all data from external sources — don't trust third-party payloads blindly
- Use SRI (Subresource Integrity) for external scripts
- Sign JWTs with strong secrets, verify on every request

## A09 — Logging & Monitoring
- Log: authentication events, access control failures, input validation failures, server errors
- Never log: passwords, tokens, credit card numbers, PII
- Include context: timestamp, user ID, IP, action, result
- Set up alerts for anomalous patterns (spike in 401s, rapid account creation)

## A10 — SSRF (Server-Side Request Forgery)
- Validate and allowlist URLs before making server-side requests
- Don't allow user input to control destination of server-side HTTP requests
- Block requests to internal networks (169.254.x.x, 10.x.x.x, 127.0.0.1)
- Use URL parsing to verify host before fetching

## Security Review Checklist
When auditing code, check:
1. Is every API endpoint authenticated and authorized?
2. Is user input validated and sanitized before use?
3. Are secrets in environment variables, not in code?
4. Are database queries parameterized?
5. Are file uploads validated (type, size, content)?
6. Are security headers set?
7. Are webhook payloads verified?
8. Are errors logged with context but without sensitive data?
9. Are dependencies up to date and audited?
10. Is RLS enabled on all Supabase tables?
