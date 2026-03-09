# DELEGATION.md - Solom Delegation & Reporting Protocol

## Overview

This document defines how issues/tasks flow through the organization hierarchy:
- **Delegation (Top-Down)**: CEO → Chiefs → Managers → Operators
- **Reporting (Bottom-Up)**: Operators → Managers → Chiefs → CEO

---

## Chain of Command

```
                    ┌─────────┐
                    │   CEO   │  (Strategic Layer)
                    └────┬────┘
                         │
     ┌───────────┬───────┼───────┬───────────┐
     │           │       │       │           │
┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
│   COO   │ │   CTO   │ │   CFO   │ │   CPO   │  (Executive Layer)
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     │      ┌────┼────┐      │      ┌────┼────┐
     │      │         │      │      │         │
     │  ┌───┴───┐ ┌───┴───┐  │  ┌───┴───┐ ┌───┴───┐
     │  │   PM   │ │DevOps │  │  │Research│ │Content│  (Management Layer)
     │  └───┬───┘ └───┬───┘  │  └───┬───┘ └───┬───┘
     │      │         │      │      │         │
     │      │    ┌────┴────┐ │      │         │
     │      │    │Security │ │      │         │
     │      │    └─────────┘ │      │         │
     │      │                │      │         │
┌────┴────┐ ┌──┴───┐ ┌──────┴─┐ ┌──┴───┐ ┌────┴────┐
│Support/ │ │Backend│ │Frontend│ │QA    │ │Data     │  (Operator Layer)
│PM Tasks │ │       │ │        │ │      │ │         │
└─────────┘ └───────┘ └────────┘ └──────┘ └─────────┘
```

---

## Delegation Protocol (Top-Down)

### Level 0: CEO (Strategic)

**When issue assigned to CEO:**
1. Analyze issue type and scope
2. Determine which C-level should handle it
3. Delegate by creating linked issue or reassigning
4. Track at high level (milestone/tracking issue)

**Delegation Rules:**

| Issue Type | Delegate To | Rationale |
|------------|-------------|-----------|
| Operational/coordination | COO | Daily operations, sprint management |
| Technical/architecture | CTO | Code, infrastructure, security |
| Financial/budget | CFO | Costs, ROI, resource optimization |
| Product/features | CPO | User research, roadmap, prioritization |
| Cross-functional | COO | Coordinates across departments |

**Issue Assignment:**
```
POST /api/issues/{issueId}/checkout
POST /api/companies/{companyId}/issues (create sub-issue)
  - parentId: original_issue_id
  - assigneeAgentId: delegate_agent_id
  - title: "[Delegated] Original title"
```

### Level 1: C-Level (Executive)

**When issue assigned to C-Level:**
1. Analyze requirements
2. If needs execution → Delegate to Manager layer
3. If can be handled directly (approval, review, analysis) → Handle and report

**Delegation Rules:**

| C-Level | Delegate To | When |
|---------|-------------|------|
| COO | PM | Sprint tasks, project coordination |
| CTO | Backend/Frontend/DevOps | Code changes, deployments |
| CTO | PM (for coordination) | Multi-engineer tasks |
| CFO | Data | Analytics, metrics |
| CPO | Researcher/Content/Support | Product tasks |

### Level 2: Manager (PM)

**When issue assigned to PM:**
1. Break down into specific tasks
2. Assign to appropriate operator(s)
3. Track completion
4. Report status to chain

**Delegation Rules:**

| Task Type | Assign To |
|-----------|-----------|
| Backend API | Backend |
| Frontend UI | Frontend |
| Testing | QA |
| Infrastructure | DevOps |

### Level 3: Operators

**When issue assigned to operator:**
1. Execute the task
2. Report completion with details
3. If blocked → Escalate to manager

---

## Reporting Protocol (Bottom-Up)

### Operator → Manager

**When task completes:**
```json
POST /api/issues/{issueId}/comments
{
  "body": "✅ Task completed.\n\n**What was done:**\n- [Details]\n\n**Files changed:**\n- [File list]\n\n**Verification:**\n- [How to verify]"
}
```

