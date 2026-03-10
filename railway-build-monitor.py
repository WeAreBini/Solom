#!/usr/bin/env python3
"""
Railway Build Monitor - Creates Paperclip issues on build failure.

Checks Railway deployment status and creates issues when builds fail.
This should be called during DevOps agent heartbeat.

Usage:
    python3 railway-build-monitor.py [--create-issue-on-fail]
"""

import os
import sys
import json
import requests
from datetime import datetime
from typing import Optional, Dict, Any, List

# Paperclip API
PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "https://joyful-connection-production.up.railway.app")
PAPERCLIP_API_KEY = os.environ.get("PAPERCLIP_API_KEY", "")
PAPERCLIP_COMPANY_ID = os.environ.get("PAPERCLIP_COMPANY_ID", "c1204634-0677-4d10-9cd1-4e28645d9393")

# Railway API
RAILWAY_API_URL = "https://backboard.railway.app/graphql"

# Project configurations
PROJECTS = {
    "solom": {
        "name": "Solom",
        "id": "1593babe-750f-4838-8941-34f8e2debd15",
        "health_url": "https://solom.life/api/health",
        "github_repo": "WeAreBini/Solom",
    },
    "solom-data-service": {
        "name": "Solom Data Service",
        "id": None,  # To be created
        "health_url": "https://solom-data-service.up.railway.app/health",
        "github_repo": "WeAreBini/Solom",
    },
    "paperclip": {
        "name": "Paperclip",
        "id": None,  # To be created
        "health_url": "https://joyful-connection-production.up.railway.app/api/health",
        "github_repo": "WeAreBini/command-bridge",
    },
}


def get_railway_token() -> Optional[str]:
    """Get Railway token from environment."""
    return os.environ.get("RAILWAY_TOKEN")


