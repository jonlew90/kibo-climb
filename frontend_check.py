from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="./",
            record_video_size={"width": 375, "height": 667}
        )
        page = context.new_page()
        page.set_viewport_size({"width": 375, "height": 667})

        page.goto('http://localhost:3000/')
        time.sleep(1)

        # Bypass modals
        page.evaluate("""
            localStorage.setItem('kibo_math_has_onboarded', 'true');
            localStorage.setItem('kibo_math_tier', '1');
            sessionStorage.setItem('kibo_parent_authenticated', 'true');
        """)

        page.reload()
        time.sleep(2)  # Wait for app to render

        # Need to click the profile card to get to the main view
        page.evaluate("""
            const card = document.querySelector('h3');
            if (card) card.click();
        """)
        time.sleep(2)

        page.screenshot(path='frontend_nav_test_main.png')
        print("Screenshot saved to frontend_nav_test_main.png")

        context.close()
        browser.close()

verify_frontend()
