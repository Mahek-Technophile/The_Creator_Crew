"""
The Creator Crew - Automated Selenium Test Suite
Tests all features: Connect flow, Today dashboard, Ideas filter/undo,
Create with Gemini caption generator, Calendar scheduling, Draft Vault,
Results table sorting, Retention curve, and Gemini API Key configuration.

Usage:
    pip install -r tests/requirements.txt
    pytest tests/test_creator_crew_selenium.py -v
"""

import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = os.environ.get("APP_URL", "http://localhost:3000")


@pytest.fixture(scope="module")
def driver(request):
    """Setup Chrome WebDriver for test execution (headed by default for live visual demo, headless for CI)."""
    is_headless = False
    try:
        is_headless = request.config.getoption("--headless")
    except Exception:
        pass
    if not is_headless:
        is_headless = os.environ.get("HEADLESS", "false").lower() in ("true", "1", "yes")

    chrome_options = ChromeOptions()
    if is_headless:
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
    else:
        # In headed demo mode, maximize window and suppress browser alerts
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-notifications")

    chrome_options.add_argument("--window-size=1440,900")

    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(6)

    try:
        slowmo = float(request.config.getoption("--slowmo"))
    except Exception:
        slowmo = float(os.environ.get("SLOWMO", "0.2"))
    setattr(driver, "_slowmo", slowmo)

    yield driver

    driver.quit()



