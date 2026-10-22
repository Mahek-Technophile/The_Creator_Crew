#!/usr/bin/env python3
"""
The Creator Crew - Cinematic Live Headed Visual Demo Runner
===========================================================
Tailored specifically for Loom recordings, client demos, and screen shares.
Physically opens Google Chrome on screen, injects a glowing visual halo around
active elements before clicking/typing, and paces through all Creator, Admin,
and Reviewer workflows with rich narrative console logs.

Usage:
    pip install -r tests/requirements.txt
    python tests/run_visual_demo.py

    # Or to run against a live deployed URL:
    APP_URL=https://your-deployment.vercel.app python tests/run_visual_demo.py
"""

import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = os.environ.get("APP_URL", "http://localhost:3000")
DELAY = float(os.environ.get("DEMO_DELAY", "1.2"))

# ANSI Color codes for styled terminal output
RESET = "\033[0m"
BOLD = "\033[1m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
MAGENTA = "\033[35m"
BLUE = "\033[34m"


def log_scene(num, title, actor):
    print(f"\n{BOLD}{MAGENTA}{'=' * 65}{RESET}")
    print(f"{BOLD}{CYAN}🎬 SCENE {num}: {title}{RESET}")
    print(f"{BOLD}{BLUE}👤 ACTOR / ROLE: {actor}{RESET}")
    print(f"{BOLD}{MAGENTA}{'=' * 65}{RESET}")


def log_step(msg):
    print(f"  {GREEN}▸{RESET} {msg}")


def highlight_element(driver, element, color="#F59E0B", duration=0.6):
    """Draws an animated visual glowing spotlight halo around the target element."""
    try:
        driver.execute_script(
            f"""
            const el = arguments[0];
            el.dataset.prevOutline = el.style.outline || '';
            el.dataset.prevShadow = el.style.boxShadow || '';
            el.style.outline = '3px solid {color}';
            el.style.boxShadow = '0 0 20px {color}';
            el.style.transition = 'all 0.25s ease';
            """,
            element,
        )
        time.sleep(duration)
        driver.execute_script(
            """
            const el = arguments[0];
            el.style.outline = el.dataset.prevOutline || '';
            el.style.boxShadow = el.dataset.prevShadow || '';
            """,
            element,
        )
    except Exception:
        pass


def human_type(element, text, speed=0.04):
    """Types characters one by one for an authentic live typing visual."""
    for char in text:
        element.send_keys(char)
        time.sleep(speed)


