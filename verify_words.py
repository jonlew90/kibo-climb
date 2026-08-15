import os
import glob
import re
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Bypass the first launch onboarding by setting local storage
    page.evaluate("localStorage.setItem('kibo_math_has_onboarded', 'true')")
    page.evaluate("localStorage.setItem('kibo_math_tier', '1')")

    # Active profile bypass
    page.evaluate("localStorage.setItem('kibo_profiles_data', JSON.stringify({ activeProfileId: '1', profiles: {'1': { id: '1', name: 'Tester', userData: { adaptiveCompetenceRating: 1000 } }} }))")
    page.reload()
    page.wait_for_timeout(2000)

    # Click the tester card
    try:
        page.locator(".border-amber-400").first.click(force=True, timeout=2000)
    except:
        page.evaluate("""
           const cards = Array.from(document.querySelectorAll('div'));
           const testerCard = cards.find(c => c.textContent.includes('Tester') && c.textContent.includes('ACTIVE'));
           if (testerCard) testerCard.click();
        """)
    page.wait_for_timeout(1000)

    # Try injecting activeSubject into local storage
    page.evaluate("""
       document.querySelector('button[title="Subject Selector"]')?.click();
    """)
    page.wait_for_timeout(500)

    page.evaluate("""
       const spans = Array.from(document.querySelectorAll('span'));
       const wordsSpan = spans.find(s => s.textContent === 'Kibo Words');
       if (wordsSpan) {
           wordsSpan.closest('button').click();
       }
    """)
    page.wait_for_timeout(1000)

    # Start the climb
    try:
        page.get_by_role("button", name=re.compile("START CLIMB")).click(force=True, timeout=3000)
    except:
        page.evaluate("""
           const buttons = Array.from(document.querySelectorAll('button'));
           const startBtn = buttons.find(b => b.textContent.includes('START CLIMB'));
           if (startBtn) startBtn.click();
        """)
    page.wait_for_timeout(1000)

    # Try to press a key
    page.keyboard.press("c")
    page.wait_for_timeout(500)
    page.keyboard.press("a")
    page.wait_for_timeout(500)
    page.keyboard.press("t")
    page.wait_for_timeout(500)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
