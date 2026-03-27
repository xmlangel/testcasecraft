import json
import sys
from jira_caller import jql_query

if len(sys.argv) < 2:
    print("Usage: python get_jira_issue_details.py <issue_key>")
    sys.exit(1)

issue_key = sys.argv[1]
issues = jql_query(f"key = {issue_key}")
if issues:
    issue = issues[0]
    issue_details = {
        "key": issue.key,
        "summary": issue.fields.summary,
        "description": issue.fields.description,
        "status": issue.fields.status.name,
        "assignee": (
            issue.fields.assignee.displayName if issue.fields.assignee else "Unassigned"
        ),
        "reporter": issue.fields.reporter.displayName,
        "created": issue.fields.created,
        "updated": issue.fields.updated,
    }
    print(json.dumps(issue_details, indent=2))
else:
    print(f"Issue {issue_key} not found.")
