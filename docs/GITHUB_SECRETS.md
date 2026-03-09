# GitHub Secrets Setup Guide

## Required Secrets

Set these secrets in GitHub repository settings (Settings > Secrets and variables > Actions):

### Railway Secrets
- `RAILWAY_SOLOM_TOKEN` - Railway token for Solom deployment
- `RAILWAY_COMMAND_BRIDGE_TOKEN` - Railway token for Command Bridge deployment
- `RAILWAY_STAGING_TOKEN` - Railway token for staging deployments (optional)

### Paperclip Secrets
- `PAPERCLIP_WEBHOOK` - Webhook URL for issue sync notifications
- `PAPERCLIP_API_URL` - Paperclip API base URL
- `PAPERCLIP_API_KEY` - Paperclip API key for status checks

### Supabase Secrets
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key for health checks

## GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

## Setting Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Enter the secret name (e.g., `RAILWAY_SOLOM_TOKEN`)
4. Paste the secret value
5. Click "Add secret"

## Security Notes

- Never commit secret values to the repository
- Use repository secrets for sensitive values
- Use environment secrets for production deployments
- Rotate secrets regularly (at least every 90 days)
- Use minimal permissions for service tokens

## Branch Protection

Enable branch protection for `main`:
1. Go to Settings > Branches > Add rule
2. Set "Require status checks to pass before merging"
3. Select required checks: `lint`, `test`, `build`
4. Enable "Require branches to be up to date before merging"
5. Enable "Require pull request reviews before merging"

## Workflow Files

| File | Purpose |
|------|---------|
| `ci.yml` | Lint, test, build on push/PR |
| `deploy-production.yml` | Deploy to production on main push |
| `deploy-staging.yml` | Deploy to staging on develop push |
| `pr-check.yml` | Change detection and targeted checks |
| `issue-sync.yml` | Sync GitHub issues to Paperclip |
| `devops-health.yml` | Scheduled infrastructure health checks |