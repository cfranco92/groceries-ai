#!/usr/bin/env bash
# =============================================================================
# GroceriesAI — Jira CLI Utility
# =============================================================================
# Provides Jira operations for Claude Code agents via REST API v3.
#
# Required env vars (set in root .env or export manually):
#   JIRA_BASE_URL   — e.g. https://fcode.atlassian.net
#   JIRA_EMAIL      — Atlassian account email
#   JIRA_API_TOKEN  — API token (https://id.atlassian.com/manage-profile/security/api-tokens)
#
# Usage:
#   source scripts/jira.sh
#   jira_comment SCRUM-15 "Implementation complete. See PR #12."
#   jira_transition SCRUM-15 "In Progress"
#   jira_upload_screenshot SCRUM-15 /path/to/screenshot.png "Login page after fix"
#   jira_add_pr_link SCRUM-15 "https://github.com/user/repo/pull/12"
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Load env vars from root .env if not already set
# ---------------------------------------------------------------------------
_load_env() {
  local env_file
  env_file="$(git rev-parse --show-toplevel 2>/dev/null)/.env"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

_load_env

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
_require_jira_env() {
  local missing=()
  [[ -z "${JIRA_BASE_URL:-}" ]] && missing+=("JIRA_BASE_URL")
  [[ -z "${JIRA_EMAIL:-}" ]] && missing+=("JIRA_EMAIL")
  [[ -z "${JIRA_API_TOKEN:-}" ]] && missing+=("JIRA_API_TOKEN")

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "ERROR: Missing required env vars: ${missing[*]}" >&2
    echo "Set them in the root .env file or export them before sourcing this script." >&2
    return 1
  fi
}

_jira_auth() {
  echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64
}

# ---------------------------------------------------------------------------
# jira_comment <ISSUE_KEY> <COMMENT_TEXT>
# Adds a plain-text comment to a Jira issue.
# ---------------------------------------------------------------------------
jira_comment() {
  _require_jira_env || return 1
  local issue_key="$1"
  local comment_text="$2"

  if [[ -z "$issue_key" || -z "$comment_text" ]]; then
    echo "Usage: jira_comment <ISSUE_KEY> <COMMENT_TEXT>" >&2
    return 1
  fi

  local payload
  payload=$(jq -n \
    --arg text "$comment_text" \
    '{
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: $text }
            ]
          }
        ]
      }
    }')

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}/comment")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" =~ ^2 ]]; then
    echo "Comment added to ${issue_key}"
  else
    echo "ERROR: Failed to add comment to ${issue_key} (HTTP ${http_code})" >&2
    echo "$body" >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_comment_with_image <ISSUE_KEY> <COMMENT_TEXT> <ATTACHMENT_FILENAME>
# Adds a comment with an inline image (previously uploaded via jira_upload_screenshot).
# The image must already be attached to the issue.
# ---------------------------------------------------------------------------
jira_comment_with_image() {
  _require_jira_env || return 1
  local issue_key="$1"
  local comment_text="$2"
  local filename="$3"

  if [[ -z "$issue_key" || -z "$comment_text" || -z "$filename" ]]; then
    echo "Usage: jira_comment_with_image <ISSUE_KEY> <COMMENT_TEXT> <ATTACHMENT_FILENAME>" >&2
    return 1
  fi

  # Get attachment ID for the filename
  local attachments_json
  attachments_json=$(curl -s \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}?fields=attachment")

  local attachment_id
  attachment_id=$(echo "$attachments_json" | jq -r \
    --arg fn "$filename" \
    '.fields.attachment[] | select(.filename == $fn) | .id' | tail -1)

  if [[ -z "$attachment_id" || "$attachment_id" == "null" ]]; then
    echo "WARNING: Attachment '${filename}' not found on ${issue_key}. Adding text-only comment." >&2
    jira_comment "$issue_key" "${comment_text} [Screenshot: ${filename}]"
    return 0
  fi

  local payload
  payload=$(jq -n \
    --arg text "$comment_text" \
    --arg aid "$attachment_id" \
    --arg fn "$filename" \
    '{
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: $text }
            ]
          },
          {
            type: "mediaGroup",
            content: [
              {
                type: "media",
                attrs: {
                  type: "file",
                  id: $aid,
                  collection: "",
                  alt: $fn
                }
              }
            ]
          }
        ]
      }
    }')

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}/comment")

  local http_code
  http_code=$(echo "$response" | tail -1)

  if [[ "$http_code" =~ ^2 ]]; then
    echo "Comment with image added to ${issue_key}"
  else
    echo "WARNING: Rich comment failed (HTTP ${http_code}). Falling back to text-only." >&2
    jira_comment "$issue_key" "${comment_text} [Screenshot: ${filename}]"
  fi
}

