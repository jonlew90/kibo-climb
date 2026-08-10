import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the app
        await page.goto("http://localhost:5173")

        # Wait for a little bit to ensure client code runs
        await page.wait_for_timeout(1000)

        # Setup guest profile and enable mock biometrics in localStorage
        await page.evaluate("""
            localStorage.setItem('kibo_profiles_data', JSON.stringify({
                activeProfileId: '1',
                profiles: { '1': { id: '1', name: 'Guest', practiceDays: [], hasOnboarded: true } }
            }));
            localStorage.setItem('kibo_math_has_onboarded', 'true');
            localStorage.setItem('kibo_mock_biometric', 'true');
            localStorage.setItem('kibo_parent_account_schema', JSON.stringify({
                pin: '1234'
            }));
            localStorage.removeItem('kibo_parent_gate_lockout');
        """)
        await page.reload()
        await page.wait_for_timeout(2000)

        await page.evaluate("""
          window.dispatchEvent(new CustomEvent('open-pin-gate', {
            detail: {
              onSuccess: () => {
                const event = new CustomEvent('parent-dashboard-opened');
                window.dispatchEvent(event);
                console.log('Opened');
              }
            }
          }))
        """)

        await page.wait_for_timeout(2000)

        await page.screenshot(path="verification_mock_biometric.png")
        print("Captured verification_mock_biometric.png")

        await browser.close()

asyncio.run(verify())