class TestCreatorCrewSelenium:

    def test_01_landing_and_connect_instagram_slate(self, driver):
        """TC-01: Verify film clapper slate connect flow and sync steps."""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)

        # Clear any stored state in localStorage to ensure clean start
        driver.execute_script("window.localStorage.removeItem('cc-state');")
        driver.get(BASE_URL)

        # Confirm landing page content
        wait.until(EC.presence_of_element_located((By.ID, "slate")))
        assert "See what works. Post what's next." in driver.page_source

        # Click "Connect Instagram"
        connect_btn = wait.until(EC.element_to_be_clickable((By.ID, "go")))
        connect_btn.click()

        # Permission modal appears
        allow_btn = wait.until(EC.element_to_be_clickable((By.ID, "allow")))
        assert "Allow The Creator Crew to access" in driver.page_source
        allow_btn.click()

        # Verify slate transitions and navigates to Today dashboard
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "rail")))
        assert "#/today" in driver.current_url or "today" in driver.current_url
        assert "@mira.makes" in driver.page_source

    def test_02_today_dashboard_metrics_and_charts(self, driver):
        """TC-02: Check Today metrics, optimal slot, reach chart, and follower heatmap."""
        wait = WebDriverWait(driver, 10)

        # Header greeting
        header = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
        assert "Mira" in header.text

        # Optimal post recommendation box
        next_box = driver.find_element(By.CLASS_NAME, "next")
        assert "Post next:" in next_box.text

        # Reach per day SVG chart presence and 28/56 days toggle
        svg_chart = driver.find_element(By.ID, "line")
        assert svg_chart is not None

        chip_56 = driver.find_element(By.CSS_SELECTOR, "button.chip[data-r='56']")
        chip_56.click()
        time.sleep(0.5)
        assert chip_56.get_attribute("aria-pressed") == "true"

        # Heatmap grid
        heatmap = driver.find_element(By.CLASS_NAME, "heat")
        assert heatmap is not None
        assert "Mon" in heatmap.text

        # Top posts sheet cards
        top_posts = driver.find_elements(By.CLASS_NAME, "sheet")
        assert len(top_posts) >= 3

    def test_03_goals_modal_update(self, driver):
        """TC-03: Open goals modal, update values, and save."""
        wait = WebDriverWait(driver, 10)

        edit_goals_btn = wait.until(EC.element_to_be_clickable((By.ID, "eg")))
        edit_goals_btn.click()

        # Modal inputs
        gw_input = wait.until(EC.visibility_of_element_located((By.ID, "gw")))
        gw_input.clear()
        gw_input.send_keys("5")

        gr_input = driver.find_element(By.ID, "gr")
        gr_input.clear()
        gr_input.send_keys("150000")

        save_goals_btn = driver.find_element(By.ID, "gs")
        save_goals_btn.click()

        # Verify toast
        toast = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "toast")))
        assert "Goals saved" in toast.text

    def test_04_ideas_tab_filtering_and_dismiss_undo(self, driver):
        """TC-04: Navigate to Ideas tab, filter formats, dismiss idea, and undo."""
        wait = WebDriverWait(driver, 10)

        # Navigate to Ideas
        ideas_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/ideas']")))
        try:
            ideas_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", ideas_link)

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.item")))

        # Filter by Reels
        reel_chip = driver.find_element(By.CSS_SELECTOR, "button.chip[data-f='Reel']")
        reel_chip.click()
        time.sleep(0.4)

        # Count items and dismiss one
        dismiss_btns = driver.find_elements(By.CSS_SELECTOR, "button[data-no]")
        if dismiss_btns:
            initial_count = len(driver.find_elements(By.CLASS_NAME, "item"))
            dismiss_btns[0].click()

            # Undo toast appears
            toast = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "toast")))
            assert "Idea removed" in toast.text

            undo_btn = driver.find_element(By.ID, "undo")
            undo_btn.click()
            time.sleep(0.5)

            restored_count = len(driver.find_elements(By.CLASS_NAME, "item"))
            assert restored_count == initial_count

    def test_05_create_view_caption_generation(self, driver):
        """TC-05: Create view: enter prompt, select tone, generate captions, save draft."""
        wait = WebDriverWait(driver, 10)

        # Navigate to Create
        create_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/create']")))
        try:
            create_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", create_link)

        prompt_area = wait.until(EC.visibility_of_element_located((By.ID, "pr")))
        prompt_area.clear()
        prompt_area.send_keys("5 morning habits that helped me grow to 20k followers")

        # Select tone chip: "Motivational"
        motivational_chip = driver.find_element(By.CSS_SELECTOR, "button.chip[data-t='Motivational']")
        motivational_chip.click()
        assert motivational_chip.get_attribute("aria-pressed") == "true"

        # Generate captions
        gen_btn = driver.find_element(By.ID, "gen")
        gen_btn.click()

        # Wait for variants to appear
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "variant")))
        variants = driver.find_elements(By.CLASS_NAME, "variant")
        assert len(variants) >= 3

        # Click second variant
        variants[1].click()

        # Check caption textarea is populated
        caption_area = driver.find_element(By.ID, "ct")
        assert len(caption_area.get_attribute("value")) > 10

        # Save draft
        save_draft_btn = driver.find_element(By.ID, "sd")
        save_draft_btn.click()

        toast = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "toast")))
        assert "Draft saved" in toast.text

    def test_06_schedule_modal_and_calendar_view(self, driver):
        """TC-06: Schedule draft through Schedule modal and verify on Calendar."""
        wait = WebDriverWait(driver, 10)

        # Click Schedule button from Create screen
        schedule_btn = driver.find_element(By.ID, "sc")
        schedule_btn.click()

        # Schedule modal opens
        wait.until(EC.presence_of_element_located((By.ID, "ssl")))
        confirm_schedule_btn = driver.find_element(By.ID, "sok")
        confirm_schedule_btn.click()

        # Navigates to Calendar
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "cal")))
        assert "Calendar" in driver.page_source

        # Scheduled post cell visible
        scheduled_cells = driver.find_elements(By.CSS_SELECTOR, "button.cell.set")
        assert len(scheduled_cells) >= 1

    def test_07_draft_vault_search_and_management(self, driver):
        """TC-07: Navigate to Draft Vault, search drafts, and test delete with undo."""
        wait = WebDriverWait(driver, 10)

        vault_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/vault']")))
        try:
            vault_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", vault_link)

        if "#/vault" not in driver.current_url:
            driver.execute_script("window.location.hash = '#/vault';")
        time.sleep(0.4)

        search_input = wait.until(EC.visibility_of_element_located((By.ID, "vs")))
        search_input.clear()
        search_input.send_keys("morning")
        time.sleep(0.4)

        # Verify matched drafts
        items = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "item")))
        assert len(items) >= 1

        # Clear search input completely and trigger synthetic React input events
        search_input.click()
        search_input.send_keys(Keys.CONTROL + "a", Keys.BACKSPACE)
        driver.execute_script(
            """
            var input = arguments[0];
            var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(input, '');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            search_input,
        )

        # Explicitly wait until the search is cleared and all drafts (at least 3) are rendered
        wait.until(lambda d: len(d.find_elements(By.CLASS_NAME, "item")) >= 3)
        time.sleep(0.3)

        # Test delete draft with undo
        initial_items = driver.find_elements(By.CLASS_NAME, "item")
        initial_count = len(initial_items)
        assert initial_count >= 3

        delete_btns = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "button[data-d]")))
        try:
            delete_btns[0].click()
        except Exception:
            driver.execute_script("arguments[0].click();", delete_btns[0])

        toast = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "toast")))
        assert "Draft deleted" in toast.text

        # Wait until the item count is decremented
        wait.until(lambda d: len(d.find_elements(By.CLASS_NAME, "item")) == initial_count - 1)

        undo_btn = wait.until(EC.element_to_be_clickable((By.ID, "undo")))
        try:
            undo_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", undo_btn)

        # Wait until restored count matches initial count
        wait.until(lambda d: len(d.find_elements(By.CLASS_NAME, "item")) == initial_count)
        restored_count = len(driver.find_elements(By.CLASS_NAME, "item"))
        assert restored_count == initial_count

    def test_08_results_table_sorting_and_post_modal(self, driver):
        """TC-08: Check Results table sorting and detailed post breakdown modal."""
        wait = WebDriverWait(driver, 10)

        results_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/results']")))
        try:
            results_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", results_link)

        wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))

        # Test sorting by clicking "Reach" column button
        reach_sort_btn = driver.find_element(By.CSS_SELECTOR, "button[data-s='reach']")
        reach_sort_btn.click()
        time.sleep(0.4)

        # Click first row to open detail modal
        first_row = driver.find_element(By.CSS_SELECTOR, "tbody tr")
        first_row.click()

        # Modal appears with metric breakdown
        wait.until(EC.presence_of_element_located((By.ID, "mm")))
        assert "What stood out:" in driver.page_source

        # Close modal
        close_btn = driver.find_element(By.ID, "cl")
        close_btn.click()
        time.sleep(0.3)

    def test_09_retention_check_curve(self, driver):
        """TC-09: Retention check view: inspect Reel retention curve and tips."""
        wait = WebDriverWait(driver, 10)

        retention_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/retention']")))
        try:
            retention_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", retention_link)

        wait.until(EC.presence_of_element_located((By.ID, "rsv")))

        # Verify retention SVG curve elements
        chart_svg = driver.find_element(By.ID, "rsv")
        assert chart_svg is not None
        svg_content = chart_svg.get_attribute("textContent") or driver.page_source
        assert "Biggest drop" in svg_content

        # Select different Reel from dropdown
        reel_select = Select(driver.find_element(By.ID, "rs"))
        if len(reel_select.options) > 1:
            reel_select.select_by_index(1)
            time.sleep(0.4)
            assert "What to change" in driver.page_source

    def test_10_gemini_api_key_dialog(self, driver):
        """TC-10: Open API key configuration modal, test input, and close."""
        wait = WebDriverWait(driver, 10)

        # Click API key launcher in sidebar
        api_key_btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[title='Configure Gemini API key']")))
        try:
            api_key_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", api_key_btn)

        # Modal opens
        key_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        assert "Gemini API Connection" in driver.page_source

        # Test entering an API key
        key_input.clear()
        key_input.send_keys("AIzaSyFakeKeyForTestingSelenium12345")

        # Save key
        save_btn = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[@id='save-key-btn' or contains(text(), 'Save Key') or contains(text(), 'Save Configuration')]")
            )
        )
        try:
            save_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", save_btn)
        time.sleep(0.4)

        # Verify key was stored
        stored_key = driver.execute_script("return window.localStorage.getItem('cc_gemini_api_key');")
        assert stored_key == "AIzaSyFakeKeyForTestingSelenium12345"

        # Close modal if still visible
        close_btns = driver.find_elements(By.XPATH, "//button[@id='close-api-dialog-btn' or contains(text(), 'Close') or contains(text(), '✕')]")
        if close_btns:
            try:
                driver.execute_script("arguments[0].click();", close_btns[0])
                time.sleep(0.3)
            except Exception:
                pass

    def test_11_admin_team_workspace_and_role_switching(self, driver):
        """TC-11: Admin Side: Open Admin & Team workspace, verify tabs and switch active roles."""
        wait = WebDriverWait(driver, 10)

        # Click Admin & Team in rail navigation
        team_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/team']")))
        try:
            team_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", team_link)

        if "#/team" not in driver.current_url:
            driver.execute_script("window.location.hash = '#/team';")
        time.sleep(0.5)

        team_view = wait.until(EC.presence_of_element_located((By.ID, "admin-team-view")))
        # Check that Admin & Team view rendered (handling HTML entity differences between text and page_source)
        assert "Admin" in team_view.text and "Team" in team_view.text
        assert ("Admin & Team" in team_view.text or "Admin &amp; Team" in driver.page_source or "Admin & Team" in driver.page_source)

        # Test role switching between Team Owner and Reviewer
        reviewer_btn = wait.until(EC.element_to_be_clickable((By.ID, "role-reviewer-btn")))
        try:
            reviewer_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", reviewer_btn)
        time.sleep(0.4)

        owner_btn = wait.until(EC.element_to_be_clickable((By.ID, "role-owner-btn")))
        try:
            owner_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", owner_btn)
        time.sleep(0.4)

    def test_12_admin_invite_reviewer_and_manage_roster(self, driver):
        """TC-12: Admin / Team Owner: Invite Reviewer with assigned role and verify roster update."""
        wait = WebDriverWait(driver, 10)

        # Ensure on team roster sub-tab
        tab_team = wait.until(EC.element_to_be_clickable((By.ID, "tab-team")))
        tab_team.click()
        time.sleep(0.4)

        # Ensure active role is Team Owner
        owner_btn = wait.until(EC.element_to_be_clickable((By.ID, "role-owner-btn")))
        owner_btn.click()
        time.sleep(0.3)

        # Count initial members
        initial_roster = driver.find_elements(By.CSS_SELECTOR, "#roster-list > div")
        initial_count = len(initial_roster)

        # Fill invitation form
        email_input = wait.until(EC.visibility_of_element_located((By.ID, "invite-email")))
        email_input.clear()
        email_input.send_keys("lead.reviewer@agency.com")

        role_select = Select(driver.find_element(By.ID, "invite-role"))
        role_select.select_by_value("REVIEWER")

        # Submit invitation
        submit_btn = wait.until(EC.element_to_be_clickable((By.ID, "invite-submit")))
        submit_btn.click()
        time.sleep(0.5)

        # Verify new member appears in roster
        new_roster = driver.find_elements(By.CSS_SELECTOR, "#roster-list > div")
        assert len(new_roster) == initial_count + 1
        assert "lead.reviewer@agency.com" in driver.page_source

    def test_13_editorial_review_approval_and_audit_log(self, driver):
        """TC-13: Reviewer Side: Inspect draft in Review Queue, approve it, and verify Decision Audit Log."""
        wait = WebDriverWait(driver, 10)

        # Switch to Reviewer role
        reviewer_btn = wait.until(EC.element_to_be_clickable((By.ID, "role-reviewer-btn")))
        reviewer_btn.click()
        time.sleep(0.3)

        # Open Review Queue sub-tab
        tab_queue = wait.until(EC.element_to_be_clickable((By.ID, "tab-queue")))
        tab_queue.click()
        time.sleep(0.4)

        # Find first pending draft approve button
        approve_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[id^='review-approve-']"))
        )
        approve_btn.click()
        time.sleep(0.5)

        # Switch to Decision Audit Log sub-tab
        tab_audit = wait.until(EC.element_to_be_clickable((By.ID, "tab-audit")))
        tab_audit.click()
        time.sleep(0.4)

        # Confirm audit log records the approval
        audit_tbody = wait.until(EC.presence_of_element_located((By.ID, "audit-log-tbody")))
        assert "APPROVED" in audit_tbody.text

    def test_14_editorial_review_request_rework(self, driver):
        """TC-14: Reviewer Side: Request rework on draft with custom editorial feedback note."""
        wait = WebDriverWait(driver, 10)

        # Go to Review Queue
        tab_queue = wait.until(EC.element_to_be_clickable((By.ID, "tab-queue")))
        tab_queue.click()
        time.sleep(0.4)

        # Find rework button on any draft
        rework_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[id^='review-rework-']"))
        )
        draft_parent = rework_btn.find_element(By.XPATH, "./ancestor::div[@data-draft-id]")
        draft_id = draft_parent.get_attribute("data-draft-id")

        # Type feedback notes in input
        note_input = draft_parent.find_element(By.TAG_NAME, "input")
        note_input.clear()
        note_input.send_keys("Please include a clearer hook and call to action.")

        rework_btn.click()
        time.sleep(0.5)

        # Confirm toast and rework status badge
        assert "REWORK" in driver.page_source

    def test_15_platform_dispatch_and_reminder_controls(self, driver):
        """TC-15: Admin / Team Owner: Configure social platform dispatch and reminder notification mode."""
        wait = WebDriverWait(driver, 10)

        # Ensure Team Owner role
        owner_btn = wait.until(EC.element_to_be_clickable((By.ID, "role-owner-btn")))
        owner_btn.click()
        time.sleep(0.3)

        # Switch to Platform Dispatch sub-tab
        tab_dispatch = wait.until(EC.element_to_be_clickable((By.ID, "tab-dispatch")))
        tab_dispatch.click()
        time.sleep(0.4)

        # Verify platform cards are displayed
        assert "Instagram" in driver.page_source
        assert "TikTok" in driver.page_source

        # Toggle "Require Reviewer Approval"
        req_approval_toggle = wait.until(EC.presence_of_element_located((By.ID, "toggle-require-approval")))
        driver.execute_script("arguments[0].click();", req_approval_toggle)
        time.sleep(0.3)

        # Toggle "Send Reminder Notification instead of Direct Auto-Publish"
        reminder_toggle = wait.until(EC.presence_of_element_located((By.ID, "toggle-reminder-mode")))
        driver.execute_script("arguments[0].click();", reminder_toggle)
        time.sleep(0.4)

        assert "Brand governance settings saved" in driver.page_source or "saved" in driver.page_source

    def test_16_draft_versioning_and_revert_history(self, driver):
        """TC-16: Creator / Admin: Inspect draft version history stack and perform 1-click reversion."""
        wait = WebDriverWait(driver, 10)

        # Navigate to Draft Vault
        vault_link = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "nav.nav a[href='#/vault']")))
        try:
            vault_link.click()
        except Exception:
            driver.execute_script("arguments[0].click();", vault_link)
        time.sleep(0.4)

        # Find first draft with a "History" button
        history_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-h]"))
        )
        history_btn.click()
        time.sleep(0.4)

        # Verify version history modal opened
        wait.until(EC.presence_of_element_located((By.ID, "version-history-dlg")))
        assert "Version History" in driver.page_source

        # If an earlier version exists with a revert button, click it
        revert_buttons = driver.find_elements(By.CSS_SELECTOR, "button[id^='revert-v-']")
        if revert_buttons:
            revert_buttons[0].click()
            time.sleep(0.5)
            # Verify toast confirmed reversion
            assert "Reverted draft" in driver.page_source