# ---------------------------------------------------------------------------
# jira_upload_screenshot <ISSUE_KEY> <FILE_PATH> [DESCRIPTION]
# Uploads an image as attachment to a Jira issue.
# ---------------------------------------------------------------------------
jira_upload_screenshot() {
  _require_jira_env || return 1
  local issue_key="$1"
  local file_path="$2"
  local description="${3:-Screenshot}"

  if [[ -z "$issue_key" || -z "$file_path" ]]; then
    echo "Usage: jira_upload_screenshot <ISSUE_KEY> <FILE_PATH> [DESCRIPTION]" >&2
    return 1
  fi

  if [[ ! -f "$file_path" ]]; then
    echo "ERROR: File not found: ${file_path}" >&2
    return 1
  fi

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "X-Atlassian-Token: no-check" \
    -F "file=@${file_path}" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}/attachments")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" =~ ^2 ]]; then
    local filename
    filename=$(echo "$body" | jq -r '.[0].filename // "unknown"')
    echo "Screenshot uploaded to ${issue_key}: ${filename}"
    echo "$filename"
  else
    echo "ERROR: Failed to upload screenshot to ${issue_key} (HTTP ${http_code})" >&2
    echo "$body" >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_transition <ISSUE_KEY> <STATUS_NAME>
# Transitions a Jira issue to the given status.
# Common statuses: "To Do", "In Progress", "In Review", "Done"
# ---------------------------------------------------------------------------
jira_transition() {
  _require_jira_env || return 1
  local issue_key="$1"
  local target_status="$2"

  if [[ -z "$issue_key" || -z "$target_status" ]]; then
    echo "Usage: jira_transition <ISSUE_KEY> <STATUS_NAME>" >&2
    return 1
  fi

  # Get available transitions
  local transitions_json
  transitions_json=$(curl -s \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}/transitions")

  local transition_id
  transition_id=$(echo "$transitions_json" | jq -r \
    --arg name "$target_status" \
    '.transitions[] | select(.name == $name or (.to.name == $name)) | .id' | head -1)

  if [[ -z "$transition_id" || "$transition_id" == "null" ]]; then
    echo "ERROR: Transition to '${target_status}' not available for ${issue_key}" >&2
    echo "Available transitions:" >&2
    echo "$transitions_json" | jq -r '.transitions[] | "  - \(.name) → \(.to.name)"' >&2
    return 1
  fi

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "{\"transition\":{\"id\":\"${transition_id}\"}}" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}/transitions")

  local http_code
  http_code=$(echo "$response" | tail -1)

  if [[ "$http_code" =~ ^2 ]]; then
    echo "${issue_key} transitioned to '${target_status}'"
  else
    echo "ERROR: Failed to transition ${issue_key} (HTTP ${http_code})" >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_add_pr_link <ISSUE_KEY> <PR_URL>
# Adds a remote link (PR) to a Jira issue.
# ---------------------------------------------------------------------------
jira_add_pr_link() {
  _require_jira_env || return 1
  local issue_key="$1"
  local pr_url="$2"

  if [[ -z "$issue_key" || -z "$pr_url" ]]; then
    echo "Usage: jira_add_pr_link <ISSUE_KEY> <PR_URL>" >&2
    return 1
  fi

  local pr_number
  pr_number=$(echo "$pr_url" | grep -oP '/pull/\K\d+' || echo "PR")

  local payload
  payload=$(jq -n \
    --arg url "$pr_url" \
    --arg title "Pull Request #${pr_number}" \
    '{
      object: {
        url: $url,
        title: $title,
        icon: {
          url16x16: "https://github.com/favicon.ico",
          title: "GitHub PR"
        }
      }
    }')

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}/remotelink")

  local http_code
  http_code=$(echo "$response" | tail -1)

  if [[ "$http_code" =~ ^2 ]]; then
    echo "PR link added to ${issue_key}"
  else
    echo "WARNING: Failed to add PR link (HTTP ${http_code}). Adding as comment instead." >&2
    jira_comment "$issue_key" "Pull Request: ${pr_url}"
  fi
}

