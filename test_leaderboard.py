import time
from playwright.sync_api import sync_playwright

def test_leaderboard():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Set viewport to mobile size
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        )
        page = context.new_page()
        page.goto('http://localhost:5173')
        time.sleep(2)

        # Bypass onboarding & profile selector
        page.evaluate("""
            localStorage.setItem('kibo_math_has_onboarded', 'true');
            localStorage.setItem('kibo_math_tier', '1');
            localStorage.setItem('kibo_profiles_data', JSON.stringify({
                activeProfileId: '1',
                profiles: { '1': { id: '1', name: 'Guest', practiceDays: [], hasOnboarded: true } }
            }));
        """)
        page.reload()
        time.sleep(2)

        # Click the profile card to get past the profile selector screen that's still showing
        page.locator('text="Guest"').first.click(force=True)
        time.sleep(2)

        # Click the Leaderboard tab (5th button)
        page.locator('button[title="Leaderboard"]').click(force=True)
        time.sleep(2)

        # Take screenshot of leaderboard modal
        page.screenshot(path='leaderboard_modal_real.png')
        print("Captured leaderboard_modal_real.png")

        browser.close()

if __name__ == "__main__":
    test_leaderboard()
