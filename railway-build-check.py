#!/usr/bin/env python3
"""
Railway Build Status Checker

Checks Railway deployment status and detects build failures.
If build fails, the old version remains active.

Usage:
    python3 railway-build-check.py [--project PROJECT_NAME] [--token RAILWAY_TOKEN]
"""

import os
import sys
import json
import subprocess
import requests
from typing import Optional, Dict, Any
from datetime import datetime

# Railway API base URL
RAILWAY_API_URL = "https://backboard.railway.app/api/v1"

# Project IDs (from docs/RAILWAY_MONITORING.md)
PROJECT_IDS = {
    "serayah": "c6a9d92e-4343-4545-9efc-a80a488abb0d",
    "solom": "1593babe-750f-4838-8941-34f8e2debd15",
    "bleep-stream": "bb6e98f9-e6c6-45ae-9e28-0189fed852be",
    "qadosh": "f4916566-659e-4df6-9556-31526907785c",
}


def get_railway_token() -> Optional[str]:
    """Get Railway token from environment or file."""
    # Try environment first
    token = os.environ.get("RAILWAY_TOKEN")
    if token:
        return token
    
    # Try file
    token_file = os.path.expanduser("~/.railway/token")
    if os.path.exists(token_file):
        with open(token_file) as f:
            return f.read().strip()
    
    return None


def get_project_status(token: str, project_id: str) -> Dict[str, Any]:
    """
    Get project deployment status via Railway GraphQL API.
    
    Returns:
        Dict with status, latest_deployment, and health info
    """
    query = """
    query GetProject($projectId: String!) {
        project(id: $projectId) {
            id
            name
            status
            latestDeployment {
                id
                status
                startedAt
                finishedAt
                logs
            }
            services {
                edges {
                    node {
                        id
                        name
                        status
                        latestDeployment {
                            id
                            status
                            startedAt
                            finishedAt
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
            "https://backboard.railway.app/graphql",
            json={"query": query, "variables": {"projectId": project_id}},
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def check_service_health(service_url: str) -> Dict[str, Any]:
    """
    Check if a service is healthy by hitting its health endpoint.
    
    Returns:
        Dict with health status
    """
    health_url = f"{service_url.rstrip('/')}/health"
    
    try:
        response = requests.get(health_url, timeout=10)
        return {
            "url": health_url,
            "status_code": response.status_code,
            "healthy": response.status_code == 200,
            "response_time_ms": response.elapsed.total_seconds() * 1000,
        }
    except Exception as e:
        return {
            "url": health_url,
            "status_code": None,
            "healthy": False,
            "error": str(e),
        }


def check_deployment_status(project_name: str, token: str) -> Dict[str, Any]:
    """
    Comprehensive deployment status check.
    
    Returns:
        Dict with build status, deployment info, and health checks
    """
    project_id = PROJECT_IDS.get(project_name)
    if not project_id:
        return {"error": f"Unknown project: {project_name}"}
    
    # Get project status from Railway
    project_data = get_project_status(token, project_id)
    
    if "error" in project_data:
        return project_data
    
    result = {
        "project": project_name,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat(),
        "build_status": "unknown",
        "deployment_status": "unknown",
        "health_check": None,
        "previous_version_active": False,
    }
    
    # Extract deployment info
    try:
        project = project_data.get("data", {}).get("project", {})
        latest_deployment = project.get("latestDeployment", {})
        
        # Determine build status
        status = latest_deployment.get("status", "").upper()
        result["build_status"] = status
        
        if status == "SUCCESS":
            result["deployment_status"] = "deployed"
            result["previous_version_active"] = False
        elif status == "FAILED":
            result["deployment_status"] = "failed"
            result["previous_version_active"] = True  # Old version still active
        elif status in ["BUILDING", "DEPLOYING", "QUEUED"]:
            result["deployment_status"] = "in_progress"
            result["previous_version_active"] = True  # Old version still active
        else:
            result["deployment_status"] = "unknown"
            result["previous_version_active"] = True  # Assume old version active
        
        # Get deployment timestamps
        if latest_deployment.get("startedAt"):
            result["build_started"] = latest_deployment.get("startedAt")
        if latest_deployment.get("finishedAt"):
            result["build_finished"] = latest_deployment.get("finishedAt")
        
    except Exception as e:
        result["error"] = str(e)
    
    return result


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Check Railway build status")
    parser.add_argument("--project", "-p", help="Project name (serayah, solom, etc.)")
    parser.add_argument("--token", "-t", help="Railway API token")
    parser.add_argument("--all", "-a", action="store_true", help="Check all projects")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    # Get token
    token = args.token or get_railway_token()
    if not token:
        print("Error: No Railway token found. Set RAILWAY_TOKEN env var or run 'railway login'")
        sys.exit(1)
    
    # Check projects
    if args.all:
        projects = list(PROJECT_IDS.keys())
    elif args.project:
        projects = [args.project]
    else:
        # Default: check all
        projects = list(PROJECT_IDS.keys())
    
    results = []
    for project in projects:
        print(f"Checking {project}..." if not args.json else "", file=sys.stderr)
        status = check_deployment_status(project, token)
        results.append(status)
    
    # Output
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            print(f"\n{'='*50}")
            print(f"Project: {r.get('project')}")
            print(f"Build Status: {r.get('build_status')}")
            print(f"Deployment Status: {r.get('deployment_status')}")
            print(f"Previous Version Active: {r.get('previous_version_active')}")
            if r.get("build_started"):
                print(f"Build Started: {r.get('build_started')}")
            if r.get("build_finished"):
                print(f"Build Finished: {r.get('build_finished')}")
            if r.get("error"):
                print(f"Error: {r.get('error')}")
    
    # Exit with error if any project has failed build
    failed = any(r.get("build_status") == "FAILED" for r in results)
    if failed:
        print("\n⚠️  One or more builds failed. Previous versions are still active.")
        sys.exit(1)
    
    sys.exit(0)


if __name__ == "__main__":
    main()