Then PATCH to update status:
```json
PATCH /api/issues/{issueId}
{
  "status": "done",
  "comment": "Completed implementation. Ready for review."
}
```

### Manager → Executive

**When all sub-tasks complete:**
1. Aggregate results
2. Verify completeness
3. Report to C-Level with summary

```json
POST /api/issues/{issueId}/comments
{
  "body": "📊 Sprint Task Complete\n\n**Summary:**\n- X tasks completed\n- Y files changed\n- Z tests passing\n\n**Key Decisions:**\n- [Decision 1]\n- [Decision 2]\n\n**Recommendations:**\n- [Optional next steps]"
}
```

### Executive → CEO

**When department task complete:**
1. Executive summary
2. Key outcomes
3. Cross-functional impacts
4. Recommendations

### CEO → Human Stakeholder

**Final reporting:**
1. Strategic summary
2. Business impact
3. What's next
4. Any concerns/blockers

---

## Escalation Protocol

### When to Escalate Up

| Situation | Escalate From | Escalate To |
|-----------|---------------|-------------|
| Blocked > 4 hours | Operator | PM |
| Blocked > 1 day | PM | C-Level |
| Critical issue | C-Level | CEO |
| Human decision needed | CEO | Human |

### How to Escalate

1. **Post comment** on issue with `@mention` of next level
2. **Include context:**
   - What's blocked
   - What you've tried
   - What you need
   - Deadline impact

3. **Mark issue status** as `blocked` if needed

---

## Issue Lifecycle

```
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌────────┐     ┌──────┐
│  TODO   │ ──> │IN_PROGRESS│ ──> │IN_REVIEW  │ ──> │  DONE  │ ──> │CLOSED│
└─────────┘     └──────────┘     └───────────┘     └────────┘     └──────┘
     │               │                  │                │
     │               │                  │                │
     │               │                  │                │
     ▼               ▼                  ▼                ▼
  Backlog        Active work        Awaiting        Complete
                                   approval
```

### Status Definitions

| Status | Meaning |
|--------|---------|
| `backlog` | Prioritized, not started |
| `todo` | Ready to start |
| `in_progress` | Actively being worked |
| `blocked` | Waiting on something |
| `in_review` | Done, awaiting approval |
| `done` | Completed, awaiting final sign-off |
| `closed` | Fully complete, no further action |

---

## Linked Issues (Parent/Child)

### Creating Sub-Issues

When delegating, create linked child issues:

```json
POST /api/companies/{companyId}/issues
{
  "title": "[CTO] Implement authentication system",
  "description": "Parent: SOL-20\n\nImplement secure authentication...",
  "parentId": "acf9187a-551d-47eb-8a73-afb2f1e12b67",
  "assigneeAgentId": "d45c9951-756d-40d2-b740-9ac599532d33",
  "priority": "high"
}
```

### Benefits of Linked Issues

1. **Traceability**: Can track from CEO down to operator
2. **Aggregation**: Parent shows child progress
3. **Reporting**: Easy to generate chain reports
4. **Closure**: Parent closes when all children close

---

## Communication Channels

| Layer | Primary Channel | Purpose |
|-------|-----------------|---------|
| CEO → Human | Direct message | Strategic updates |
| C-Level → CEO | #solom-updates | Executive summaries |
| PM → C-Level | #solom-updates | Sprint reports |
| Operators → PM | Issue comments | Task updates |
| All → All | #solom-discussion | General coordination |

---

## Confirmation & Understanding

### Why This Matters

1. **Delegation ensures**:
   - Right person handles right task
   - No bottlenecks at CEO level
   - Efficient use of specialized skills

2. **Reporting ensures**:
   - CEO understands what was implemented
   - Chain can verify correctness
   - Knowledge preserved in issue history

3. **Confirmation ensures**:
   - Misunderstandings caught early
   - Quality maintained across chain
   - Accountability at each level

---

## Example: Feature Implementation Flow

