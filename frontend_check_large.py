from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock storage to bypass onboarding
        page.add_init_script("""
            localStorage.setItem('kibo_math_has_onboarded', 'true');
            localStorage.setItem('kibo_math_tier', '1');
            sessionStorage.setItem('kibo_parent_authenticated', 'true');
        """)

        # 1. Very wide desktop test
        page.set_viewport_size({"width": 1400, "height": 900})
        page.goto('http://localhost:3000/')
        time.sleep(2)
        page.screenshot(path='frontend_wide_test.png', full_page=True)

        # It's intercepting events from Profile selector. Wait for it and click it.
        try:
            # Let's see if we are in profile selector
            page.click('button:has-text("Kibo Climber")', timeout=5000)
            time.sleep(2)
        except:
            pass

        page.screenshot(path='frontend_wide_test2.png', full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_frontend()
