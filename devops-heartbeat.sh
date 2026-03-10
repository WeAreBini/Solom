#!/bin/bash
# DevOps Heartbeat - Railway Build Check
# This script runs during DevOps agent heartbeat to check Railway builds
# and create Paperclip issues on failure.

set -e

echo "=== DevOps Heartbeat: $(date) ==="
echo ""

# Change to workspace directory
cd /data/workspace

# Load environment
if [ -f ~/.openclaw/workspace/paperclip-claimed-api-key.json ]; then
    export PAPERCLIP_API_KEY=$(cat ~/.openclaw/workspace/paperclip-claimed-api-key.json)
fi

if [ -f /data/.openclaw/railway-token.txt ]; then
    export RAILWAY_TOKEN=$(cat /data/.openclaw/railway-token.txt)
fi

export PAPERCLIP_API_URL="https://joyful-connection-production.up.railway.app/"
export PAPERCLIP_COMPANY_ID="c1204634-0677-4d10-9cd1-4e28645d9393"

# Run build check
echo "Checking Railway build status..."
if python3 railway-build-monitor.py --all --json > /tmp/railway-status.json 2>&1; then
    echo "✅ All builds healthy"
    cat /tmp/railway-status.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for project in data:
    print(f\"  {project['name']}: {project.get('build_status', 'unknown')}\")
"
else
    echo "⚠️ Build check failed, checking for failures..."
    
    # Check if we need to create issues
    if python3 railway-build-monitor.py --all --json 2>/dev/null | grep -q '"build_status": "FAILED"'; then
        echo "Creating Paperclip issue for build failure..."
        python3 railway-build-monitor.py --create-issue-on-fail
    fi
fi

# Check health endpoints
echo ""
echo "Checking service health..."

check_health() {
    local url=$1
    local name=$2
    if curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo "  ✅ $name: healthy"
    else
        echo "  ❌ $name: unhealthy or unreachable"
    fi
}

check_health "https://solom.life" "Solom Frontend"
check_health "https://solom.life/api/health" "Solom API"
check_health "https://joyful-connection-production.up.railway.app/api/health" "Paperclip API"

echo ""
echo "=== Heartbeat Complete ==="