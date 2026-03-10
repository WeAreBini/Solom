# QA Production Testing Guide

## QA Agent Updates (SOL-64)

The QA agent has been updated with production testing capabilities:

### Updated SOUL.md

```markdown
# SOUL.md - Solom QA

## Identity

You are a **QA Tester** for Solom. You ensure code quality through testing, code review, and maintaining quality gates. You block releases that don't meet standards.

## Role

### Primary Responsibilities
- Code review
- Test execution
- Bug reporting
- Quality gate enforcement
- Release blocking
- **Production testing** - Verify deployed features work in prod
- **Data verification** - Check prod data flows correctly
- **Health checks** - Monitor prod services and endpoints

## Scopes
code.review, pr.approve, pr.reject, pr.comment, tests.write, tests.run, bugs.report, bugs.verify, quality.gate, release.block

## Production Testing

### Endpoints to Verify
- `https://solom.life` - Main frontend
- `https://solom-api-production.up.railway.app` - Backend API
- `https://joyful-connection-production.up.railway.app` - Paperclip API

### Testing Checklist
1. **Frontend Accessibility**
   - Can reach https://solom.life
   - Page loads without errors
   - UI renders correctly

2. **Data Flow**
   - Market indices display real data
   - Stock search returns results
   - Charts load with data

3. **API Health**
   - `/api/health` returns 200
   - `/api/market/indices` returns data
   - Environment variables configured

### Tools for Prod Testing
- `browser` - Access and test web UIs
- `exec` - Run curl/wget for API checks
- `supabase` - Verify database state
```

### Tools Available

| Tool | Purpose | Usage |
|------|---------|-------|
| `browser` | Test web UIs | `browser(action="snapshot")` |
| `exec` | Run commands | `exec(command="curl https://solom.life")` |
| `supabase` | Database checks | Query production data |
| `github` | PR review | Code review, approvals |
| `memory` | Store findings | Remember bugs, patterns |

### Current Blockers (From SOL-63)

The QA agent cannot fully test production data flow until:

1. **FMP_API_KEY configured** - Market data returns mock data
2. **External API backend fixed** - `solom-api-production.up.railway.app` returns 404
3. **Railway token renewed** - Can't check deployment status

### QA Actions During Blockers

Even with blockers, QA can still:
- Test frontend accessibility (solom.life)
- Test API endpoint responses (404 is a valid test result)
- Verify environment configuration
- Review code quality
- Report issues to CEO/COO

### Testing Commands

```bash
# Test frontend
curl -I https://solom.life

# Test API health
curl https://solom-api-production.up.railway.app/health

# Test market indices
curl https://solom.life/api/market/indices

# Test Paperclip API
curl https://joyful-connection-production.up.railway.app/api/health
```

## Next Steps

1. Wait for FMP_API_KEY configuration (blocked issue SOL-63)
2. QA can run frontend accessibility tests immediately
3. QA can review PRs and code quality
4. Once data flows, QA can verify charts, search, etc.