def check_build_status(token: str, project_id: str) -> Dict[str, Any]:
    """Check Railway deployment status for a project."""
    query = """
    query GetProject($projectId: String!) {
        project(id: $projectId) {
            id
            name
            deployments(first: 5) {
                edges {
                    node {
                        id
                        status
                        createdAt
                        finishedAt
                        branch
                        commit {
                            message
                            sha
                        }
                    }
                }
            }
        }
    }
    """
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    
    try:
        response = requests.post(
            RAILWAY_API_URL,
            json={"query": query, "variables": {"projectId": project_id}},
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def check_health(url: str) -> Dict[str, Any]:
    """Check service health endpoint."""
    try:
        response = requests.get(f"{url.rstrip('/')}/health", timeout=10)
        return {
            "url": url,
            "status_code": response.status_code,
            "healthy": response.status_code == 200,
        }
    except Exception as e:
        return {
            "url": url,
            "status_code": None,
            "healthy": False,
            "error": str(e),
        }


def create_paperclip_issue(title: str, body: str, priority: str = "medium") -> Optional[str]:
    """Create a Paperclip issue."""
    if not PAPERCLIP_API_KEY:
        print("Warning: PAPERCLIP_API_KEY not set, cannot create issue")
        return None
    
    headers = {
        "Authorization": f"Bearer {PAPERCLIP_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "title": title,
        "description": body,
        "priority": priority,
    }
    
    try:
        response = requests.post(
            f"{PAPERCLIP_API_URL}/api/companies/{PAPERCLIP_COMPANY_ID}/issues",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return data.get("id")
    except Exception as e:
        print(f"Error creating Paperclip issue: {e}")
        return None


def check_all_projects(create_issues: bool = False) -> List[Dict[str, Any]]:
    """Check all projects and optionally create issues on failures."""
    token = get_railway_token()
    results = []
    
    for project_key, project in PROJECTS.items():
        print(f"\nChecking {project['name']}...")
        
        result = {
            "project": project_key,
            "name": project["name"],
            "timestamp": datetime.utcnow().isoformat(),
            "build_status": "unknown",
            "health_status": "unknown",
            "issue_created": False,
        }
        
        # Check health first
        if project.get("health_url"):
            health = check_health(project["health_url"])
            result["health_status"] = "healthy" if health.get("healthy") else "unhealthy"
            result["health_details"] = health
        
        # Check build status if we have project ID and token
        if project.get("id") and token:
            status_data = check_build_status(token, project["id"])
            
            if "error" in status_data:
                result["build_status"] = "error"
                result["error"] = status_data["error"]
            else:
                try:
                    deployments = status_data.get("data", {}).get("project", {}).get("deployments", {}).get("edges", [])
                    if deployments:
                        latest = deployments[0]["node"]
                        result["build_status"] = latest.get("status", "unknown").upper()
                        result["latest_deployment"] = {
                            "id": latest.get("id"),
                            "branch": latest.get("branch"),
                            "commit": latest.get("commit", {}).get("sha", "")[:7] if latest.get("commit") else None,
                            "created": latest.get("createdAt"),
                            "finished": latest.get("finishedAt"),
                        }
                except Exception as e:
                    result["build_status"] = "error"
                    result["error"] = str(e)
        
        # Create issue if build failed
        if create_issues and result["build_status"] == "FAILED":
            issue_title = f"[URGENT] {project['name']} Build Failed"
            issue_body = f"""## Railway Build Failure

**Project:** {project['name']}
**Status:** FAILED (previous version still active)
**Time:** {result['timestamp']}

### Action Required
1. Check Railway dashboard: https://railway.app/project/{project_key}
2. Review build logs for errors
3. Fix and redeploy

### Health Check
- URL: {project.get('health_url', 'N/A')}
- Status: {result.get('health_status', 'unknown')}

### Note
The previous version is still active because Railway preserves last successful deploy.
"""
            
            issue_id = create_paperclip_issue(issue_title, issue_body, priority="critical")
            if issue_id:
                result["issue_created"] = True
                result["issue_id"] = issue_id
        
        # Create issue if health check fails
        elif create_issues and result.get("health_status") == "unhealthy" and not result.get("issue_created"):
            issue_title = f"{project['name']} Health Check Failed"
            issue_body = f"""## Service Health Failure

**Project:** {project['name']}
**Health URL:** {project.get('health_url', 'N/A')}
**Time:** {result['timestamp']}
**Details:** {result.get('health_details', {})}

### Action Required
1. Check service logs
2. Verify service is running
3. Check for recent deployments that may have failed
"""
            
            issue_id = create_paperclip_issue(issue_title, issue_body, priority="high")
            if issue_id:
                result["issue_created"] = True
                result["issue_id"] = issue_id
        
        results.append(result)
        print(f"  Build: {result['build_status']}")
        print(f"  Health: {result['health_status']}")
        if result.get("issue_created"):
            print(f"  Issue: Created {result.get('issue_id')}")
    
    return results


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Monitor Railway builds and create issues on failure")
    parser.add_argument("--create-issue-on-fail", "-i", action="store_true", 
                        help="Create Paperclip issue when build fails")
    parser.add_argument("--json", "-j", action="store_true", 
                        help="Output as JSON")
    parser.add_argument("--project", "-p", help="Check specific project only")
    
    args = parser.parse_args()
    
    # Check specific project or all
    if args.project:
        projects_to_check = {args.project: PROJECTS.get(args.project, {})}
        if not projects_to_check.get(args.project):
            print(f"Unknown project: {args.project}")
            print(f"Available: {', '.join(PROJECTS.keys())}")
            sys.exit(1)
    else:
        projects_to_check = PROJECTS
    
    results = check_all_projects(create_issues=args.create_issue_on_fail)
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n" + "=" * 50)
        print("Summary:")
        for r in results:
            status = "✅" if r["build_status"] in ["SUCCESS", "healthy"] else "❌"
            print(f"{status} {r['name']}: Build={r['build_status']}, Health={r['health_status']}")
    
    # Exit with error if any failed
    failed = any(r["build_status"] == "FAILED" for r in results)
    unhealthy = any(r.get("health_status") == "unhealthy" for r in results)
    
    if failed or unhealthy:
        sys.exit(1)
    
    sys.exit(0)


if __name__ == "__main__":
    main()