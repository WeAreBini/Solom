# Railway Deployment Monitoring

## ⚠️ Token Expired

The Railway API token used for monitoring has expired (403 Forbidden).

### How to Get a New Token

1. Go to https://railway.app/account/tokens
2. Generate a new API token
3. Copy the token
4. Update the token in `/data/workspace/railway-health.py`:
   ```python
   TOKEN = "YOUR_NEW_TOKEN_HERE"
   ```

### Alternative: Login via CLI

```bash
railway login
```

This will open a browser for OAuth authentication.

## Projects to Monitor

| Project | ID | Description |
|---------|-----|---------|
| Serayah | c6a9d92e-4343-4545-9efc-a80a488abb0d | Main agent |
| Solom | 1593babe-750f-4838-8941-34f8e2debd15 | Finance platform |
| Bleep Stream | bb6e98f9-e6c6-45ae-9e28-0189fed852be | Content moderation |
| Qadosh | f4916566-659e-4df6-9556-31526907785c | Maronite app |

## Railway Configs Found

| Project | Config File |
|---------|------------|
| Paperclip | `/data/workspace/paperclip/railway.toml` |
| MC Repo | `/data/workspace/mc-repo/railway.toml` |
| Solom Backup | `/data/workspace/solom-backup/railway.toml` |

## Adding to Heartbeat

The heartbeat process should check Railway deployment status.

Add to HEARTBEAT.md:
```markdown
## Railway Check

```bash
python3 /data/workspace/railway-health.py
```

If token is expired, post alert to Discord.
```

## Status Check Command

```bash
# Check all projects
python3 /data/workspace/railway-health.py

# Check specific project
railway status --project <project-id>
```

## Last Known Status

Before token expiration, all projects were deployed successfully.