```
Human creates issue: "Add user dashboard"
        │
        ▼
CEO reviews, delegates to CPO (product feature)
        │ creates child issue: "[CPO] Design user dashboard"
        ▼
CPO analyzes requirements, delegates to Researcher
        │ creates child issue: "[Research] User dashboard needs"
        ▼
Researcher gathers requirements, posts findings
        │ reports back to CPO
        ▼
CPO creates spec, delegates to PM
        │ creates child issue: "[PM] Implement user dashboard"
        ▼
PM breaks into tasks, assigns to operators
        │ creates child issues:
        │ - "[Backend] Dashboard API"
        │ - "[Frontend] Dashboard UI"
        │ - "[QA] Dashboard tests"
        ▼
Operators implement, report back to PM
        │ all tasks complete
        ▼
PM aggregates, reports to CPO
        │ feature complete
        ▼
CPO verifies, reports to CEO
        │ implementation matches requirements
        ▼
CEO reports to Human stakeholder
        │ "User dashboard implemented as specified"
        ▼
Human confirms or requests changes
```

---

## Human Escalation Policy

### ⚠️ CRITICAL: Issues Requiring Human Attention

**Rules:**
1. **NEVER mark an issue as complete** if it requires human interaction or approval
2. Issues needing human attention must be **escalated to the human's inbox**
3. Clearly state what decision/approval is needed

### What Requires Human Escalation

| Category | Examples |
|----------|----------|
| **Strategic Decisions** | Major product pivots, company direction changes |
| **Budget Approval** | Spending over threshold, new subscriptions |
| **Security Issues** | Vulnerabilities, breaches, sensitive data access |
| **Personnel Changes** | Agent creation/modification, role changes |
| **External Commitments** | Deadlines to customers, partnerships |
| **Legal/Compliance** | Privacy policies, terms of service changes |
| **Architecture Changes** | Major refactors, technology switches |
| **Risk Assessment** | Actions with significant business risk |

### How to Escalate to Human

When an issue needs human attention:

1. **Post detailed comment** explaining the situation:
```json
POST /api/issues/{issueId}/comments
{
  "body": "⚠️ **HUMAN ATTENTION REQUIRED**\n\n**Issue:** [Brief description]\n\n**What was done:**\n- [Completed work]\n\n**What needs decision:**\n- [Specific question or approval needed]\n\n**Options:**\n1. [Option A] - [pros/cons]\n2. [Option B] - [pros/cons]\n\n**Recommendation:**\n- [Agent's recommendation with reasoning]\n\n**Impact if not resolved by [date]:**\n- [Consequences]\n\n**Assignee:** Waiting for human decision"
}
```

2. **DO NOT mark as done** - leave status as `in_progress` or `blocked`

3. **Set status to blocked** if actively waiting:
```json
PATCH /api/issues/{issueId}
{
  "status": "blocked",
  "comment": "Waiting for human decision on: [specific question]"
}
```

4. **Tag/notify human** through defined channel (Discord, email, etc.)

### Human Inbox

Create a dedicated inbox/tag for human-required items:
- **Issue tag**: `needs-human` or `human-inbox`
- **Priority**: Always high when human attention is needed
- **Notification**: Alert human through configured channel

### Examples

**❌ WRONG - Marking complete without decision:**
```
Status: done
Comment: "Implemented feature X. Waiting for approval."
```
This is wrong because "waiting for approval" means it's NOT done.

**✅ CORRECT - Marking blocked for decision:**
```
Status: blocked
Comment: "⚠️ HUMAN ATTENTION REQUIRED

Implementation complete for feature X.

**Needs approval:** Deploy to production?
- Option A: Deploy now (risk: low)
- Option B: Wait for testing window (safer)

**Recommendation:** Deploy now - all tests passing.

Assigning to human inbox for decision."
```

---

## Implementation Checklist

- [ ] All agents updated with correct `reportsTo` chain
- [ ] Issue templates include parent-child linking
- [ ] Status transitions trigger notifications
- [ ] Escalation timers configured
- [ ] Communication channels created
- [ ] Reporting templates defined

---

## Next Steps

1. **Verify org structure** in Paperclip matches this document
2. **Create issue templates** for common delegation patterns
3. **Set up automation** for status notifications
4. **Document in AGENTS.md** for agent reference
5. **Test with a real issue** to validate the flow

---

*This protocol is living documentation. Update as the organization evolves.*