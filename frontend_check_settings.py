import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("http://localhost:5173")

        # Inject active profile to bypass Profile Selector
        await page.evaluate("""
            localStorage.setItem('kibo_profiles_data', JSON.stringify({
                activeProfileId: '1',
                profiles: { '1': { id: '1', name: 'Guest', practiceDays: [], hasOnboarded: true } }
            }));
            localStorage.setItem('kibo_math_has_onboarded', 'true');
            localStorage.setItem('kibo_math_tier', '1');
            localStorage.setItem('kibo_math_sparks', '100');
        """)
        await page.reload()

        await page.wait_for_timeout(2000)

        profile_button = page.locator("text='Guest'")
        if await profile_button.is_visible():
            await profile_button.click(force=True)
            await page.wait_for_timeout(2000)

        # Click on Settings button in the footer, force=True
        settings_button = page.locator("button[aria-label='Settings']")
        await settings_button.click(force=True)

        await page.wait_for_timeout(1000)

        # Take a screenshot
        await page.screenshot(path="frontend_settings.png")
        await browser.close()

asyncio.run(main())
