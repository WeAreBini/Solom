# Railway Deployment Monitoring

## Build Failure Detection

When a Railway build fails, **the previous version remains active**. This is important to understand:
- Failed deploy = Old version still running
- Successful deploy = New version running
- In progress = Old version running until build completes

### Check Build Status

```bash
# Check all project build statuses
python3 /data/workspace/railway-build-check.py --all

# Check specific project
python3 /data/workspace/railway-build-check.py --project solom

# Output as JSON for automation
python3 /data/workspace/railway-build-check.py --all --json
```

### Build Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `SUCCESS` | Build and deploy complete | New version active |
| `FAILED` | Build failed | Previous version still active |
| `BUILDING` | Build in progress | Previous version still active |
| `DEPLOYING` | Deploying build | Previous version still active |
| `QUEUED` | Waiting to build | Previous version still active |

## Projects to Monitor

| Project | ID | Description |
|---------|-----|---------|
| Serayah | c6a9d92e-4343-4545-9efc-a80a488abb0d | Main agent |
| Solom | 1593babe-750f-4838-8941-34f8e2debd15 | Finance platform |
| Bleep Stream | bb6e98f9-e6c6-45ae-9e28-0189fed852be | Content moderation |
| Qadosh | f4916566-659e-4df6-9556-31526907785c | Maronite app |

## Health Check Endpoints

| Service | Health URL |
|---------|------------|
| Solom | https://solom.life/api/health |
| Data Service | https://solom-data-service.up.railway.app/health |
| Paperclip | https://joyful-connection-production.up.railway.app/api/agents/me |

## GitHub Actions Integration

The deployment workflow (`.github/workflows/deploy-production.yml`) includes:

1. **Service Detection** - Determines which service changed
2. **Deploy with Build Check** - Deploys and waits for health
3. **Verify Deployment Health** - HTTP health check on deployed service
4. **Notify on Failure** - GitHub summary + Paperclip webhook

### Workflow Features

- Waits up to 5 minutes for deployment health
- Verifies HTTP response from deployed service
- Detects if previous version is still active
- Posts summary to GitHub Actions

## CLI Commands

```bash
# Login to Railway
railway login

# Deploy a service
cd solom && railway up

# Check deployment status
railway status

# View logs
railway logs

# Check build logs
railway logs --build
```

## Token Recovery

If the Railway token expires:

1. Go to https://railway.app/account/tokens
2. Generate new API token
3. Update in GitHub repository secrets:
   - `RAILWAY_SOLOM_TOKEN`
   - `RAILWAY_COMMAND_BRIDGE_TOKEN`
   - `RAILWAY_DATA_SERVICE_TOKEN`
4. Update locally: `/data/workspace/railway-health.py`

## Alerting

Paperclip webhook is configured to receive deployment notifications:

```yaml
# In GitHub secret: PAPERCLIP_WEBHOOK
# Receives:
{
  "event": "deployment",
  "service": "solom",
  "status": "success|failed",
  "commit": "abc123",
  "actor": "username"
}
```

## Scripts Available

| Script | Purpose |
|--------|---------|
| `railway-health.py` | Check project health status |
| `railway-build-check.py` | Check build/deployment status |
| `.github/workflows/deploy-production.yml` | CI/CD with build detection |

## Troubleshooting

### Build Fails But Old Version Works

1. Check Railway logs: `railway logs --build`
2. Verify environment variables
3. Check `bun.lock` or `package-lock.json` conflicts
4. Review Dockerfile for errors

### Deployment Not Updating

1. Check build status first
2. Verify Railway token is valid
3. Check if service is using correct branch
4. Run `railway up` with `--force` flag

### Previous Version Still Active After "Successful" Deploy

1. Health check may have passed too early
2. Check actual service URL response
3. Verify Railway environment variables updated
4. Clear Railway cache if needed