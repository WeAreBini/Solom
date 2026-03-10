# HEARTBEAT.md - Serayah's Watchful Eye 👑

**Memory Status Channel:** #serayah-memory (ID: 1476842791106510889)  
**Interval:** Every 5 minutes

## Persistent Status Embed (Primary)

Instead of posting new messages, update the persistent status embed:

```bash
python3 /data/workspace/.openclaw/memory-status-embed.py
```

This updates the same Discord message with current memory stats:
- Semantic, episodic, procedural memory counts
- Entity profiles status
- Cache size
- Last updated timestamp

The message ID is stored in `.openclaw/.memory-status-message-id`

### First-time Setup
```bash
python3 /data/workspace/.openclaw/memory-status-embed.py --create
```

### Check stored message ID
```bash
python3 /data/workspace/.openclaw/memory-status-embed.py --id
```

## Memory Maintenance (First!)
```bash
python3 /data/workspace/.openclaw/memory-maintenance.py maintenance
```
- Verifies all service endpoints (auto-updates profiles)
- Applies confidence decay to old memories
- Cleans up stale, low-confidence memories

## DevOps Build Check (Critical!)

**Run this EVERY heartbeat:**

```bash
# Check all Railway projects and create issues on failure
bash /data/workspace/devops-heartbeat.sh
```

This script:
1. Checks Railway deployment status for all projects
2. Verifies health endpoints
3. Creates Paperclip issues on build failure
4. Reports status to stdout

**If build fails:**
- Script creates Paperclip issue automatically
- Issue title: "[URGENT] {project} Build Failed"
- Priority: critical

## Project Monitoring
**Channel:** #solom-updates (ID: 1476087902923395145)
- Check Command Bridge status
- Check Railway deployment status for ALL projects
- Report blockers, status changes
- Escalate immediately for critical issues

## Railway Deployment Check

Every heartbeat should check Railway deployments:

```bash
python3 /data/workspace/railway-health.py
```

Expected output: JSON with status for each project.

**If 403 Forbidden or token expired:**
1. Post alert to Discord: "⚠️ Railway token expired - deployments cannot be monitored"
2. Create a follow-up task to renew token
3. Document in /data/workspace/docs/RAILWAY_MONITORING.md

**Projects to monitor:**
- Serayah (c6a9d92e-...)
- Solom (1593babe-...)
- Bleep Stream (bb6e98f9-...)
- Qadosh (f4916566-...)

**Token renewal:** See `/data/workspace/docs/RAILWAY_MONITORING.md`

## Railway Build Failure Detection

DevOps agent should check for build failures and create issues:

```bash
python3 /data/workspace/railway-build-monitor.py --create-issue-on-fail
```

**When build fails (status = FAILED):**
1. Create Paperclip issue with title "[URGENT] {project} Build Failed"
2. Include: build logs URL, previous version still active note
3. Priority: critical
4. Label: deployment-failed

**When health check fails:**
1. Create Paperclip issue: "{project} Health Check Failed"
2. Include: service URL, status code
3. Priority: high

This runs during DevOps agent heartbeat automatically.

## Memory Consolidation
- Use `recall.py` for semantic search across pgvector
- Append new insights to `memory/YYYY-MM-DD.md`
- Distill important stuff into `MEMORY.md`
- If something contradicts old memory → `update X --to Y`

## Star Office Status Push
```bash
python3 /data/workspace/.openclaw/star-office-push.py
```
- **URL:** https://star-office-production.up.railway.app/
- Auto-detects current activity and pushes status to pixel office
- States: idle, writing, researching, executing, syncing, error
- Manual override: `python3 star-office-push.py set writing "description"`

## Heartbeat Actions (In Order)

1. **Run memory maintenance**: `python3 memory-maintenance.py maintenance`
2. **Update status embed**: `python3 memory-status-embed.py`
3. **Push Star Office status**: `python3 star-office-push.py`
4. **Check Command Bridge**: Quick health check
5. **Review for alerts**: Any blockers, critical issues?

## Response Format

If everything calm and embed updated → `HEARTBEAT_OK`

If action needed:
- Update embed with status (it will show the error)
- Post a brief message to the channel (max 3 sentences)
- Describe what needs attention