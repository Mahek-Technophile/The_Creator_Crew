# Automated Testing with Selenium - The Creator Crew

This directory contains the automated end-to-end Selenium test suite for **The Creator Crew**, mapped directly to the **Use Case Diagram** (`image_f7ffa868.png`).

[![Selenium E2E Test Suite](https://github.com/your-username/the-creator-crew/actions/workflows/selenium-tests.yml/badge.svg)](https://github.com/your-username/the-creator-crew/actions/workflows/selenium-tests.yml)

---

## 4 Ways to Showcase These Tests

### Method 1: In-App Interactive QA Matrix & Live Simulator (Zero Installation)
The web application includes a built-in **QA Test Matrix & Live Simulator** tab accessible at `#/qa`:
- Anyone opening the app can click the **"QA Test Matrix"** tab (with badge `16`).
- **Interactive live simulation**: Click **"Run Live Simulation"** to step through all 16 tests in real time with assertion checklists, timing benchmarks, and terminal logs.
- **Python source inspector**: View and copy the exact Python Selenium code snippet for every test case.
- **1-Click HTML Report Export**: Click **"Export HTML Report"** to download a standalone `.html` test report file.

---

### Method 2: Live Headed Visual Demo (Best for Loom recordings & screen shares)
To showcase the actual automated browser in action (where Google Chrome physically opens on screen, navigates pages, types captions, and clicks buttons automatically):

#### 1. Install dependencies:
```bash
pip install -r tests/requirements.txt
```

#### 2. Run in headed mode (with live stdout output):
```bash
pytest tests/test_creator_crew_selenium.py -v -s
```

#### What spectators see:
- Chrome opens at `http://localhost:3000` (or your deployed URL).
- Toggles permissions and connects the film slate.
- Navigates through the Today dashboard, Ideas filter chips, and Gemini caption generator.
- Switches to the Admin & Team Workspace, invites a Reviewer, approves a draft, submits rework feedback, and executes a draft version rollback.

#### Cinematic Spotlight Runner (Tailored for Loom):
For an enhanced visual recording experience with glowing element spotlights and human-paced typing:
```bash
python tests/run_visual_demo.py
```

---

### Method 3: Standalone HTML Pytest Report (Self-Contained)
Generate an HTML report that can be opened in any web browser or emailed to stakeholders:
```bash
pytest tests/test_creator_crew_selenium.py -v --headless --html=report.html --self-contained-html
```
- Open `report.html` in Chrome/Safari/Firefox to view passing status, execution timings, and metadata.

---

### Method 4: Automated GitHub Actions CI/CD Pipeline (Best for GitHub repositories)
The file `.github/workflows/selenium-tests.yml` is pre-configured in your repository:
- Runs automatically on every push or pull request to `main` / `master`.
- Spins up an Ubuntu Linux runner with Node 20, Python 3.10, and Google Chrome.
- Automatically executes all 16 Selenium tests and attaches `report.html` as a downloadable artifact.
- Provides a green "Passing" build badge on your repository.

#### GitHub README Badge Markdown:
```markdown
[![Selenium E2E Test Suite](https://github.com/<OWNER>/<REPO>/actions/workflows/selenium-tests.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/selenium-tests.yml)
```

---

## Test Cases Breakdown by Actor & Role

The test suite encompasses **16 test cases** categorized across all actors identified in the Use Case Diagram:

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

### Actor Summary:
1. **Creator Side (End-User)**: 9 Use Cases (`TC-01` through `TC-09`)
2. **Admin Side (Team Owner)**: 4 Use Cases (`TC-11`, `TC-12`, `TC-15`, `TC-10`)
3. **Reviewer Side (Editorial Compliance)**: 2 Use Cases (`TC-13`, `TC-14`)
4. **Dual-Role Version Governance (Creator + Admin)**: 1 Use Case (`TC-16`)