# ---------------------------------------------------------------------------
# jira_get_status <ISSUE_KEY>
# Returns the current status of a Jira issue.
# ---------------------------------------------------------------------------
jira_get_status() {
  _require_jira_env || return 1
  local issue_key="$1"

  curl -s \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}?fields=status,summary" \
    | jq -r '"[\(.fields.status.name)] \(.fields.summary)"'
}

# ---------------------------------------------------------------------------
# jira_start_work <ISSUE_KEY> [BRANCH_SUFFIX]
# Full workflow start: transition to In Progress + create git branch.
# ---------------------------------------------------------------------------
jira_start_work() {
  _require_jira_env || return 1
  local issue_key="$1"
  local suffix="${2:-}"

  if [[ -z "$issue_key" ]]; then
    echo "Usage: jira_start_work <ISSUE_KEY> [branch-suffix]" >&2
    return 1
  fi

  # Get issue summary for branch name if no suffix provided
  if [[ -z "$suffix" ]]; then
    suffix=$(curl -s \
      -H "Authorization: Basic $(_jira_auth)" \
      -H "Content-Type: application/json" \
      "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}?fields=summary" \
      | jq -r '.fields.summary' \
      | tr '[:upper:]' '[:lower:]' \
      | sed 's/[^a-z0-9]/-/g' \
      | sed 's/--*/-/g' \
      | sed 's/^-//;s/-$//' \
      | cut -c1-40)
  fi

  local branch_name="feature/${issue_key}-${suffix}"

  echo "Starting work on ${issue_key}..."
  if ! jira_transition "$issue_key" "In Progress" 2>/dev/null; then
    echo "WARNING: Could not transition ${issue_key} to 'In Progress'. You may need to do this manually in Jira." >&2
  fi
  jira_comment "$issue_key" "Work started. Branch: ${branch_name}"

  git checkout -b "$branch_name" 2>/dev/null || git checkout "$branch_name"
  echo "Branch: ${branch_name}"
}