def main():
    print(f"\n{BOLD}{GREEN}================================================================={RESET}")
    print(f"{BOLD}{GREEN}   THE CREATOR CREW - LIVE HEADED VISUAL DEMONSTRATION           {RESET}")
    print(f"{BOLD}{GREEN}================================================================={RESET}")
    print(f"{YELLOW}Starting Google Chrome in headed visual mode at:{RESET} {BASE_URL}")
    print(f"{YELLOW}Pacing delay:{RESET} {DELAY}s per step | {YELLOW}Press Ctrl+C to stop{RESET}\n")

    chrome_options = ChromeOptions()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--window-size=1440,900")

    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(6)
    wait = WebDriverWait(driver, 10)

    try:
        # Reset local storage to guarantee pristine film slate start
        driver.get(BASE_URL)
        driver.execute_script("window.localStorage.removeItem('cc-state');")
        driver.get(BASE_URL)
        time.sleep(DELAY)

        # -------------------------------------------------------------
        # SCENE 1: Film Clapper Slate & Social Account Connection
        # -------------------------------------------------------------
        log_scene(1, "Film Clapper Slate & Social Connection", "Creator (Mira)")
        slate = wait.until(EC.presence_of_element_located((By.ID, "slate")))
        highlight_element(driver, slate, color="#3B82F6", duration=0.8)
        log_step("Film clapper slate is armed and ready.")
        time.sleep(DELAY * 0.8)

        connect_btn = driver.find_element(By.ID, "go")
        highlight_element(driver, connect_btn, color="#10B981")
        log_step("Clicking 'Connect Instagram' clapper action button...")
        connect_btn.click()
        time.sleep(DELAY * 0.8)

        allow_btn = wait.until(EC.element_to_be_clickable((By.ID, "allow")))
        highlight_element(driver, allow_btn, color="#F59E0B")
        log_step("Accepting account permissions & verifying sync steps...")
        allow_btn.click()
        time.sleep(DELAY * 1.2)

        # -------------------------------------------------------------
        # SCENE 2: Today Creator Pulse, Metrics & Heatmap
        # -------------------------------------------------------------
        log_scene(2, "Today Creator Pulse, Optimal Slot & Heatmap", "Creator")
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "rail")))
        log_step("Today dashboard loaded for @mira.makes")

        next_slot = driver.find_element(By.CLASS_NAME, "next")
        highlight_element(driver, next_slot, color="#3B82F6")
        log_step("Recommended optimal post window highlighted.")
        time.sleep(DELAY)

        # Toggle 56-day reach chart view
        chip_56 = driver.find_element(By.CSS_SELECTOR, "button.chip[data-r='56']")
        highlight_element(driver, chip_56, color="#10B981")
        log_step("Toggling Reach chart window to 56 Days...")
        chip_56.click()
        time.sleep(DELAY)

        # -------------------------------------------------------------
        # SCENE 3: Ideas Engine & Filtering
        # -------------------------------------------------------------
        log_scene(3, "Ideas Engine, Format Filter Chips & Undo", "Creator")
        ideas_link = driver.find_element(By.CSS_SELECTOR, "nav.nav a[href='#/ideas']")
        highlight_element(driver, ideas_link, color="#F59E0B")
        ideas_link.click()
        time.sleep(DELAY)

        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.item")))
        reel_chip = driver.find_element(By.CSS_SELECTOR, "button.chip[data-f='Reel']")
        highlight_element(driver, reel_chip, color="#8B5CF6")
        log_step("Filtering curated idea recommendations by Reel format...")
        reel_chip.click()
        time.sleep(DELAY)

        # -------------------------------------------------------------
        # SCENE 4: Gemini AI Caption Studio
        # -------------------------------------------------------------
        log_scene(4, "Gemini AI Caption Studio & Tone Selection", "Creator")
        create_link = driver.find_element(By.CSS_SELECTOR, "nav.nav a[href='#/create']")
        highlight_element(driver, create_link, color="#10B981")
        create_link.click()
        time.sleep(DELAY)

        prompt_area = wait.until(EC.visibility_of_element_located((By.ID, "pr")))
        highlight_element(driver, prompt_area, color="#3B82F6")
        prompt_area.clear()
        demo_prompt = "5 morning habits that helped me grow to 20k followers"
        log_step(f"Typing video concept: '{demo_prompt}'")
        human_type(prompt_area, demo_prompt, speed=0.03)
        time.sleep(DELAY * 0.5)

        motivational_chip = driver.find_element(By.CSS_SELECTOR, "button.chip[data-t='Motivational']")
        highlight_element(driver, motivational_chip, color="#F59E0B")
        log_step("Selecting tone modifier: 'Motivational'...")
        motivational_chip.click()
        time.sleep(DELAY * 0.5)

        gen_btn = driver.find_element(By.ID, "gen")
        highlight_element(driver, gen_btn, color="#8B5CF6")
        log_step("Calling Gemini AI Caption Generator...")
        gen_btn.click()
        time.sleep(DELAY * 1.5)

        # Select a generated variant
        variants = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "variant")))
        highlight_element(driver, variants[1], color="#10B981")
        log_step("Selecting variant #2 and applying to studio editor...")
        variants[1].click()
        time.sleep(DELAY)

        save_btn = driver.find_element(By.ID, "sd")
        highlight_element(driver, save_btn, color="#3B82F6")
        log_step("Saving generated copy as new post draft...")
        save_btn.click()
        time.sleep(DELAY)

        # -------------------------------------------------------------
        # SCENE 5: Weekly Calendar Planner
        # -------------------------------------------------------------
        log_scene(5, "Weekly Calendar Planner & Scheduling", "Creator")
        schedule_btn = driver.find_element(By.ID, "sc")
        highlight_element(driver, schedule_btn, color="#F59E0B")
        schedule_btn.click()
        time.sleep(DELAY * 0.6)

        confirm_btn = wait.until(EC.element_to_be_clickable((By.ID, "sok")))
        highlight_element(driver, confirm_btn, color="#10B981")
        log_step("Scheduling draft for optimal timeslot...")
        confirm_btn.click()
        time.sleep(DELAY * 1.2)

        # -------------------------------------------------------------
        # SCENE 6: Admin Workspace & Inviting Reviewer
        # -------------------------------------------------------------
        log_scene(6, "Admin Workspace, Role Switcher & Team Invites", "Team Owner / Admin")
        team_link = driver.find_element(By.CSS_SELECTOR, "nav.nav a[href='#/team']")
        highlight_element(driver, team_link, color="#3B82F6")
        team_link.click()
        time.sleep(DELAY)

        # Ensure Team Owner
        owner_btn = driver.find_element(By.ID, "role-owner-btn")
        highlight_element(driver, owner_btn, color="#8B5CF6")
        owner_btn.click()
        log_step("Operating as Team Owner (Admin)...")
        time.sleep(DELAY * 0.6)

        email_input = driver.find_element(By.ID, "invite-email")
        highlight_element(driver, email_input, color="#F59E0B")
        email_input.clear()
        demo_invite = "sarah.compliance@creatorcrew.io"
        log_step(f"Inviting compliance specialist: {demo_invite}")
        human_type(email_input, demo_invite, speed=0.03)

        role_select = Select(driver.find_element(By.ID, "invite-role"))
        role_select.select_by_value("REVIEWER")
        time.sleep(DELAY * 0.4)

        invite_btn = driver.find_element(By.ID, "invite-submit")
        highlight_element(driver, invite_btn, color="#10B981")
        invite_btn.click()
        log_step("Invitation dispatched! Team roster synchronized.")
        time.sleep(DELAY * 1.2)

        # -------------------------------------------------------------
        # SCENE 7: Editorial Review & Rework Feedback
        # -------------------------------------------------------------
        log_scene(7, "Reviewer Queue & Editorial Rework Feedback", "Reviewer (Agency Lead)")
        reviewer_btn = driver.find_element(By.ID, "role-reviewer-btn")
        highlight_element(driver, reviewer_btn, color="#EC4899")
        log_step("Switching active session role to 'Reviewer'...")
        reviewer_btn.click()
        time.sleep(DELAY * 0.8)

        tab_queue = driver.find_element(By.ID, "tab-queue")
        highlight_element(driver, tab_queue, color="#3B82F6")
        tab_queue.click()
        time.sleep(DELAY * 0.8)

        # Submit rework notes on pending draft
        rework_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[id^='review-rework-']"))
        )
        draft_parent = rework_btn.find_element(By.XPATH, "./ancestor::div[@data-draft-id]")
        note_input = draft_parent.find_element(By.TAG_NAME, "input")
        highlight_element(driver, note_input, color="#F59E0B")
        note_input.clear()
        rework_feedback = "Please add a bolder 3-second hook before final scheduling."
        log_step(f"Typing feedback note: '{rework_feedback}'")
        human_type(note_input, rework_feedback, speed=0.03)
        time.sleep(DELAY * 0.5)

        highlight_element(driver, rework_btn, color="#EF4444")
        log_step("Requesting rework with editorial feedback...")
        rework_btn.click()
        time.sleep(DELAY * 1.2)

        # -------------------------------------------------------------
        # SCENE 8: Draft Approval & Audit Log
        # -------------------------------------------------------------
        log_scene(8, "Draft Approval & Decision Audit Log", "Reviewer")
        approve_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[id^='review-approve-']"))
        )
        highlight_element(driver, approve_btn, color="#10B981")
        log_step("Approving next draft in review queue...")
        approve_btn.click()
        time.sleep(DELAY)

        tab_audit = driver.find_element(By.ID, "tab-audit")
        highlight_element(driver, tab_audit, color="#3B82F6")
        tab_audit.click()
        time.sleep(DELAY)

        audit_tbody = wait.until(EC.presence_of_element_located((By.ID, "audit-log-tbody")))
        highlight_element(driver, audit_tbody, color="#10B981")
        log_step("Decision Audit Log shows real-time timestamped approval & role.")
        time.sleep(DELAY * 1.5)

        # -------------------------------------------------------------
        # SCENE 9: Draft Version History & 1-Click Rollback
        # -------------------------------------------------------------
        log_scene(9, "Draft Version History & 1-Click Rollback", "Creator / Admin")
        vault_link = driver.find_element(By.CSS_SELECTOR, "nav.nav a[href='#/vault']")
        highlight_element(driver, vault_link, color="#8B5CF6")
        vault_link.click()
        time.sleep(DELAY)

        history_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-h]"))
        )
        highlight_element(driver, history_btn, color="#3B82F6")
        log_step("Opening draft version history modal...")
        history_btn.click()
        time.sleep(DELAY)

        wait.until(EC.presence_of_element_located((By.ID, "version-history-dlg")))
        revert_buttons = driver.find_elements(By.CSS_SELECTOR, "button[id^='revert-v-']")
        if revert_buttons:
            highlight_element(driver, revert_buttons[0], color="#F59E0B")
            log_step("Reverting draft to previous clean version...")
            revert_buttons[0].click()
            time.sleep(DELAY * 1.2)

        print(f"\n{BOLD}{GREEN}{'=' * 65}{RESET}")
        print(f"{BOLD}{GREEN}🎉 LIVE VISUAL DEMO COMPLETE! ALL SCENES RECORDED SUCCESSFULLY.{RESET}")
        print(f"{BOLD}{GREEN}{'=' * 65}{RESET}\n")

    except KeyboardInterrupt:
        print(f"\n{YELLOW}Demo interrupted by user.{RESET}")
    except Exception as e:
        print(f"\n{BOLD}\033[31mError during visual demo: {e}{RESET}")
        raise
    finally:
        time.sleep(1.5)
        driver.quit()


if __name__ == "__main__":
    main()
