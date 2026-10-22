# Automated Testing with Selenium - The Creator Crew

This directory contains the automated end-to-end Selenium test suite for **The Creator Crew**, mapped directly to the **Use Case Diagram** (`image_f7ffa868.png`).

## Prerequisites
- Python 3.8+
- Google Chrome browser (or Chromium)
- Node.js dev server running on port 3000 (`npm run dev`) or live deployed URL

## Setup
Install Python testing dependencies:
```bash
pip install -r tests/requirements.txt
```

## Running the Tests
To execute all test cases in headless Chrome:
```bash
pytest tests/test_creator_crew_selenium.py -v
```

To run against a deployed Vercel URL:
```bash
APP_URL=https://your-deployment.vercel.app pytest tests/test_creator_crew_selenium.py -v
```

---

## Test Cases Breakdown by Actor & Role

The test suite now encompasses **16 test cases** categorized across the actors identified in the Use Case Diagram:

| # | Test Identifier | Actor / Role | Use Case Diagram Reference |
|---|----------------|--------------|---------------------------|
| **TC-01** | `test_01_landing_and_connect_instagram_slate` | **Creator** | Register & Verify OTP / Connect Clapper Slate |
| **TC-02** | `test_02_today_dashboard_metrics_and_charts` | **Creator** | View Engagement Insights (`<<include>>` Collect Engagement Data) |
| **TC-03** | `test_03_goals_modal_update` | **Creator** | Set Weekly Output & Target Audience Reach Goals |
| **TC-04** | `test_04_ideas_tab_filtering_and_dismiss_undo` | **Creator** | Ideas Engine, Format Filter Chips & Undo Dismissal |
| **TC-05** | `test_05_create_view_caption_generation` | **Creator** | Generate Captions (`<<extend>>` Select Tone, `<<include>>` Style Ranking) |
| **TC-06** | `test_06_schedule_modal_and_calendar_view` | **Creator** | Schedule Post (`<<include>>` Suggest Optimal Time, 7-Day Grid) |
| **TC-07** | `test_07_draft_vault_search_and_management` | **Creator** | Save Draft to Draft Vault (`<<include>>` Auto-Tag Draft) & Delete with Undo |
| **TC-08** | `test_08_results_table_sorting_and_post_modal` | **Creator** | View Engagement Insights (Sort by Reach, Saves, vsAvg & Post Modal) |
| **TC-09** | `test_09_retention_check_curve` | **Creator** | Analyze Attention Span (Reel 0–60s Drop-off Curve & Pacing Advice) |
| **TC-10** | `test_10_gemini_api_key_dialog` | **Admin / Dev** | Configure Real Gemini API Key Connection |
| **TC-11** | `test_11_admin_team_workspace_and_role_switching` | **Admin / Owner** | Admin Workspace Navigation & Dual-Role Context Switching |
| **TC-12** | `test_12_admin_invite_reviewer_and_manage_roster` | **Admin / Owner** | **Invite Reviewer** (Role Delegation & Active Roster Audit) |
| **TC-13** | `test_13_editorial_review_approval_and_audit_log` | **Reviewer** | **Review Draft (Approve)** & Decision Audit Log Insertion |
| **TC-14** | `test_14_editorial_review_request_rework` | **Reviewer** | **Review Draft (Request Rework)** with Custom Editorial Feedback |
| **TC-15** | `test_15_platform_dispatch_and_reminder_controls` | **Admin / Owner** | **Publish Post** (`<<extend>>` **Send Reminder Notification**) |
| **TC-16** | `test_16_draft_versioning_and_revert_history` | **Creator / Admin** | **Search / Revert Draft Versions** (Version History Stack & 1-Click Rollback) |

---

### Actor Summary:
1. **Creator Side (End-User)**: 9 Use Cases (`TC-01` through `TC-09`)
2. **Admin Side (Team Owner)**: 4 Use Cases (`TC-11`, `TC-12`, `TC-15`, `TC-10`)
3. **Reviewer Side (Editorial Compliance)**: 2 Use Cases (`TC-13`, `TC-14`)
4. **Dual-Role Version Governance (Creator + Admin)**: 1 Use Case (`TC-16`)