# ---------------------------------------------------------------------------
# jira_finish_work <ISSUE_KEY> <PR_TITLE>
# Full workflow finish: create PR + link to Jira + transition to In Review.
# ---------------------------------------------------------------------------
jira_finish_work() {
  _require_jira_env || return 1
  local issue_key="$1"
  local pr_title="${2:-${issue_key}: Implementation complete}"

  if [[ -z "$issue_key" ]]; then
    echo "Usage: jira_finish_work <ISSUE_KEY> [PR_TITLE]" >&2
    return 1
  fi

  # Push branch
  local branch
  branch=$(git branch --show-current)
  git push -u origin "$branch"

  # Create PR
  local pr_url
  pr_url=$(gh pr create \
    --title "${issue_key}: ${pr_title}" \
    --body "## Jira Ticket
[${issue_key}](${JIRA_BASE_URL}/browse/${issue_key})

## Changes
See commit history for details.

## Screenshots
See Jira ticket comments for visual evidence." \
    2>&1)

  if [[ "$pr_url" =~ ^https ]]; then
    echo "PR created: ${pr_url}"
    jira_add_pr_link "$issue_key" "$pr_url"
    jira_comment "$issue_key" "Pull Request created: ${pr_url}"
    if ! jira_transition "$issue_key" "In Review" 2>/dev/null; then
      echo "WARNING: Could not transition ${issue_key} to 'In Review'. Do it manually in Jira." >&2
    else
      echo "${issue_key} transitioned to In Review"
    fi
  else
    echo "ERROR: PR creation failed" >&2
    echo "$pr_url" >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_get_issue <ISSUE_KEY>
# Returns full ticket details: summary, status, description, labels, priority.
# ---------------------------------------------------------------------------
jira_get_issue() {
  _require_jira_env || return 1
  local issue_key="$1"

  if [[ -z "$issue_key" ]]; then
    echo "Usage: jira_get_issue <ISSUE_KEY>" >&2
    return 1
  fi

  local response
  response=$(curl -s \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}?fields=summary,status,description,labels,priority,issuetype,parent,assignee")

  echo "$response" | jq -r '
    "Ticket:      \(.key)"
    + "\nType:        \(.fields.issuetype.name)"
    + "\nStatus:      \(.fields.status.name)"
    + "\nPriority:    \(.fields.priority.name // "None")"
    + "\nAssignee:    \(.fields.assignee.displayName // "Unassigned")"
    + "\nParent:      \(.fields.parent.key // "None")"
    + "\nLabels:      \((.fields.labels // []) | join(", ") | if . == "" then "None" else . end)"
    + "\nSummary:     \(.fields.summary)"
    + "\n\nDescription:"
    + "\n\((.fields.description.content // [{}]) | map(
        (.content // [{}]) | map(.text // "") | join("")
      ) | join("\n") | if . == "" then "(empty)" else . end)"
  '
}

# ---------------------------------------------------------------------------
# jira_create_issue <TYPE> <SUMMARY> [DESCRIPTION] [PARENT_KEY] [LABELS]
# Creates a new Jira issue. TYPE: Bug, Task, Story, Subtask
# Returns the new issue key (e.g., SCRUM-36).
# ---------------------------------------------------------------------------
jira_create_issue() {
  _require_jira_env || return 1
  local issue_type="$1"
  local summary="$2"
  local description="${3:-}"
  local parent_key="${4:-}"
  local labels="${5:-}"

  if [[ -z "$issue_type" || -z "$summary" ]]; then
    echo "Usage: jira_create_issue <TYPE> <SUMMARY> [DESCRIPTION] [PARENT_KEY] [LABELS]" >&2
    echo "  TYPE: Bug, Task, Story, Subtask" >&2
    return 1
  fi

  # Build description ADF
  local desc_adf
  if [[ -n "$description" ]]; then
    desc_adf=$(jq -n --arg text "$description" '{
      type: "doc",
      version: 1,
      content: [{ type: "paragraph", content: [{ type: "text", text: $text }] }]
    }')
  else
    desc_adf="null"
  fi

  # Build labels array
  local labels_json="[]"
  if [[ -n "$labels" ]]; then
    labels_json=$(echo "$labels" | jq -R 'split(",")')
  fi

  # Build payload
  local payload
  if [[ -n "$parent_key" ]]; then
    payload=$(jq -n \
      --arg proj "SCRUM" \
      --arg type "$issue_type" \
      --arg sum "$summary" \
      --argjson desc "$desc_adf" \
      --arg parent "$parent_key" \
      --argjson labels "$labels_json" \
      '{
        fields: {
          project: { key: $proj },
          issuetype: { name: $type },
          summary: $sum,
          parent: { key: $parent },
          labels: $labels
        } + (if $desc != null then { description: $desc } else {} end)
      }')
  else
    payload=$(jq -n \
      --arg proj "SCRUM" \
      --arg type "$issue_type" \
      --arg sum "$summary" \
      --argjson desc "$desc_adf" \
      --argjson labels "$labels_json" \
      '{
        fields: {
          project: { key: $proj },
          issuetype: { name: $type },
          summary: $sum,
          labels: $labels
        } + (if $desc != null then { description: $desc } else {} end)
      }')
  fi

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "${JIRA_BASE_URL}/rest/api/3/issue")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" =~ ^2 ]]; then
    local new_key
    new_key=$(echo "$body" | jq -r '.key')
    echo "Created ${new_key}: ${summary}"
    echo "$new_key"
  else
    echo "ERROR: Failed to create issue (HTTP ${http_code})" >&2
    echo "$body" | jq -r '.errors // .errorMessages // .' >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_create_bug <SUMMARY> <DESCRIPTION> <PARENT_KEY> [LABELS]
# Shortcut to create a Bug issue linked to a parent ticket.
# Designed for QA agents to report bugs with evidence.
# ---------------------------------------------------------------------------
jira_create_bug() {
  _require_jira_env || return 1
  local summary="$1"
  local description="$2"
  local parent_key="${3:-}"
  local labels="${4:-bug}"

  if [[ -z "$summary" || -z "$description" ]]; then
    echo "Usage: jira_create_bug <SUMMARY> <DESCRIPTION> [PARENT_KEY] [LABELS]" >&2
    echo "  Example: jira_create_bug 'Login validation missing' 'Steps to reproduce:...' SCRUM-15 'bug,regression'" >&2
    return 1
  fi

  local new_key
  new_key=$(jira_create_issue "Bug" "$summary" "$description" "$parent_key" "$labels")

  if [[ $? -eq 0 ]]; then
    # Extract just the key (last line of output)
    local key
    key=$(echo "$new_key" | tail -1)
    echo "$key"
  else
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_list_issues <JQL_QUERY> [MAX_RESULTS]
# Lists issues matching a JQL query.
# ---------------------------------------------------------------------------
jira_list_issues() {
  _require_jira_env || return 1
  local jql="$1"
  local max_results="${2:-20}"

  if [[ -z "$jql" ]]; then
    echo "Usage: jira_list_issues <JQL_QUERY> [MAX_RESULTS]" >&2
    echo "  Examples:" >&2
    echo "    jira_list_issues 'project = SCRUM AND status = \"In Progress\"'" >&2
    echo "    jira_list_issues 'project = SCRUM AND sprint in openSprints()'" >&2
    echo "    jira_list_issues 'project = SCRUM AND type = Bug AND status != Done'" >&2
    return 1
  fi

  local response
  response=$(curl -s \
    -G \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    --data-urlencode "jql=${jql}" \
    --data-urlencode "maxResults=${max_results}" \
    --data-urlencode "fields=summary,status,issuetype,priority,assignee,labels" \
    "${JIRA_BASE_URL}/rest/api/3/search")

  local total
  total=$(echo "$response" | jq -r '.total // 0')
  echo "Found ${total} issues (showing up to ${max_results}):"
  echo ""

  echo "$response" | jq -r '
    .issues[] |
    "  \(.key) [\(.fields.status.name)] (\(.fields.issuetype.name)) \(.fields.summary)"
  '
}

# ---------------------------------------------------------------------------
# jira_link_issues <INWARD_KEY> <OUTWARD_KEY> <LINK_TYPE>
# Creates a link between two issues.
# LINK_TYPE: "Blocks", "Duplicate", "Relates"
# ---------------------------------------------------------------------------
jira_link_issues() {
  _require_jira_env || return 1
  local inward_key="$1"
  local outward_key="$2"
  local link_type="${3:-Relates}"

  if [[ -z "$inward_key" || -z "$outward_key" ]]; then
    echo "Usage: jira_link_issues <INWARD_KEY> <OUTWARD_KEY> [LINK_TYPE]" >&2
    echo "  LINK_TYPE: Blocks, Duplicate, Relates (default: Relates)" >&2
    return 1
  fi

  local payload
  payload=$(jq -n \
    --arg type "$link_type" \
    --arg inward "$inward_key" \
    --arg outward "$outward_key" \
    '{
      type: { name: $type },
      inwardIssue: { key: $inward },
      outwardIssue: { key: $outward }
    }')

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "${JIRA_BASE_URL}/rest/api/3/issueLink")

  local http_code
  http_code=$(echo "$response" | tail -1)

  if [[ "$http_code" =~ ^2 ]]; then
    echo "Linked ${inward_key} → ${outward_key} (${link_type})"
  else
    echo "ERROR: Failed to link issues (HTTP ${http_code})" >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# jira_add_label <ISSUE_KEY> <LABEL>
# Adds a label to an issue.
# ---------------------------------------------------------------------------
jira_add_label() {
  _require_jira_env || return 1
  local issue_key="$1"
  local label="$2"

  if [[ -z "$issue_key" || -z "$label" ]]; then
    echo "Usage: jira_add_label <ISSUE_KEY> <LABEL>" >&2
    return 1
  fi

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X PUT \
    -H "Authorization: Basic $(_jira_auth)" \
    -H "Content-Type: application/json" \
    -d "{\"update\":{\"labels\":[{\"add\":\"${label}\"}]}}" \
    "${JIRA_BASE_URL}/rest/api/3/issue/${issue_key}")

  local http_code
  http_code=$(echo "$response" | tail -1)

  if [[ "$http_code" =~ ^2 ]]; then
    echo "Label '${label}' added to ${issue_key}"
  else
    echo "ERROR: Failed to add label (HTTP ${http_code})" >&2
    return 1
  fi
}

echo "Jira utilities loaded. Available commands:"
echo "  jira_comment, jira_comment_with_image, jira_upload_screenshot"
echo "  jira_transition, jira_add_pr_link, jira_get_status, jira_get_issue"
echo "  jira_create_issue, jira_create_bug, jira_list_issues"
echo "  jira_link_issues, jira_add_label"
echo "  jira_start_work, jira_finish_work"
